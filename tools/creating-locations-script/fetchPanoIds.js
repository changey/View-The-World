/***
 * usage: 
 * 
 * change the bottom of your main.js to something like:

  require([
   'extensions',
   '../tools/creating-locations-script/fetchPanoIds'
   ], function(extensions, PostcardCollector) {
    new PostcardCollector();
  });

 *
 * the result will then be loggged in the console.
 * 
 */

define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , LocationsJson = require('text!async!../../../../tourLocationSets.json')
    , _ = require('underscore')
    , $ = require('jquery');

  var threadWaitCount = 0;
  return Backbone.View.extend({
    initialize: function(){
      var locationSets = $.parseJSON(LocationsJson);
      _.each(locationSets, _.bind(function(locationSet){
        _.each(locationSet, _.bind(function(location){
          location.photoSphereIds=[];
          this.fetchStreetViewPhotosForLocation(location);
        }, this));
      }, this));
      
      function printResult(){
        if(threadWaitCount == 0){
          console.log(JSON.stringify(locationSets, null, ' '));
        } else {
          setTimeout(printResult, 200);
        }
      }
      
      setTimeout(printResult, 100);
    },
    
    fetchStreetViewPhotosForLocation: function(location){

      var googleCoords = new google.maps.LatLng(location.latitude, location.longitude);
      var webService = new google.maps.StreetViewService();
      
      var radiusMeters = 50;

      threadWaitCount += 1;
      (_.bind(getStreetViewNear, this))(googleCoords, radiusMeters, location, 2);

      function fetchNextPostcards(coordinatesCenter, radiusSearchedMeters, keepSearching, location) {
        var angle;

        var maxAngle = 2 * Math.PI;
        var angleFraction = Math.PI / 4;
        threadWaitCount += Math.floor(maxAngle/angleFraction);
        
        for(angle = 0; angle < maxAngle; angle += angleFraction){
          var latLng = getLatLon(coordinatesCenter, radiusSearchedMeters, angle);

//          var realDistance = measure(coordinatesCenter.lat(), coordinatesCenter.lng(), latLng.lat(), latLng.lng());
//          console.log('attemptedDistance:', radiusSearchedMeters*2, 'realDistance:', realDistance);
          (_.bind(getStreetViewNear, this))(latLng, radiusSearchedMeters, location, keepSearching - 1);
        }

        function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
          var R = 6378.137; // Radius of earth in KM
          var dLat = (lat2 - lat1) * Math.PI / 180;
          var dLon = (lon2 - lon1) * Math.PI / 180;
          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          var d = R * c;
          return d * 1000; // meters
        }

        function getLatLon(currentLatLon, distanceMeters, angleRadians){
          var newLat, newLng;
          var meterToLatLng = 1 / 101200;
          var distanceLatLng = distanceMeters * meterToLatLng;
          newLat = currentLatLon.lat() + Math.sin(angleRadians) * distanceLatLng;
          newLng = currentLatLon.lng() + Math.cos(angleRadians) * distanceLatLng;

          return new google.maps.LatLng(newLat, newLng);
        }
      }
      
      function getStreetViewNear(coordinates, radiusMeters, location, keepSearching){
        webService.getPanoramaByLocation(coordinates, radiusMeters , _.bind(panoramaCallback, this, location));
        function panoramaCallback(location, panoData){
          if(panoData){

            var photoSphereId = panoData.location.pano;
            if(!_.contains(location.photoSphereIds, photoSphereId))
            {
              location.photoSphereIds.push(photoSphereId);
            }

            threadWaitCount --;
            
            if(keepSearching){
              (_.bind(fetchNextPostcards, this))(coordinates, radiusMeters, keepSearching - 1, location);
            }
          } else {
            console.log('retry radius:' + radiusMeters);
            getStreetViewNear(coordinates, radiusMeters*2, location, keepSearching);
          }
        }
      }
    }
  });
});
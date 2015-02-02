define(function(require) {
  'use strict';

  require('googleMapsLoader');

  var _         = require('underscore')
    , Backbone  = require('backbone')
    , EventBus  = require('eventBus')
    , ActiveStepModel = require('models/activeStep');

  ViewTheWorld.GoogleMap = Backbone.View.extend({
    el: "#map-canvas",
    
    initialize: function(options) {
      this.activeStepModel = options.activeStepModel || new ActiveStepModel();
    },

    initMap: function() {
      var mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        disableDefaultUI: true
      };

      this.map = new google.maps.Map(this.$el[0], mapOptions);
      this.map.setTilt(45);

      google.maps.event.addListener(this.map, 'dragstart', function() {
        EventBus.trigger('hideGeocompletePopup');
        EventBus.trigger('hideLargePopup');
        EventBus.trigger('pauseTour');
      });

      google.maps.event.addListener(this.map, 'click', function() {
        EventBus.trigger('hideGeocompletePopup');
        EventBus.trigger('hideLargePopup');
      });

      google.maps.event.addListener(this.map, 'tilt_changed', _.bind(function() {
        this.trigger('tilt_changed');
      }, this));

      google.maps.event.addListener(this.map, 'idle', _.bind(function() {
        $('#map-canvas').addClass('image-loaded');
      }, this));


      if(this.unvisitedCoordinates) {
        this.goToCoordinates(this.getAddressCoordinates());
      }
    },

    render: function() {
      this.$el.show();
      this.initMap();
      if (this.activeStepModel.get('step') === 2) {
        this.addMarker();
      }

      return this;
    },
    
    addMarker: function() {
      if(this.map && this.map.center) {
        var markerLatlng = new google.maps.LatLng(this.map.center.lat(), this.map.center.lng());
  
        var icon = new google.maps.MarkerImage(
          '/images/marker.png',
          null, /* size is determined at runtime */
          null, /* origin is 0,0 */
          null, /* anchor is bottom center of the scaled image */
          new google.maps.Size(42, 68));
  
        new google.maps.Marker({
          position: markerLatlng,
          map: this.map,
          icon: icon
        });
      }
    },
    
    getTilt: function() {
      return this.map.getTilt();
    },

    goToCoordinates: function(coordinates) {
      this.setAddressCoordinates(coordinates);
      
      if(!this.map) {
        this.unvisitedCoordinates = true;
        return;
      }

      var latitude = coordinates.latitude;
      var longitude = coordinates.longitude;
      this.map.panTo(new google.maps.LatLng(latitude, longitude));
      
      if (coordinates.zoomLevel) {
        this.map.setZoom(coordinates.zoomLevel);
      } else {
        this.map.setZoom(20);
      }
    },

    zoomBy: function(zoomAmount) {
      var previousZoom = this.map.getZoom();
      if (previousZoom + zoomAmount < 1) {
        this.map.setZoom(1);
      } else {
        this.map.setZoom(previousZoom + zoomAmount);
      }
    },

    getCenter: function() {
      return this.map.getCenter();
    },

    rotate: function() {
      var previousHeading = this.map.getHeading() || 0;
      if (this.getTilt() !== 0) {
        this.map.setHeading(previousHeading + 90);
      }
    },
    
    centerOnAddress: function() {
      var coordinates = this.getAddressCoordinates();
      if (coordinates) {
        var latLng = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);
        
        this.map.setCenter(latLng);
      }
    },

    setAddressCoordinates: function(coordinates) {
      this.addressCoordinates = coordinates;
    },

    getAddressCoordinates: function() {
      return this.addressCoordinates;
    }

  });

  return ViewTheWorld.GoogleMap;
});
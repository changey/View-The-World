define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld');

  ViewTheWorld.Models.TourLocation = Backbone.Model.extend({
    initialize: function() {
      if(!this.get('thumbnail') && this.get('name')) {
        this.set('thumbnail', this.get('name').toLowerCase().split(' ').join('-') + '.png');
      }
    },

    getMapCoordinates: function() {
      var latitude = this.get('latitude');
      var longitude = this.get('longitude');
      var zoomLevel = this.get('zoomLevel');
  
      return {
          latitude: latitude,
          longitude: longitude,
          zoomLevel: zoomLevel
        };
    },
    
    getPhotoSphereIds: function() {
      return this.get('photoSphereIds');
    }
  });

  return ViewTheWorld.Models.TourLocation;
});
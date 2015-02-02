define(function(require) {
  'use strict';

  var _ = require('underscore')
    , Backbone = require('backbone')
    , GoogleEarthLoader = require('googleEarthLoader');

  function failureCallback() {
    // fail
  }

  ViewTheWorld.GoogleEarth = Backbone.View.extend({    
    initialize: function(options) {
      options = options || {};
      var elContainerName = options.elContainerName || 'googleEarthContainer';
      var googleEarthLoader = options.googleEarthLoader || new GoogleEarthLoader();
      this.isLoaded = false;
      
      googleEarthLoader.init(elContainerName, _.bind(this.initCallback, this), failureCallback);
    },
    
    initCallback: function(googleEarthInstance) {
      googleEarthInstance.getWindow().setVisibility(true);

      googleEarthInstance.getLayerRoot().enableLayerById(googleEarthInstance.LAYER_BORDERS, true);
      googleEarthInstance.getLayerRoot().enableLayerById(googleEarthInstance.LAYER_ROADS, false);
      googleEarthInstance.getLayerRoot().enableLayerById(googleEarthInstance.LAYER_BUILDINGS, true);
      googleEarthInstance.getLayerRoot().enableLayerById(googleEarthInstance.LAYER_TERRAIN, true);
      googleEarthInstance.getLayerRoot().enableLayerById(googleEarthInstance.LAYER_TREES, true);
      googleEarthInstance.getLayerRoot().enableLayerById(googleEarthInstance.LAYER_BORDERS, false);

      googleEarthInstance.getOptions().setMapType(googleEarthInstance.MAP_TYPE_EARTH);
      googleEarthInstance.getOptions().setFlyToSpeed(googleEarthInstance.SPEED_TELEPORT);

      this.googleEarthInstance = googleEarthInstance;
      this.isLoaded = true;
      this.hide();

      if(this.coordinates){
        this.goToLocation(this.coordinates);
      }
    },
    
    show: function() {
      $('#googleEarthContainer').show();
      this.$el.show();
    },
    
    hide: function() {
      $('#googleEarthContainer').hide();
      this.$el.hide();
    },
    
    getCoordinates: function() {
      var camera = this.googleEarthInstance.getView().copyAsCamera(this.googleEarthInstance.ALTITUDE_RELATIVE_TO_GROUND);
      var latitude = camera.getLatitude();
      var longitude = camera.getLongitude();

      return {
        latitude: latitude,
        longitude: longitude
      };
    },
    
    goToLocation: function(coordinates) {
      if(!this.googleEarthInstance){
        this.coordinates = coordinates;
        return;
      }
      var lng = coordinates.lng()%360;
      if(lng > 180){
        lng -= 360;
      }
      
      var lookat = this.googleEarthInstance.createLookAt('');
      lookat.set(coordinates.lat(), lng, 100, this.googleEarthInstance.ALTITUDE_RELATIVE_TO_GROUND, 0, 0, 1000);
      lookat.setTilt(60);
      this.googleEarthInstance.getView().setAbstractView(lookat);
    }
  });

  return ViewTheWorld.GoogleEarth;
});
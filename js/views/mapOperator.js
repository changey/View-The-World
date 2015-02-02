define(function(require) {
  'use strict';

  var _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , GoogleMap = require('lib/googleMap')
    , MapControlsView = require('views/mapControls')
    , MapOperatorTemplate = require('text!../../templates/mapOperator.tmpl');

  var FADE_DURATION = 2500;
  var LOAD_DURATION = 500;

  ViewTheWorld.Views.MapOperator = Backbone.View.extend({
    events: {
      'click .google-map': 'showGoogleMap'
    },
    
    initialize: function(options) {
      this.activeStepModel = options.activeStepModel;

      this.googleMapView = new GoogleMap({
        activeStepModel: this.activeStepModel
      });

      this.fadeGoogleMapView = new GoogleMap({
        activeStepModel: this.activeStepModel
      });

      this.effectsTimeouts = [];

      this.activeLocation = options.activeLocation;

      this.mapControlsView = new MapControlsView({
        googleMapView: this.googleMapView,
        fadeGoogleMapView: this.fadeGoogleMapView,
        activeLocation: this.activeLocation
      });
      
    },
    
    render: function(){
      var template = _.template(MapOperatorTemplate);
      this.$el.html(template);
      
      this.assign(this.googleMapView, '#map-canvas');
      this.assign(this.fadeGoogleMapView, '#faded-in-map-canvas');
      this.assign(this.mapControlsView, '#map-controls-container');
    },
    
    showGoogleMap: function(){

      //the popupWindow is implemented due to a longtime Google Earth Plugin bug that overwrites
      //native keyboard events, the popupWindow is used to help VTW regain focus from
      //the Google Earth Plugin
      //https://code.google.com/p/earth-api-samples/issues/detail?id=53
      
      var popupWindowToRegainFocus = window.open(document.URL, "popupWindowToRegainFocus", "height=1,width=1");
      popupWindowToRegainFocus.close();
      
      $('.google-map').removeClass('visible');
      $('#move-the-earth-hack').removeClass('cover-header');

      $('#header, .map-canvas').show();
      $("#contents > *").show();
      $("#faqcards-container").hide();
      $("#contact-info-container").hide();

      this.googleEarthView.hide();
      this.googleMapView.goToCoordinates(this.googleEarthView.getCoordinates());

      this.googleMapView.render();
    },

    goToLocationWithoutEffects: function(location) {
      _.each(this.effectsTimeouts, function(timeoutId) {
        //stop any pending effects.
        clearTimeout(timeoutId);
      });

      this.setMapLocation(location, this.googleMapView);
      this.setMapLocation(location, this.fadeGoogleMapView);
      this.effectsTimeouts = [];
      this.googleMapView.$el.show();
    },

    fadeToLocation: function(location, isAddress) {
      if(this.effectsTimeouts && this.effectsTimeouts.length > 0){
        this.goToLocationWithoutEffects(location);
        return;
      }

      this.effectsTimeouts = [];
      this.googleMapView.$el.show();
      this.fadeGoogleMapView.$el.show();
      //send the effect view ahead to the new location
      this.setMapLocation(location, this.fadeGoogleMapView);
      if(isAddress) {
        this.fadeGoogleMapView.addMarker();
      }

      this.googleMapView.$el.fadeOut(FADE_DURATION);

      this.effectsTimeouts.push(setTimeout(_.bind(function(){
        this.googleMapView.$el.hide();
        this.setMapLocation(location, this.googleMapView);
        this.effectsTimeouts.push(setTimeout(_.bind(function(){
          //give the map-canvas time to load in the new location before showing it.
          this.googleMapView.$el.show();
          if(isAddress) {
            this.googleMapView.addMarker();
          }
          this.effectsTimeouts = [];
        }, this), LOAD_DURATION));
      }, this), FADE_DURATION));
    },

    setMapLocation: function(location, googleMap) {
      googleMap.goToCoordinates(location.getMapCoordinates());
    }
  });

  return ViewTheWorld.Views.MapOperator;
});

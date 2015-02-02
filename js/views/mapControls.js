define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , _ = require('underscore')
    , ViewTheWorld = require('viewTheWorld')
    , MapControlsTemplate = require('text!../../templates/mapControls.tmpl')
    , EventBus = require('eventBus');

  ViewTheWorld.Views.MapControls = Backbone.View.extend({
    events: {
      'click .earth': 'showEarth',
      'click .zoom-in': 'zoomIn',
      'click .zoom-out': 'zoomOut',
      'click .rotate': 'rotate',
      'click .center-on-address': 'centerOnAddress'
    },
    
    initialize: function(options){
      this.googleEarthView = options.googleEarthView;
      this.googleMapView = options.googleMapView;
      this.fadeGoogleMapView = options.fadeGoogleMapView;
      this.activeLocation = options.activeLocation;
      
      this.listenTo(this.googleMapView, 'tilt_changed', this.render, this);
    },

    render: function() {
      var rotateButtonEnabled = (this.googleMapView.map.getTilt() === 45);
      var template =  _.template(MapControlsTemplate, {
        rotate: rotateButtonEnabled
      });
      this.$el.html(template);
    },
    
    initEarth: function() {
      this.googleEarthView.show();
    },
    
    showEarth: function() {
      this.activeLocation.save();
      
      EventBus.trigger('pauseTour');

      $('.google-map').addClass('visible');
      
      // hide other page elements. Why? cause on some browsers z-index is respected
      // chrome/mac. We don't want to have them show up on the page at all.
      $('#move-the-earth-hack').addClass('cover-header');
      $('.map-canvas').hide();
      $("#contents > :not('#tour-operator')").hide();

      this.googleEarthView.show();

      var mapCenter = this.googleMapView.getCenter();
      this.googleEarthView.goToLocation(mapCenter);
    },
    
    zoomIn: function() {
      EventBus.trigger('pauseTour');
      this.googleMapView.zoomBy(2);
      this.fadeGoogleMapView.zoomBy(2);
    },
    
    zoomOut: function() {
      EventBus.trigger('pauseTour');
      this.googleMapView.zoomBy(-2);
      this.fadeGoogleMapView.zoomBy(-2);
    },
    
    rotate: function() {
      EventBus.trigger('pauseTour');
      this.googleMapView.rotate();
      this.fadeGoogleMapView.rotate();
    },
    
    centerOnAddress: function() {
      EventBus.trigger('pauseTour');
      this.googleMapView.centerOnAddress();
      this.fadeGoogleMapView.centerOnAddress();
    }
  });

  return ViewTheWorld.Views.MapControls;
});

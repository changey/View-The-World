define(function(require) {
  'use strict';

  var _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , EventBus = require('eventBus')
    , MapOperatorView = require('views/mapOperator')
    , TourOperatorTemplate = require('text!../../templates/tourOperator.tmpl');
  
  ViewTheWorld.Views.TourOperator = Backbone.View.extend({
    initialize: function(options) {
      this.locations = options.locations;
      this.activeLocation = options.activeLocation;
      this.activeStepModel = options.activeStepModel;
      this.listenTo(this.activeLocation, "change", this.fadeToLocation, this);
      this.listenTo(this.activeStepModel, "change", this.startTour, this);
      this.listenTo(EventBus, "pauseTour", this.pauseTour, this);
      this.listenTo(EventBus, "stopTour", this.stopTour, this);
      this.listenTo(EventBus, "startTour", this.startTour, this);
      this.BASE_RANDOM_INTERVAL = 16;
      this.RANDOM_INTERVAL_RANGE = 3;

      this.mapOperator = new MapOperatorView({
        el: '#map-operator',
        activeLocation: this.activeLocation,
        activeStepModel: this.activeStepModel
      });
      
      this.goToLocationWithoutEffects(this.activeLocation);

      this.setTourInterval(this.getRandomTourInterval());
    },
    
    render: function(){
      var template = _.template(TourOperatorTemplate);
      this.$el.html(template);
      
      this.assign(this.mapOperator, "#map-operator");
    },

    goToLocationWithoutEffects: function() {
      this.setMapLocation(this.activeLocation);
      this.mapOperator.goToLocationWithoutEffects(this.activeLocation.getLocation());
    },
    
    fadeToLocation: function(activeLocation) {
      var isAddress = this.activeLocation.get('location').get('name') === 'My House';
      
      this.setMapLocation(activeLocation);
      this.mapOperator.fadeToLocation(activeLocation.getLocation(), isAddress);
      this.currentLocation = activeLocation.getLocation();
    },

    setMapLocation: function(activeLocation) {
      
      var highlightedLocation = activeLocation.get('location');
      
      if (highlightedLocation === undefined) {
        var locationIndex = this.locations.indexOf(this.currentLocation);

        locationIndex = (++locationIndex) % this.locations.models.length;
        highlightedLocation = this.locations.models[locationIndex];

      }
      activeLocation.set('location', highlightedLocation);
    },

    stopTour: function() {
      clearTimeout(this.tourId);
      this.tourId = undefined;
    },

    pauseTour: function() {
      this.stopTour();
      this.tourId = setTimeout(_.bind(this.startTour, this), 120000);
    },

    setTourInterval: function(interval) {
      if(this.activeStepModel.getStep() === 1 && !this.tourId) {
        this.tourId = setTimeout(_.bind(function() {
          this.touring(this.locations, this.activeLocation);
          this.stopTour();
          this.setTourInterval(this.getRandomTourInterval());
        }, this), interval);
      }
    },
    
    getRandomTourInterval: function() {
      var randomIntervalInSeconds = Math.random() * this.RANDOM_INTERVAL_RANGE + this.BASE_RANDOM_INTERVAL;
      var randomIntervalInMilliSeconds = Math.round(randomIntervalInSeconds * 1000);
      
      return randomIntervalInMilliSeconds;
    },

    startTour: function() {
      if (this.activeStepModel.getStep() === 1 && !this.activeStepModel.getStayAtLocation()) {

          this.stopTour();
          this.setTourInterval(this.getRandomTourInterval());
        
      }
    },
    
    touring: function(locations, activeLocation) {
      var index = locations.indexOf(activeLocation.get('location'));

      index = (++index) % locations.models.length;
      var location = locations.models[index];
      activeLocation.setIndex(index);
      activeLocation.set('location', location);
    }
  });

  return ViewTheWorld.Views.TourOperator;
});

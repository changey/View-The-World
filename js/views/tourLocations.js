define(function (require) {
  'use strict';
  
  var $                   = require('jquery')
    , _                   = require('underscore')
    , Backbone            = require('backbone')
    , ViewTheWorld        = require('viewTheWorld')
    , TourLocations       = require('text!../../templates/tourLocations.tmpl')
    , PostcardCollection  = require('collections/postcards')
    , PostcardsView       = require('views/postcards')
    , EventBus            = require('eventBus');
  
  ViewTheWorld.Views.TourLocations = Backbone.View.extend({
    events: {
      'click .location': 'clickLocation'
    },
    
    initialize: function(options) {
      this.locations = options.locations;
      this.activeLocation = options.activeLocation;
      
      this.activeLocation.on("change", this.onActiveLocationChange, this);
      
      $("#map-canvas").on('touchmove', _.bind(function() {
        this.hideCurrentLocationLabel();
        this.hideGestures();
      }, this));

      this.tourView = options.tourView;
    },
    
    render: function() {
      var template =  _.template(TourLocations, {
        locations: this.locations.toJSON(),
        activeLocationName: this.activeLocation.getName()
      });
      this.$el.html(template);


      var postcardCollection = new PostcardCollection(
        [],
        { activeLocation: this.activeLocation }
      );
      
      this.postcardsView = new PostcardsView({
        el: '#postcards-container',
        activeLocation: this.activeLocation,
        locations: this.locations,
        collection: postcardCollection,
        isShown: false
      });
      
      return this;
    },
    
    onActiveLocationChange: function(activeLocation, options) {
      this.highlightActiveLocation(activeLocation);
      if(!options || !options.click){
        if (this.postcardsView) {
          this.postcardsView.hide();
        }
        $('#postcards-container').removeClass('full-height');
        $('#locations').removeClass('recessed');
      } else {
        EventBus.trigger('pauseTour');
      }
    },
    
    highlightActiveLocation: function(activeLocation) {
      this.$el.find('.location.active').removeClass('active');

      var activeLocationSelector = ".location-name:contains('" + activeLocation.getName() + "')";
      this.$el.find(activeLocationSelector).parent().addClass('active');

      this.showCurrentLocationLabel(activeLocation.getName());
      this.showGestures();
    },

    hideCurrentLocationLabel: function(){
      var currentLocation = $('.current-location');
      currentLocation.addClass('hide');
    },
    
    showCurrentLocationLabel: function(activeLocationName) {
      var currentLocation = $('.current-location');
      this.$el.find('#location-name').text(activeLocationName);
      currentLocation.removeClass('hide');
    },

    hideGestures: function() {
      var gestures = $('#gestures');
      gestures.addClass('hide');
    },

    showGestures: function() {
      var gestures = $('#gestures');
      gestures.removeClass('hide');
    },

    clickLocation: function(event) {
      EventBus.trigger('pauseTour');
      
      var locationElem = $(event.currentTarget);
      var locationName = locationElem.find(".location-name").text();

      var location = this.locations.find(function(location) {
        return location.get('name') === locationName;
      });

      this.postcardsView.isShown = false;
      this.postcardsView.show();
      this.activeLocation.set('location', location, {click:true});
      var index = this.locations.indexOf(this.activeLocation.get('location'));
      this.activeLocation.set('index', index, {click: true});
      this.postcardsView.photoSphereView.hide();

      $('#postcards-container').removeClass('full-height');
      $('#locations').addClass('recessed');
    }
  });

  return ViewTheWorld.Views.TourLocations;
});
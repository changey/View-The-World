define(function(require) {
  'use strict';

  var _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , TourLocationModel = require('models/tourLocation');

  ViewTheWorld.Models.ActiveLocation = Backbone.Model.extend({

    initialize: function() {
      this.id = 'ActiveLocation';  
    },
    
    setLocation: function(location) {
      if(location instanceof Backbone.Model) {
        this.set('location', location);
      } else {
        _.defaults(location, {name: "My House"});
        this.set('location', new TourLocationModel(location));
      }
    },
    
    setIndex: function(index) {
      this.set('index', index);
    },

    getName: function() {
      return this.get('location').get('name');
    },

    getAddress: function() {
      return this.get('location').get('address');
    },
    
    getLocation: function() {
      return this.get('location');
    },
    
    getCoordinates: function() {
      return this.get('location').getMapCoordinates();
    },

    fetch: function() {
      this.set(JSON.parse(localStorage.getItem(this.id)));
    },

    save: function() {
      localStorage.setItem(this.id, JSON.stringify(this.attributes));
    }
  });

  return ViewTheWorld.Models.ActiveLocation;
});
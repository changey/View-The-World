define(function (require) {
  'use strict';
  
  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , TourLocationModel  = require('models/tourLocation');
  
  ViewTheWorld.Collections.TourLocations = Backbone.Collection.extend({
    model: TourLocationModel,
    
    firstLocation: function() {
      return this.first();
    }
  });
  
  return ViewTheWorld.Collections.TourLocations;
});
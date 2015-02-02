define(function (require) {
  'use strict';
  
  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , TourLocationSetModel  = require('models/tourLocationSet');
  
  ViewTheWorld.Collections.TourLocationSets = Backbone.Collection.extend({
    model: TourLocationSetModel,
    url: 'tourLocationSets.json',
    
    getLocationSets: function() {
      return this.models[0]? this.models[0].attributes : {};
    }
  });
  
  return ViewTheWorld.Collections.TourLocationSets;
});
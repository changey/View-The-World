define(function (require) {
  'use strict';
  
  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld');
  
  ViewTheWorld.Models.Stores = Backbone.Model.extend({
    defaults: {
      stores: ['Costco', 'Home Depot', 'REI']
    }
  });

  return ViewTheWorld.Models.Stores;
});
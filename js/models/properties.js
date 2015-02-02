define(function(require) {
  'use strict';

  var _             = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld');

  ViewTheWorld.Models.Properties = Backbone.Model.extend({
    url: "properties.json",

    initialize: function() {
      this.fetch({
        success: _.bind(this.buildProperties, this)
      });
    },
    
    buildProperties: function() {
      _.each(this.attributes, function(value, key) {
        Object.defineProperty(this, key, {
          get: function() {
            return this.get(key);
          },
          set: function(value) {
            this.set(key, value);
          }
        });
      }, this);
    }
  });

  return ViewTheWorld.Models.Properties;
});
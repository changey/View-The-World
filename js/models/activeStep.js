define(function (require) {
  'use strict';
  
  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld');
  
  ViewTheWorld.Models.ActiveStep = Backbone.Model.extend({
    defaults: {
      stayAtLocation: false
    },

    setStep: function(stepNumber) {
      this.set('step', stepNumber);
    },
    
    getStep: function() {
      return this.get('step');
    },

    setStayAtLocation: function(stayAtLocation) {
      this.set('stayAtLocation', stayAtLocation);
    },

    getStayAtLocation: function() {
      return this.get('stayAtLocation');
    }
  });

  return ViewTheWorld.Models.ActiveStep;
});
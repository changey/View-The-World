define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld');

  ViewTheWorld.Models.FaqcardQuestion = Backbone.Model.extend({
    defaults: function() {
      return {
        label: undefined,
        content: undefined
      };
    }
  });
  
  return ViewTheWorld.Models.FaqcardQuestion;
});
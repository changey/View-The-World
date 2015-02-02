define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld');

  ViewTheWorld.Models.Postcard = Backbone.Model.extend({
    defaults: function(){
      return {
        thumbnail: undefined,
        photoSphereId: undefined,
        isSelected: false
      };
    }
  });

  return ViewTheWorld.Models.Postcard;
});
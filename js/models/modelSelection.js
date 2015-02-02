define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld');

  ViewTheWorld.Models.ModelSelection = Backbone.Model.extend({

    select: function(model){
        this.set('model', model);
    },
    
    isSelected: function(model) {
      return (model === this.getModel());
    },
    
    getModel: function() {
      return this.get('model');
    }
  });

  return ViewTheWorld.Models.ModelSelection;
});
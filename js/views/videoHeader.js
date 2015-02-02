define(function (require) {
  'use strict';

  var _             = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , VideoHeaderTemplate = require('text!../../templates/videoHeader.tmpl');

  ViewTheWorld.Views.VideoHeader = Backbone.View.extend({
    
    render: function() {
      var template =  _.template(VideoHeaderTemplate, {
        activeStep: 1
      });
      this.$el.html(template);
      return this;
    }
  });

  return ViewTheWorld.Views.VideoHeader;
});
define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld');

  ViewTheWorld.Models.TourLocationSet = Backbone.Model.extend({ });

  return ViewTheWorld.Models.TourLocationSet;
});
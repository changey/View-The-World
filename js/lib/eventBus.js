define(function (require) {
  'use strict';

  var _             = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld');

  ViewTheWorld.EventBus = ViewTheWorld.EventBus || _.extend({}, Backbone.Events);

  return ViewTheWorld.EventBus;
});
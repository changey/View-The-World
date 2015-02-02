require.config({
  paths: {
    jquery: '../vendor/js/jquery-2.1.0',
    'jquery.geocomplete': '../vendor/js/jquery.geocomplete',
    'jquery.ui': '../vendor/js/jquery.ui',
    underscore: '../vendor/js/underscore',
    backbone: '../vendor/js/backbone',
    spinjs: '../vendor/js/spin',
    async: '../vendor/js/requirejs/async',
    text: '../vendor/js/requirejs/text',
    googleMapsLoader: 'lib/googleMapsLoader',
    googleEarthLoader: 'lib/googleEarthLoader',
    localstorage: '../vendor/js/backbone.localStorage',
    extensions: 'lib/extensions',
    eventBus: 'lib/eventBus',
    accounting: '../vendor/js/accounting',
    animateSprite: '../vendor/js/jquery.animateSprite.min',
    dragdealer: '../vendor/js/dragdealer'
  },
  
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore']
    },
    'jquery.geocomplete': ['jquery']
  }

});

require([
    'models/properties',
    'routers/appRouter',
    'viewTheWorld',
    'spoofUserAgent',
    'extensions'
  ], function(Properties, AppRouter, ViewTheWorld) {
    'use strict';
  
    ViewTheWorld.Properties = new Properties();

    new AppRouter({});
  });

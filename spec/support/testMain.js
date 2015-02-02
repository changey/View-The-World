require.config({
  paths: {
    jquery: '../vendor/js/jquery-2.1.0',
    'jquery.ui': '../vendor/js/jquery.ui',
    underscore: '../vendor/js/underscore',
    backbone: '../vendor/js/backbone',
    spinjs: '../vendor/js/spin',
    async: '../vendor/js/requirejs/async',
    text: '../vendor/js/requirejs/text',
    'jquery.geocomplete': '../vendor/js/jquery.geocomplete',
    localstorage: '../vendor/js/backbone.localStorage',
    extensions: 'lib/extensions',
    eventBus: 'lib/eventBus',
    googleMapsLoader: '../spec/support/googleMapsMock',
    googleEarthLoader: 'lib/googleEarthLoader',
    accounting: '../vendor/js/accounting',
    dragdealer: '../vendor/js/dragdealer',
    animateSprite: '../vendor/js/jquery.animateSprite.min'
  },

  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore']
    },
    googleMapsLoader: {
      exports: 'google'
    },
    'jquery.geocomplete': ['jquery']
  }

});
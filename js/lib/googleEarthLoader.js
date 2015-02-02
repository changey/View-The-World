define(["spoofUserAgent", "async!https://www.google.com/jsapi" ], function(UserAgentSpoofer) {
  'use strict';

  var GoogleEarthLoader = function() {
    this.init = function(uiSelector, callbackSuccess, callbackError) {
      if(google){
        google.load("earth", "1", { 'callback': function() {
          UserAgentSpoofer.resetUserAgent(); // the agent is spoofed to be iOS for google map. To get the Earth plugin to load we reset it back.
          
          google.earth.createInstance(uiSelector, callbackSuccess, callbackError);
        } });
      }
    };
  };

  return GoogleEarthLoader;
});
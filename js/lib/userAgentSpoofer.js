define(function() {
  'use strict';

  var UserAgentSpoofer = function(navigator) {
    navigator = navigator || window.navigator;
    
    this.originalUserAgent = navigator.userAgent;
    
    this.resetUserAgent = function(){
      this.spoofUserAgent(this.originalUserAgent);
    };
      
    this.spoofUserAgent = function(userAgent) {
      userAgent = userAgent || "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53";
      navigator = navigator || window.navigator;
      
      if (navigator.__defineGetter__) {
        navigator.__defineGetter__("userAgent", function () {
          return userAgent;
        });
      } else if (Object.defineProperty) {
        Object.defineProperty(navigator, "userAgent", {
          get: function () {
            return userAgent;
          }
        });
      }
    };
  };
  
  return UserAgentSpoofer;
});
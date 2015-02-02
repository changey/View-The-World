define(function(require) {
  
  var UserAgentSpoofer = require('lib/userAgentSpoofer')
    , ViewTheWorld = require('viewTheWorld');
  
  // MUST spoof the userAgent before the google Maps load. So essentially before anything else loads.
  ViewTheWorld.UserAgentSpoofer = ViewTheWorld.UserAgentSpoofer || new UserAgentSpoofer();
  ViewTheWorld.UserAgentSpoofer.spoofUserAgent();

  return ViewTheWorld.UserAgentSpoofer;
});
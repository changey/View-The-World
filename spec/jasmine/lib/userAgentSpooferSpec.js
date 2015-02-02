define(function (require) {
  var UserAgentSpoofer = require('lib/userAgentSpoofer');

  describe("Lib.UserAgentSpoofer", function () {
    describe("when a new userAgent is constructed", function() {
      it("sets the user agent to be iOS (mobile) if no specific user agent is specified", function() {
        var navigator = {};
        var userAgentSpoofer = new UserAgentSpoofer(navigator);
        userAgentSpoofer.spoofUserAgent();
        expect(navigator.userAgent).toBe("Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53"); 
      });
    });
    
    describe("when setting the userAgent to a specific agent", function() {
      it("sets the user agent to the one specified", function() {
        var navigator = {};
        var userAgentSpoofer = new UserAgentSpoofer(navigator);
        userAgentSpoofer.spoofUserAgent("QBrowser");
        expect(navigator.userAgent).toBe("QBrowser");
      });
    });
  });
});
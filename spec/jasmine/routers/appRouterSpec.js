define(function (require) {
  var AppRouter       = require('routers/appRouter')
    , Backbone        = require('backbone')
    , LoginInfoModel  = require('models/loginInfo');
  describe("AppRouter", function() {
    afterEach(function(){
      Backbone.history.navigate('');  
    });
    
    describe("#tour", function() {
      describe("when login information is incomplete", function() {
        var router;
        beforeEach(function() {
          var loginInfo = new LoginInfoModel();
          spyOn(loginInfo, 'isAuthorized').andReturn(false);

          Backbone.history.stop();
          router = new AppRouter();
          
          spyOn(router, 'getLoginInfoModel').andReturn(loginInfo);
        });
      });
      
      describe("when login information is complete", function() {
        var router, loginInfo;
        beforeEach(function() {
          loginInfo = jasmine.createSpyObj("LoginInfoModel", ['set', 'get', 'isAuthorized', 'getLocationSet', 'isLoggedIn']);
          loginInfo.getLocationSet.andReturn("Global");
          loginInfo.isAuthorized.andReturn(true);

          Backbone.history.stop();
          router = new AppRouter();
          
          spyOn(router, 'getLoginInfoModel').andReturn(loginInfo);
        });

        describe("when the isLoggedIn flag is true", function() {
          beforeEach(function() {
            loginInfo.isLoggedIn.andReturn(true);
          });
          it("should not direct the user to the login page instead", function() {
            Backbone.history.navigate('tour', true);
            expect(Backbone.history.fragment).toEqual('tour');
          });
        });

        describe("when the isLoggedIn flag is false", function() {
          beforeEach(function() {
            loginInfo.isLoggedIn.andReturn(false);
          });
          it("should direct the user to the login page instead", function() {
            router.navigate('tour', true);
            expect(Backbone.history.fragment).toEqual('login');
          });
        });
      });
    });
  });
});
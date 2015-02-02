define(function (require) {
  var LoginInfoModel  = require('models/loginInfo')
    , LoginView       = require('views/login')
    , LoginModel      = require('models/login');

  describe("View.SfcallbackView", function() {
    var loginInfoModel, loginView, loginModel;
    beforeEach(function() {
      jasmine.content.append('' +
        '<div id="login">' +
        '<div id="contents"></div>' +
        '<div id="header"></div>' +
        '</div>'
      );

      loginInfoModel = new LoginInfoModel();

      loginModel = new LoginModel({loginInfoModel: loginInfoModel});
      loginView = new LoginView({
        model: loginModel,
        el: "#login"
      });
    });

    afterEach(function(){
      loginView.remove();
      loginView.unbind();
    });

    describe("when login info is authorized", function() {
      beforeEach(function() {
        loginInfoModel = new LoginInfoModel();
        loginModel.set('loginInfoModel',loginInfoModel);
        spyOn(loginInfoModel, 'isAuthorized').andReturn(true);
      });

      it("should set isLoggedIn to true", function() {
        spyOn(loginView, 'callOAuthURL');
        loginView.SALESFORCE_OAUTH_URL = "http://foo";
        loginView.login();
        expect(loginView.callOAuthURL).toHaveBeenCalled();
      });

      it("should save login info", function() {
        spyOn(loginInfoModel, 'save');
        loginView.login();
        expect(loginInfoModel.save).toHaveBeenCalled();
      });
    });
  });
});
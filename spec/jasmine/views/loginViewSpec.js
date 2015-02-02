define(function (require) {
  var LoginInfoModel  = require('models/loginInfo')
    , LoginView       = require('views/login')
    , LoginModel      = require('models/login')
    , Backbone        = require('backbone');

  describe("View.LoginView", function() {
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

    describe("when the user is a BrightCurrent salesRep", function() {
      var branchName;
      
      beforeEach(function() {
        branchName = "BrightCurrent";
        loginView.SALESFORCE_OAUTH_URL = "http://foo";
        spyOn(loginInfoModel, 'isAuthorized').andReturn(true);
      });
      
      it("should navigate to the tour page without the Salesforce OAuth", function() {
        spyOn(loginView, 'callOAuthURL');
        loginView.login(branchName);
        expect(loginView.callOAuthURL).not.toHaveBeenCalled();
      });
    });

    describe("when the user is not a BrightCurrent salesRep", function() {
      var branchName;

      beforeEach(function() {
        branchName = "New York";
        loginView.SALESFORCE_OAUTH_URL = "http://foo";
        spyOn(loginInfoModel, 'isAuthorized').andReturn(true);
      });

      it("should navigate to the tour page without the Salesforce OAuth", function() {
        spyOn(loginView, 'callOAuthURL');
        loginView.login(branchName);
        expect(loginView.callOAuthURL).toHaveBeenCalled();
      });
    });

    describe("when the user submits the login form", function() {
      it("should preserve the form fields", function() {
        spyOn(loginView, 'preserveFormFields');
        loginView.login();
        expect(loginView.preserveFormFields).toHaveBeenCalled();
      });

      describe("error checking", function() {
        describe("when the store name is missing", function() {
          beforeEach(function() {
            loginInfoModel.set('storeName', undefined);
          });

          it("should display an error message", function() {
            loginView.login();
            loginView.render();
            expect($('#store-name-error').text()).not.toBe('');
          });
        });

        describe("when there are no email addresses", function() {
          beforeEach(function() {
            loginInfoModel.set('emails', []);
          });

          it("should display an error message", function() {
            loginView.login();
            loginView.render();
            expect($('#email-error').text()).not.toBe('');
          });
        });

        describe("when the location name is missing", function() {
          beforeEach(function() {
            loginInfoModel.set('locationSet', undefined);
          });

          it("should display an error message", function() {
            loginView.login();
            loginView.render();
            expect($('#location-set-error').text()).not.toBe('');
          });
        });
      });
      
      describe("when login info is not authorized", function() {
        beforeEach(function() {
          loginInfoModel = new LoginInfoModel();
          loginModel.set('loginInfoModel', loginInfoModel);
          spyOn(loginInfoModel, 'isAuthorized').andReturn(false);
        });

        it("should not set isLoggedIn to true", function() {
          loginView.login();
          expect(loginInfoModel.get('isLoggedIn')).toBeFalsy();
        });
        
        it("should not save login info", function() {
          spyOn(loginInfoModel, 'save');
          loginView.login();
          expect(loginInfoModel.save).not.toHaveBeenCalled(); 
        });
        
        it("should not navigate to the tour page", function() {
          spyOn(Backbone.history, 'navigate');
          loginView.login();
          expect(Backbone.history.navigate).not.toHaveBeenCalled();
        });
      });
    });

    describe("#render", function() {
      it("should show the store types from the model", function() {
        loginView.render();
        expect($('#store-name').children().length).toBe(loginModel.defaults().stores.length + 1);
      });

      describe("before the user submits the login form", function() {
        var loginInfoModel, loginView;
        beforeEach(function() {
          loginInfoModel = new LoginInfoModel();

          loginView = new LoginView({
            model: new LoginModel({loginInfoModel:loginInfoModel}),
            el: "#login"
          });
        });

        it("should not display any errors", function() {
          loginView.render();
          expect($('#store-name-error').length).toEqual(0);
        });
      });

      describe("when the user has already input the store name", function() {
        beforeEach(function() {
          loginInfoModel.set('storeName', 'Home Depot');
        });
        
        it("should show that store name as selected", function() {
          loginView.render();
          expect($('#store-name').val()).toEqual('Home Depot');
        });
      });

      describe("when the user has already input email addresses", function() {
        beforeEach(function() {
          loginInfoModel.set('emails', ['email@example.com', 'another@email.com']);
        });
        
        it("should show that email address as entered", function() {
          loginView.render();
          expect($($('.email')[0]).val()).toEqual('email@example.com');
          expect($($('.email')[1]).val()).toEqual('another@email.com');
        });
      });

      it("should have a button to add another email address", function() {
        loginView.render();
        expect($('.add-email')).toExist();
      });

      it("should have a field for entering an email address", function() {
        loginView.render();
        expect($('.email').length).toEqual(1);
      });

      it("should not show a button to remove the single email address", function() {
        expect($('.remove-email')).not.toExist();
      });

      describe("pressing the add another email button", function() {
        it("should add another text field to enter an email", function() {
          loginView.render();
          var fieldCount = $('.email').length;
          $('.add-email').click();
          expect($('.email').length).toEqual(fieldCount + 1);
        });
      });

      describe("when there are multiple email fields", function() {
        beforeEach(function() {  
          loginInfoModel.set('emails', ['a@b.com', 'c@d.com']);
          loginView.render();
        });

        describe("clicking on a remove button", function() {
          it("should remove one of the email fields", function() {
            var fieldCount = loginView.$el.find('.email').length;
            $('.remove-email').click();
            expect(loginView.$el.find('.email').length).toEqual(fieldCount - 1);
            
          });

          describe("when there is only one email field left", function() {
            it("should not show a button to remove that email field.", function() {
              loginView.$el.find('.remove-email').click();
              loginView.$el.find('.remove-email').click();
              
              expect(loginView.$el.find('.remove-email')).not.toExist();
            });

          });
        });
      });
    });

    describe("When you click on the add button", function() {
      beforeEach(function() {
        loginView.render();
      });
      
      it("should add the email fields to the loginInfoModel", function() {
        $('.email').val('some@something.com');
        $('.add-email').click();
        expect(loginInfoModel.get('emails')).toEqual(['some@something.com','']);
      });

      it("should preserve the fields on the form", function() {
        spyOn(loginView, 'preserveFormFields');
        $('.add-email').click();
        expect(loginView.preserveFormFields).toHaveBeenCalled();
      });
    });
    
    describe("when there are multiple email fields", function() {
      beforeEach(function() {
        loginInfoModel.set('emails', ['something', 'someone', 
          'myemail@example.com', 'somethingelse']);
        
        loginView.render();
      });
      
      describe("clicking on the remove button", function() {
        it("should remove that email from the model", function() {
          $($('.remove-email')[2]).click();
          expect(loginInfoModel.get('emails')).not.toContain('myemail@example.com');
        });

        it("should preserve the fields on the form", function() {
          spyOn(loginView, 'preserveFormFields');
          $('.remove-email').click();
          expect(loginView.preserveFormFields).toHaveBeenCalled();
        });
      });
    });

    describe("#preserveFormFields", function() {
      beforeEach(function() {
        loginView.render();
        $('.email').val('a@v.com');
        $('#store-name').val('Costco');
        $('#location-set').val('Global');
      });
      it("should set the emails on the model", function() {
        loginView.preserveFormFields();
        expect(loginInfoModel.get('emails')).toEqual(['a@v.com']);
      });

      it("should set the store name on the model", function() {
        loginView.preserveFormFields();
        expect(loginInfoModel.get('storeName')).toEqual('Costco');
      });

      it("should set the location set on the model", function() {
        loginView.preserveFormFields();
        expect(loginInfoModel.get('locationSet')).toEqual('Global');
      });
    });
  });
});
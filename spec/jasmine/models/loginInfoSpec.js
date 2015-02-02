define(function (require) {
  var LoginInfo = require('models/loginInfo');
  
  describe("LoginInfo", function() {
  
    describe("#isAuthorized", function() {
  
      describe("when all the login info is present", function() {
        it("returns true", function() {
          var loginInfo = new LoginInfo({ 
            branchName: "pikachuBranch",
            emails: ['someone@somewhere.com'], 
            storeName: 'Home Depot', 
            storeId: 'ome-hay-epot-day-123',
            locationSet: 'San Francisco Bay Area',
            leadOrganization: 'goGiants'
          });
          
          expect(loginInfo.isAuthorized()).toBeTruthy();          
        });
      });

      describe("when the storeId is missing", function() {
        it("returns false", function() {
          var loginInfo = new LoginInfo({ emails: ['abc'], storeName: 'Home Depot' });
          expect(loginInfo.isAuthorized()).toBeFalsy();
        });
      });
      
      describe("when the email is missing", function() {
        it("returns false", function() {
          var loginInfo = new LoginInfo({ emails:[], storeName: 'Home Depot', storeId: 'ome-hay-epot-day-123' });
          expect(loginInfo.isAuthorized()).toBeFalsy();
        });
      });
      
      describe("when the storeName is missing", function() {
        it("returns false", function() {
          var loginInfo = new LoginInfo({ emails: ['someone@somewhere.com'], storeId: 'ome-hay-epot-day-123' });
          expect(loginInfo.isAuthorized()).toBeFalsy();
        });
      });
    });

    describe("#isLoggedIn", function() {
      var loginInfo;

      beforeEach(function() {
        loginInfo = new LoginInfo();
      });

      describe("when the isLoggedIn flag is true", function() {
        beforeEach(function() {
          loginInfo.set('isLoggedIn', true);
        });

        describe("when the user is unauthorized", function() {
          beforeEach(function() {
            spyOn(loginInfo, 'isAuthorized').andReturn(false);
          });

          it("should return false", function() {
            expect(loginInfo.isLoggedIn()).toBeFalsy();
          });
        });

        describe("when the user is authorized", function() {
          beforeEach(function() {
            spyOn(loginInfo, 'isAuthorized').andReturn(true);
          });

          it("should return true", function() {
            expect(loginInfo.isLoggedIn()).toBeTruthy();
          });
        });
      });

      describe("when the isLoggedIn flag is false", function() {
        beforeEach(function() {
          spyOn(loginInfo, 'isAuthorized').andReturn(true);
          loginInfo.set('isLoggedIn', false);
        });

        it("should return false", function() {
          expect(loginInfo.isLoggedIn()).toBeFalsy();
        });
      });
    });
  });
});
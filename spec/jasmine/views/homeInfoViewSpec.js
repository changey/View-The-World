define(function(require) {
  var HomeInfoView = require('views/homeInfo')
    , LoginInfoModel = require('models/loginInfo')
    , LeadInfoModel = require('models/leadInfo')
    , CustomerModel = require('models/customer')
    , Redirector = require('lib/redirector')
    , ActiveStepModel = require('models/activeStep')
    , Spinner = require('spinjs');

  describe('ViewTheWorld.Views.HomeInfo', function() {
    var leadInfoModel, properties, redirector, view, activeStepModel;
    
    beforeEach(function() {
      var loginInfoModel = new LoginInfoModel({
        branchName: 'pikachuBranch',
        storeName: 'Costco',
        storeId: 'ostco-kay-123',
        emails: ['salesrep1@sunrun.com']
      });

      properties = {
        "LightmileEndpointUrl": "http://....com/sunrun/fromretail.action?",
        "SalesForceWebToLeadUrl": "https://....com/servlet/servlet.WebToLead?encoding=UTF-8",
        "SalesForceOid": "oid123123",
        "SalesForceFieldIds": {
          "leadSource": "leadsource23123",
          "leadOrigin": "origin123123",
          "channel": "channel1213",
          "monthlyElectricBill": "bil13123",
          "leadClassification": "clasdasd213",
          "salesRepEmail": "email123",
          "notes": "ntoerasd12"
        },
        "BrightCurrentWebToLeadUrl": "https://www.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8",
        "BrightCurrentOid": "00Dd0000000eDLP",
        "BrightCurrentFieldIds": {
          "monthlyElectricBill": "00Nd0000005L27N",
          "salesRepEmail": "00Nd0000007p9lT",
          "phone": "phone",
          "firstName": "first_name",
          "lastName": "last_name",
          "email": "email",
          "calledCenterPartner": "00Nd0000007ofXg",
          "locationPicklist": "00Nd0000005K7h4",
          "recLeadSource": "00Nd0000007OzW0"
        }
      };

      redirector = new Redirector();
      spyOn(redirector, 'redirectTo');

      spyOn(window, 'setTimeout').andCallFake(function(fn) {
        fn();
      });

      jasmine.content.append("<div id='home-info'></div>");

      activeStepModel = new ActiveStepModel({step:2});

      var customerModel = new CustomerModel({
        billAmount: "1000",
        streetAddress: "24th St. Apt 6",
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        firstName: 'Testfirst',
        lastName: 'Testlast',
        email: 'test@email.com',
        phone: '1112223333'
      });

      leadInfoModel = new LeadInfoModel({
        customerModel: customerModel,
        loginInfoModel: loginInfoModel,
        properties: properties
      });

      view = new HomeInfoView({
        el: '#home-info',
        customerModel: customerModel,
        activeStepModel: activeStepModel,
        leadInfoModel: leadInfoModel,
        loginInfoModel: loginInfoModel,
        redirector: redirector,
        spinner: new Spinner(),
        properties: properties
      });
    });
    
    describe("when user entered and address and a raw saving number is determined", function() {
      it("should return convert Sunrun lifetime savings number to range", function() {
        var cat1 = {
          min: 0,
          max: 5000,
          category: 1
        };

        var cat2 = {
          min: 5000,
          max: 10000,
          category: 2
        };
        
        var savingsRange = view.calculateSavingsRange(3000);
        expect(savingsRange).toEqual(cat1);

        savingsRange = view.calculateSavingsRange(7000);
        expect(savingsRange).toEqual(cat2);
        
      });
    });
    
    describe("when user enters a valid email", function() {
      var email;
      
      beforeEach(function() {
        email = "pickachu@pokemon.com";
      });
      
      it("should have a positive result when validating the email", function() {
        expect(view.validateEmail(email)).toBeTruthy();
      });
    });

    describe("when user enters an invalid email", function() {
      var email;

      beforeEach(function() {
        email = "pickachupokemon.com";
      });

      it("should have a positive result when validating the email", function() {
        expect(view.validateEmail(email)).toBeFalsy();
      });
    });
  });
});
define(function(require) {
  var ContactInfoView = require('views/contactInfo')
    , CustomerModel = require('models/customer')
    , LeadInfoModel = require('models/leadInfo')
    , LoginInfoModel = require('models/loginInfo')
    , Redirector = require('lib/redirector');

  describe('ViewTheWorld.Views.ContactInfo', function() {
    var properties, redirector, customerModel, loginInfoModel, leadInfoModel, view;

    beforeEach(function() {
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
          "notes": "Brazil 2016, Tokyo 2020 Olympics"
        }
      };

      redirector = new Redirector();
      spyOn(redirector, 'redirectTo');

      spyOn(window, 'setTimeout').andCallFake(function(fn) {
        fn();
      });

      jasmine.content.append("<div id='contact-info'></div>");

      customerModel = new CustomerModel({
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

      loginInfoModel = new LoginInfoModel({
        storeName: 'Costco',
        storeId: 'ostco-kay-123',
        emails: ['scottHappyBirthday@sunrun.com']
      });

      leadInfoModel = new LeadInfoModel({
        customerModel: customerModel,
        loginInfoModel: loginInfoModel,
        properties: properties
      });    

      view = new ContactInfoView({
        el: '#contact-info',
        customerModel: customerModel,
        leadInfoModel: leadInfoModel,
        loginInfoModel: loginInfoModel,
        redirector: redirector,
        properties: properties
      });
    });
    
  });
});
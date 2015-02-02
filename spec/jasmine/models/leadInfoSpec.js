define(function(require) {
  var LeadInfoModel = require('models/leadInfo')
    , LoginInfoModel = require('models/loginInfo')
    , CustomerModel = require('models/customer');

  describe("ViewTheWorld.Models.LeadInfo", function() {
    describe("#getSalesforceJson", function() {
      var leadInfo, properties, customer;
      beforeEach(function() {
        customer = new CustomerModel({
          billAmount: '200',
          streetAddress: "24th St. Apt 6",
          city: "San Francisco",
          state: 'CA',
          zip: '94103',
          firstName: 'Testfirst',
          lastName: 'Testlast',
          email: 'test@email.com',
          phone: '1112223333'
        });

        var loginInfo = new LoginInfoModel({
          storeName: 'Costco',
          leadOrganization: 'goGiants',
          email: 'salesrep1@sunrun.com'
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
          }
        };
        
        leadInfo = new LeadInfoModel({
          customerModel: customer,
          loginInfoModel: loginInfo,
          properties: properties
        });
      });

      describe("when a test lead", function() {
        it("assembles the salesforce web-to-lead object with the unqualified fields", function() {
          customer.set({phone: "test"});
          
          expect(leadInfo.getSalesforceJson()).toEqual({
            'oid': 'oid123123',
            'leadsource23123': 'Retail: Sunrun Solar Station',
            'retURL': 'https://r30.sunrundev.com',
            'origin123123': 'Sunrun',
            'bil13123': '200',
            'channel1213': 'Retail',
            'clasdasd213': 'Field Sales',
            'email123': 'salesrep1@sunrun.com',
            'ntoerasd12': 'Lead source notes: Lead Organization: goGiants, Store Name: Costco, Sales Rep Email: salesrep1@sunrun.com',
            'city': 'San Francisco',
            'state': 'CA',
            'zip': '94103',
            'street': '24th St. Apt 6',
            'firstName': 'Testfirst',
            'lastName': 'Testlast',
            'email': 'test@email.com',
            'phone': 'test',
            'squareFootage' : '1000',
            'leadOrganization': 'goGiants'
          });
        });  
      });
      
      describe("when a normal lead", function() {
        it("should assemble salesforce web-to-lead object without the unqualified fields", function() {
          expect(leadInfo.getSalesforceJson()).toEqual({
            'oid': 'oid123123',
            'leadsource23123': 'Retail: Sunrun Solar Station',
            'retURL': 'https://r30.sunrundev.com',
            'origin123123': 'Sunrun',
            'bil13123': '200',
            'channel1213': 'Retail',
            'clasdasd213': 'Field Sales',
            'email123': 'salesrep1@sunrun.com',
            'ntoerasd12': 'Lead source notes: Lead Organization: goGiants, Store Name: Costco, Sales Rep Email: salesrep1@sunrun.com',
            'city': 'San Francisco',
            'state': 'CA',
            'zip': '94103',
            'street': '24th St. Apt 6',
            'firstName': 'Testfirst',
            'lastName': 'Testlast',
            'email': 'test@email.com',
            'phone': '1112223333',
            'squareFootage' : '1000',
            'leadOrganization': 'goGiants'
          });
        });
      });
    });

    describe("#formattedNotes", function() {
      it("should return the notes in plain english", function() {
        var loginInfo = new LoginInfoModel({
          storeName: 'Costco',
          leadOrganization: 'goGiants',
          email: 'salesrep1@sunrun.com'
        });

        var leadInfo = new LeadInfoModel({
          loginInfoModel: loginInfo
        });
        
        expect(leadInfo.formattedNotes()).toEqual(
          "Lead source notes: " +
            "Lead Organization: goGiants, " +
            "Store Name: Costco, " +
            "Sales Rep Email: salesrep1@sunrun.com"
        );  
      });
      
    });

    describe("#getUnqualifiedFields", function() {
      var loginInfo = new LoginInfoModel({
        storeName: 'Costco',
        storeId: 'ostco-kay-123',
        email: 'salesrep1@sunrun.com'
      });

      var leadInfo = new LeadInfoModel({
        loginInfoModel: loginInfo
      });

      it("should return the notes in plain english", function() {
        expect(leadInfo.getUnqualifiedFields()).toEqual({
          "leadStatus": "Unqualified",
          "whyUnqualified": "Other",
          "reason": "Other"
        });
      });
    });

    describe("#isUnqualified", function() {
      var leadInfo, customer;
      
      beforeEach(function() {
        var loginInfo = new LoginInfoModel({
          storeName: 'Costco',
          storeId: 'ostco-kay-123',
          email: 'salesrep1@sunrun.com'
        });

        customer = new CustomerModel({ });

        leadInfo = new LeadInfoModel({
          customerModel: customer,
          loginInfoModel: loginInfo
        });
      });
    });
  });
});
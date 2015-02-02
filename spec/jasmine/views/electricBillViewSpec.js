define(function(require) {
  var ElectricBillView = require('views/electricBill')
    , CustomerModel = require('models/customer')
    , LeadInfoModel = require('models/leadInfo')
    , LoginInfoModel = require('models/loginInfo')
    , ActiveStepModel = require('models/activeStep')
    , Spinner = require('spinjs')
    , Redirector = require('lib/redirector');

  describe('ViewTheWorld.Views.ElectricBill', function() {
    var properties, redirector, leadInfoModel;

    beforeEach(function() {
      var loginInfoModel = new LoginInfoModel({
        branchName: 'pikachuBranch',
        storeName: 'Costco',
        storeId: 'ostco-kay-123',
        email: 'salesrep1@sunrun.com'
      });

      leadInfoModel = new LeadInfoModel({
        loginInfoModel: loginInfoModel
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

      jasmine.content.append("<div id='electric-bill'></div>");
    });
    
    describe("changing the bill range", function() {
      var view, billRange, billAmount, customerModel;

      beforeEach(function () {
        customerModel = new CustomerModel();
        
        view = new ElectricBillView({
          el: '#electric-bill',
          customerModel: customerModel,
          properties: properties,
          activeStepModel: new ActiveStepModel(),
          leadInfoModel: leadInfoModel
        });
        
        view.render();
        billAmount = $('#bill-amount');
        billRange = $('#bill-range');
      });

      it('should have a default value of 200', function () {
        expect(billRange.val()).toEqual('200');
        expect(billAmount.val()).toEqual('200');
      });

      it("should have a max value of 1000 on the slider", function () {
        expect(billRange.attr('max')).toEqual('1000');
      });

      describe('moving the slider', function () {
        it('should change the text in the text field', function () {
          billRange.val(300).change();
          expect(billAmount.val()).toEqual('300');
        });

        it('should update the model', function () {
          billRange.val(300).change();
          expect(customerModel.get('billAmount')).toEqual('300');
        });
      });
    });
    
    describe("#isValidBillAmount", function() {
      var view;

      beforeEach(function() {
        view = new ElectricBillView({
          leadInfoModel: leadInfoModel
        });
      });
      
      it("returns true if the amount is greater than 0 and less than 9999", function() {
        expect(view.isValidBillAmount(0)).toBeTruthy();
        expect(view.isValidBillAmount("9999")).toBeTruthy();
        expect(view.isValidBillAmount(9999)).toBeTruthy();
      });

      it("returns false if the amount is negative", function() {
        expect(view.isValidBillAmount(-12)).toBeFalsy();
      });

      it("returns false if the amount is a not a number", function() {
        expect(view.isValidBillAmount("1gf")).toBeFalsy();
        expect(view.isValidBillAmount("asdasd")).toBeFalsy();
      });
    });
    
    describe("#render", function() {
      var spinner, activeStepModel, view;

      beforeEach(function () {
        spinner = new Spinner();
        activeStepModel = new ActiveStepModel();

        view = new ElectricBillView({
          el: '#electric-bill',
          customerModel: new CustomerModel(),
          activeStepModel: activeStepModel,
          spinner: spinner,
          redirector: redirector,
          leadInfoModel: leadInfoModel
        });
      });
      
      it("syncs the text in the large textbox and the corresponding customer info textbox", function() {
        view.render();

        var $largeInput = $('#large-input');
        $largeInput.addClass('first-name');
        $largeInput.val("happyFriday");
        $largeInput.trigger("input");

        expect($('#first-name').val()).toEqual("happyFriday");
      });

      describe("when the user clicks on a customer info textbox", function() {
        it("redirects the focus to the large textbox", function() {
          view.render();

          view.showLargePopup();
          $('#first-name').trigger('input');

          // $fn.is(":focus") selector fails in phantom and sometimes in jasmine.
          var largeTextBoxFocused = ($('input[name="large-input"]').get(0) === document.activeElement);

          expect(largeTextBoxFocused).toEqual(true);
        });
      });

      describe("when the active step is 3", function() {
        it("should show a spinner", function() {
          activeStepModel.set('step', 3);
        
          spyOn(spinner, 'spin');
          view.render();
          
          expect(spinner.spin).toHaveBeenCalledWith($("#loading")[0]);
        });
      });

      describe("when the active step is 2", function() {
        it("should not show a spinner", function() {
          activeStepModel.set('step', 2);

          spyOn(spinner, 'spin');
          view.render();
          
          expect(spinner.spin).not.toHaveBeenCalled();
        });
      });
    });

    describe("#validateAndSubmit", function() {
      var view, customerModel;
      
      beforeEach(function() {
        customerModel = new CustomerModel();

        view = new ElectricBillView({ 
          el: '#electric-bill',
          customerModel: customerModel,
          activeStepModel: new ActiveStepModel(),
          properties: properties,
          leadInfoModel: leadInfoModel
        });
        view.render();
        $('#phone').val('1112223333');
      });
      
      describe("when the bill amount is valid", function() {
        it('updates the model', function () {
          spyOn(view, 'sendLeadAndRedirect');
          
          $("#bill-amount").val('1300');
          view.validateAndSubmit();
          
          expect(customerModel.get('billAmount')).toEqual('1300');
        });

        it("hides any previous error", function() {
          spyOn(view, 'sendLeadAndRedirect');
          view.validateAndSubmit();

          expect($('#bill-amount-error:visible').length).toBeFalsy();
        });

        it("sends the lead and redirect to lightmile", function() {
          spyOn(view, 'sendLeadAndRedirect');
          
          view.validateAndSubmit();
          
          expect(view.sendLeadAndRedirect).toHaveBeenCalled();
        });
      });
      
      describe("when the bill amount is invalid", function() {
        it('does not update the model', function() {
          $("#bill-amount").val("sdfawe");
          view.validateAndSubmit();
          
          expect(customerModel.get('billAmount')).toEqual('200');
        });
        
        it('shows an error', function() {
          $("#bill-amount").val("sdfawe");
          
          view.validateAndSubmit();
          expect($('#bill-amount-error').css('display')).not.toBe('none');
        });

        it("does not send the customer's information to Lightmile or redirect", function() {
          spyOn(view, 'sendLeadAndRedirect');
          
          $("#bill-amount").val("sdfawe");
          view.validateAndSubmit();
          
          expect(view.sendLeadAndRedirect).not.toHaveBeenCalled();
        });
      });  
    });
    
    describe("when BrightCurrent is chosen as the branchName", function() {
      var view, activeStepModel;
      
      beforeEach(function() {
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

        var loginInfoModel = new LoginInfoModel({
          storeName: 'Costco',
          storeId: 'ostco-kay-123',
          email: 'salesrep1@sunrun.com'
        });

        var leadInfoModel = new LeadInfoModel({
          customerModel: customerModel,
          loginInfoModel: loginInfoModel,
          properties: properties
        });

        view = new ElectricBillView({
          el: '#electric-bill',
          customerModel: customerModel,
          activeStepModel: activeStepModel,
          leadInfoModel: leadInfoModel,
          redirector: redirector,
          spinner: new Spinner(),
          properties: properties,
          branchName: "BrightCurrent"
        });
      });

      it("should set the web-to-lead url to the BrightCurrent one from the properties", function() {
        view.render();
        view.sendLeadAndRedirect();
        expect($('#salesforce-form').attr('action')).toEqual(properties.BrightCurrentWebToLeadUrl);
      });
    });
    
    describe("#sendLeadAndRedirect", function() {
      var view, activeStepModel;
      
      beforeEach(function() {
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

        var loginInfoModel = new LoginInfoModel({
          storeName: 'Costco',
          storeId: 'ostco-kay-123',
          email: 'salesrep1@sunrun.com'
        });

        var leadInfoModel = new LeadInfoModel({
          customerModel: customerModel,
          loginInfoModel: loginInfoModel,
          properties: properties
        });
        
        view = new ElectricBillView({
          el: '#electric-bill',
          customerModel: customerModel,
          activeStepModel: activeStepModel,
          leadInfoModel: leadInfoModel,
          redirector: redirector,
          spinner: new Spinner(),
          properties: properties
        });
      });

      it("sends the lead information to Salesforce", function () {
        view.render();
        
        var salesforceForm = $('#salesforce-form');
        var submitCallback = jasmine.createSpy('salesforceSubmitCallBack').andReturn(false);

        salesforceForm.submit(submitCallback);
        view.sendLeadAndRedirect();

        expect(submitCallback).toHaveBeenCalled();
      });

      it("sends the customer's information to Lightmile", function() {
        view.sendLeadAndRedirect();

        expect(redirector.redirectTo).toHaveBeenCalledWith(
          properties.LightmileEndpointUrl +
            'CustomerStreet=24th+St.+Apt+6' +
            '&CustomerCity=San+Francisco' +
            '&State=CA' +
            '&CustomerZipCode=94103' +
            '&PartnerCurrentYearBill=12000' +
            '&CustomerFirstName=Testfirst' +
            '&CustomerLastName=Testlast' +
            '&CustomerEmail=test%40email.com' +
            '&CustomerCellPhone=1112223333'+
            '&County=NA'
        );
      });

      it("should set the salesforce url from the properties", function() {
        view.render();
        view.sendLeadAndRedirect();
        expect($('#salesforce-form').attr('action')).toEqual(properties.SalesForceWebToLeadUrl);
      });

      it("waits for 3 seconds before redirecting", function() {
        view.sendLeadAndRedirect();

        expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3000);
      });

      it("should change the active step to 3", function() {
        view.sendLeadAndRedirect();
        
        expect(activeStepModel.get('step')).toEqual(3);
      });
    });
  });
});
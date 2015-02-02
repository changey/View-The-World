define(function (require) {
  var Backbone            = require('backbone')
    , AddressSearchView   = require('views/addressSearch')
    , LoginInfoModel      = require('models/loginInfo')
    , CustomerModel       = require('models/customer')
    , ActiveLocationModel = require('models/activeLocation')
    , ActiveStepModel     = require('models/activeStep')
    , EventBus = require('eventBus')
    , TourOperatorView = require('views/tourOperator')
    , TourLocationsCollection  = require('collections/tourLocations')
    , TourLocationModel = require('models/tourLocation');
  
  var BACKSPACE_KEY = 8;
  
  describe("ViewTheWorld.Views.AddressSearch", function () {
    beforeEach(function() {
      jasmine.content.append("<div id='address-search'></div>");
    });

    describe("typing in an address", function () {
      var addressSearchView, loginInfoModel, activeStepModel;
      
      beforeEach(function () {
        activeStepModel = new ActiveStepModel({step: 1});
        loginInfoModel = new LoginInfoModel({
          storeName: "Costco",
          storeId: "blah",
          emails: ["blah@a.com"],
          isLoggedIn: true
        });
        loginInfoModel.save();

        addressSearchView = new AddressSearchView({
          el: "#address-search",
          loginInfoModel: loginInfoModel,
          activeStepModel: activeStepModel,
          customerModel: new CustomerModel(),
          tourOperatorView: new TourOperatorView({
            locations: new TourLocationsCollection(),
            activeLocation: new ActiveLocationModel({
              location: new TourLocationModel(),
              latitude: 0,
              longitude: 0
            }),
            activeStepModel: new ActiveStepModel()
          })
        });
        
        addressSearchView.render();

        $('button').prop('disabled', false);
      });

      describe("when the address is '/logout'", function () {
        beforeEach(function() {
          $('#street-address').val("/logout");
        });
        
        it("should maintain local storage", function () {
          $('#get-started').click();

          var localStorageLoginInfo = $.parseJSON(localStorage.LoginInfo);
          expect(localStorageLoginInfo.storeName).toEqual('Costco');
          expect(localStorageLoginInfo.storeId).toEqual('blah');
          expect(localStorageLoginInfo.emails).toEqual(['blah@a.com']);
        });

        it("should set isLoggedIn to false in local storage", function() {
          var localStorageLoginInfo = $.parseJSON(localStorage.LoginInfo);
          expect(localStorageLoginInfo.isLoggedIn).toBeTruthy();

          $('#get-started').click();
          localStorageLoginInfo = $.parseJSON(localStorage.LoginInfo);
          expect(localStorageLoginInfo.isLoggedIn).toBeFalsy();
        });

        it("should redirect the user to the login page", function () {
          spyOn(Backbone.history, "navigate");
          $('#street-address').val("/logout");
          $('#get-started').click();
          expect(Backbone.history.navigate).toHaveBeenCalledWith('#login', true);
        });
      });
      
      describe("when the address is changed", function() {
        it("should trigger a pauseTour event", function() {
          spyOn(EventBus, 'trigger');
          $('#street-address').val("notEmpty");
          $('#street-address').trigger('input');
          expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
        });
      });
      
      describe("when the check my roof button is clicked", function() {
        var userAddress;
        
        beforeEach(function() {
          userAddress = "595 Market St, San Francisco, CA 94105, USA";
          
          addressSearchView.userHomeAddress = {
            address: userAddress
          };
          addressSearchView.activeLocation = new ActiveLocationModel();
          addressSearchView.$el.find("#street-address").val(userAddress);
        });
        
        it("should set the map to the address entered by the customer", function() {
          
          $('#get-started').click();
          expect(addressSearchView.activeLocation.get('location').get('address')).toBe(userAddress);
        });
      });
    });
    
    describe("clearing an address", function() {
      var addressSearchView, activeLocation, customerModel;
      
      beforeEach(function() {
        activeLocation = new ActiveLocationModel({
          location:   {
            "name":     "Alcatraz",
            "address":  "Alcatraz, CA",
            "thumbnail": "alcatraz.png"
          }
        });

        customerModel = new CustomerModel();

        addressSearchView = new AddressSearchView({
          el: "#address-search",
          activeLocation: activeLocation,
          customerModel: customerModel
        }).render();
      });

      it("should set the active location to undefined", function() {
        spyOn(window, 'setTimeout').andCallFake(function (func) { func(); });
        
        $('#street-address').blur();
        expect(activeLocation.attributes).toEqual({ location: undefined });
      });

      it("should clear the address string in the customer model", function() {
        customerModel.set('addressString', 'Not an empty string');

        $('#street-address').blur();
        expect(customerModel.get('addressString')).toEqual('');
      });
    });
    
    describe("showGeocompletePopup", function() {
      var geocodeResult, addressSearchView;
      beforeEach(function() {
        geocodeResult = {
          formatted_address: '123 Some Street, Somewhere, CA'
        };

        addressSearchView = new AddressSearchView({
          el: "#address-search",
          activeLocation: new ActiveLocationModel(),
          customerModel: new CustomerModel()
        });

      });
      
      it("shows the geocomplete text box", function() {
        addressSearchView.render();

        var $geocompleteTextbox = $("#geocomplete-textbox");
        $geocompleteTextbox.hide(); // not loading our CSS so hide it here.
        
        addressSearchView.showGeocompletePopup();     
        expect($geocompleteTextbox).toBeVisible();
      });
    });

    describe("#render", function() {
      var geocodeResult, addressSearchView;
      beforeEach(function() {
        geocodeResult = {
          formatted_address: '123 Some Street, Somewhere, CA'
        };

        addressSearchView = new AddressSearchView({
          el: "#address-search",
          activeLocation: new ActiveLocationModel(),
          customerModel: new CustomerModel()
        });

      });

      it("should disable the next button", function() {
        addressSearchView.render();
        expect($('#get-started')[0]).toHaveClass('disabled');
      });

      it("syncs the text in the geocomplete textbox and the placeholder", function() {
        addressSearchView.render();
        
        var $streetAddress = $('#street-address');
        $streetAddress.val("happyFriday");
        $streetAddress.trigger("input");

        expect($('#street-address-placeholder').val()).toEqual("happyFriday");
      });

      describe("when the user clicks on the street address search box", function() {
        it("redirects the focus to the geocomplete textbox", function() {
          addressSearchView.render();

          addressSearchView.showGeocompletePopup();
          $('#street-address-placeholder').trigger('input');

          // $fn.is(":focus") selector fails in phantom and sometimes in jasmine.
          var geocompleteTextBoxFocused = ($('input[name="street-address"]').get(0) === document.activeElement);
          
          expect(geocompleteTextBoxFocused).toEqual(true);
        });
      });


      describe("when there is an address in the customer model", function() {
        var customerModel;
        beforeEach(function() {
          customerModel = new CustomerModel({
            addressString: '101 Spear St, San Francisco, CA 94105, USA'
          });
          
          addressSearchView = new AddressSearchView({
            el: "#address-search",
            activeLocation: new ActiveLocationModel(),
            customerModel: customerModel
          });
        });

        it("should populate the address search field with the customer's address", function() {
          addressSearchView.render();
          expect($('#street-address').val()).toEqual('101 Spear St, San Francisco, CA 94105, USA');
        });

        it("should not disable the next button", function() {
          addressSearchView.render();
          expect($('#get-started')[0]).not.toHaveClass('disabled');
        });
      });
    });

    describe("when an address is selected from geocomplete", function() {
      var geocodeResult, addressSearchView, customerModel;
      beforeEach(function() {
        geocodeResult = {
          formatted_address: '101 Spear St, San Francisco, CA 94105, USA',
          geometry: {
            location: {
              lat: function() {
                return 1;
              },
              lng: function() {
                return 2;
              }
            }
          }
        };
        
        customerModel = new CustomerModel();
        addressSearchView = new AddressSearchView({
          el: "#address-search",
          activeLocation: new ActiveLocationModel(),
          customerModel: customerModel
        }).render();
        
      });
      
      it("should enable the button", function() {
        expect($('#get-started')[0]).toHaveClass('disabled');
        
        $('#street-address').geocomplete().trigger('geocode:result', [geocodeResult]);
        
        expect($('#get-started')[0]).not.toHaveClass('disabled');
      });

      it("should set the addressString attribute on the customerModel", function() {
        $('#street-address').geocomplete().trigger('geocode:result', [geocodeResult]);
        
        expect(customerModel.get('addressString')).toBeDefined();
      });
    });
    
    describe("when the backspace key is hit", function() {
      var addressSearchView, customerModel;
      
      beforeEach(function() {
        customerModel = new CustomerModel();
        addressSearchView = new AddressSearchView({
          el: "#address-search",
          activeLocation: new ActiveLocationModel(),
          customerModel: customerModel
        }).render();
      });
      
      it("should delete the last characters of the address for the user", function() {
        var originalAddress = "Go Brazil";
        var $streetAddress = $('#street-address');
        $streetAddress.val(originalAddress);
          
        var e = jQuery.Event("keydown");
        e.which = BACKSPACE_KEY;

        $streetAddress.trigger(e);
        expect($streetAddress.val()).toBe("Go Brazi");
      });
    });
    
    describe("#nextStep", function() {
      var addressSearchView
          , loginInfoModel
          , activeStepModel
          , activeLocationModel
          , customerModel;

      beforeEach(function () {
        loginInfoModel = new LoginInfoModel();
        activeStepModel = new ActiveStepModel({step:1});
        activeLocationModel = new ActiveLocationModel();
        customerModel = new CustomerModel();

        addressSearchView = new AddressSearchView({
          el: "#address-search",
          activeLocation: activeLocationModel,
          loginInfoModel: loginInfoModel,
          customerModel: customerModel,
          activeStepModel: activeStepModel
        });
        addressSearchView.render();
      });

      it("saves the address", function () {
        spyOn(activeLocationModel, 'getAddress')
          .andReturn("24th St, San Francisco, CA 94103");

        addressSearchView.nextStep();

        expect(customerModel.attributes).toEqual({
          billAmount: "200",
          streetAddress: "24th St",
          city: "San Francisco",
          state: "CA",
          zip: "94103",
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          squareFootage: "1000"
        });
      });

      it("goes to step '2'", function () {
        spyOn(activeLocationModel, 'getAddress')
          .andReturn("24th St, San Francisco, CA 94103");
        
        addressSearchView.nextStep();
        expect(activeStepModel.getStep()).toEqual(2);
      });
    });
  });
});
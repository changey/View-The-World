define(function (require) {
  'use strict';
  
  require('googleMapsLoader');
  require('jquery.geocomplete');
  
  var _ = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , AddressSearchTemplate = require('text!../../templates/addressSearch.tmpl')
    , EventBus      = require('eventBus');
  
  var BACKSPACE_KEY = 8;

  function parseAddress(address) {
    var splitAddress = address.split(', ');
    var stateZip = splitAddress[2].split(' ');
    
    return {
      streetAddress: splitAddress[0],
      city: splitAddress[1],
      state: stateZip[0],
      zip: stateZip[1]
    };
  }
  
  function isValidAddress(address) {
    try {
      return !!parseAddress(address) && isValidZip(address);
    } catch (e){
      return false;
    } 
  }
  
  function isValidZip(address) {
    try {
      var parsedAddress = parseAddress(address);
      return parsedAddress.zip !== undefined;
    } catch (e){
      return true;
    }
  }

  ViewTheWorld.Views.AddressSearch = Backbone.View.extend({
    events: {
      'click #get-started': 'getStarted',
      'blur  #street-address': 'hideGeocompletePopup',
      'focus #street-address-placeholder': 'showGeocompletePopup',
      'input .street-address': 'addressChanged'
    },

    initialize: function(options) {
      this.activeLocation = options.activeLocation;
      this.loginInfoModel = options.loginInfoModel;
      this.activeStepModel = options.activeStepModel;
      this.customerModel = options.customerModel;
      this.listenTo(EventBus, "hideGeocompletePopup", this.hideGeocompletePopup, this);
      this.tourOperatorView = options.tourOperatorView;
    },

    render: function() {
      var templateAttributes = {
        addressString: this.customerModel.get('addressString'),
        isValidAddress: isValidAddress(this.customerModel.get('addressString')),
        isValidZip: isValidZip(this.customerModel.get('addressString'))
      };
      
      var template =  _.template(AddressSearchTemplate, templateAttributes);
      this.$el.html(template);

      this.setupSyncStreetAddressValue();
      this.setupGeoComplete();

      return this;
    },

    logoutSalesRep: function(loginInfoModel) {
      loginInfoModel.set('isLoggedIn', false);
      Backbone.history.navigate('#login', true);
    },

    showGeocompletePopup: function() {
      var $geocompleteTextBox = $("#geocomplete-textbox");
      var $streetAddressGeocomplete = $("#street-address");
      
      $geocompleteTextBox.show();
      $streetAddressGeocomplete.focus();
    },

    hideGeocompletePopup: function() {
      var $geocompleteTextBox = $("#geocomplete-textbox");
      $geocompleteTextBox.hide();

      this.clearLocation();
    },
    
    addressChanged: function(event) {
      if (event.target.value !== '') {
        EventBus.trigger('pauseTour');
      }
      setTimeout(function(){
        for (var i = 0; i < $(".pac-item").length; i++) {
          if (i >= 3) {
            $($('.pac-item')[i]).hide();
          }
        }
      }, 205);
    },
    
    getStarted: function() {
      var streetAddress = this.$el.find("#street-address").val();
      if (streetAddress === "/logout") {
        this.logoutSalesRep(this.loginInfoModel);
      } else if(streetAddress === "/lock") {
        Backbone.history.navigate('video', true);
      } else if(isValidAddress(streetAddress)){
        this.activeLocation.setLocation(this.userHomeAddress);

        this.tourOperatorView.goToLocationWithoutEffects(this.activeLocation);
        
        this.nextStep();
      }
    },

    clearLocation: function() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      
      var streetAddress = $("#street-address").val();
      if(streetAddress === '') {
        this.timeout = setTimeout(_.bind(function() {
          this.activeLocation.set('location', undefined);
        }, this), 120000);

        this.customerModel.set('addressString', '');
        this.render();
      }

    },

    setupGeoComplete: function() {
      var $el = this.$el.find('#street-address');
      
      var streetAddress = $el.geocomplete();
      streetAddress
        .bind("geocode:result", _.bind(function(event, result) {
          this.userHomeAddress = {
            address: result.formatted_address,
            latitude: result.geometry.location.lat(),
            longitude: result.geometry.location.lng()
          };
          
          this.activeLocation.setLocation({
            address:result.formatted_address,
            latitude: result.geometry.location.lat(),
            longitude: result.geometry.location.lng()
          });
          
          this.customerModel.set('addressString', result.formatted_address);
          
          this.render();
        }, this));
    },

    setupSyncStreetAddressValue: function() {
      $("#street-address").on("input", function() {
        var typed = $(this).val();
        $("#street-address-placeholder").val(typed);
      });

      this.preventBackspaceNavigatingBack();

      $("#street-address-placeholder").on("input", function() {
        var typed = $(this).val();
        var $streetAddressGeocomplete = $("#street-address");
        
        $streetAddressGeocomplete.val(typed);
        $streetAddressGeocomplete.focus();
      });
    },
    
    preventBackspaceNavigatingBack: function() {
      $("#street-address").on("keydown", function(e) {

        var typed;
        // Prevent the backspace key from navigating back.
        if (e.which === BACKSPACE_KEY) {
          e.preventDefault();
          var $streetAddress = $('#street-address');
          var addressVal = $streetAddress.val();
          typed = addressVal.substring(0, addressVal.length - 1);
          $streetAddress.val(typed);
        } else {
          typed = $(this).val();
        }

        $("#street-address-placeholder").val(typed);
      });
    },

    saveLeadAddress: function() {
      var address = this.activeLocation.getAddress();
      this.customerModel.setAddress(parseAddress(address));
    },
    
    nextStep: function() {
      this.saveLeadAddress();
      this.activeStepModel.setStep(2);
    }
  });
  
  return ViewTheWorld.Views.AddressSearch;
});
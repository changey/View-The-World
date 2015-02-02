define(function(require) {
  'use strict';

  var _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , ContactInfoTemplate = require('text!../../templates/contactInfo.tmpl')
    , VideoContactInfoTemplate = require('text!../../templates/videoContactInfo.tmpl')
    , CustomerModel = require('models/customer')
    , LeadInfoModel = require('models/leadInfo')
    , ThankYouTemplate = require('text!../../templates/thankyou.tmpl')
    , ElectricBillView = require('views/electricBill')
    , ActiveStepModel = require('models/activeStep')
    , AddressSearchView = require('views/addressSearch');

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
  
  ViewTheWorld.Views.ContactInfo = Backbone.View.extend({

    events: {
      'click #contact-info-done': 'checkErrors',
      'click #video-contact-done': 'checkErrors',
      'click #thank-you-done': 'clickThankYouDone',
      'focus #contact-address-placeholder': 'showGeocompletePopup',
      'blur  #contact-info-address': 'hideGeocompletePopup',
      'input #contact-info-address': 'syncContactAddressValue',
      'click #video-contact-clear': 'render',
      'touchmove #video-contact-form': 'moveForm',
      'touchmove #thank-you-dialog': 'moveForm'
    },
    
    initialize: function(options) {
      this.properties = options.properties || ViewTheWorld.Properties;      
      this.customerModel = new CustomerModel();
      this.customerModel.set("squareFootage", "");
      this.loginInfoModel = options.loginInfoModel;
      this.activeStepModel = options.activeStepModel || new ActiveStepModel();
      this.formType = options.formType;
      this.LOGOUT = "/logout";
      this.UNLOCK = "/unlock";
      this.BASE_URL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
      this.TOUR_URL = this.BASE_URL + '/#/tour';

      this.leadInfoModel = new LeadInfoModel({
        customerModel: this.customerModel,
        loginInfoModel: this.loginInfoModel
      });

      var loginInfo = JSON.parse(localStorage.getItem('LoginInfo'));
      if (loginInfo !== null) {
        this.branchName = loginInfo.branchName;
      }

      this.properties.fetch({
        success: _.bind(this.render, this)
      });

    },
    
    render: function() {
      this.renderContactInfoTemplate();
      
      if (this.formattedAddress) {
        this.$el.find("#contact-address-placeholder").val(this.formattedAddress);
      }
    },
    
    moveForm: function(e) {
      e.preventDefault();
    },

    setupGeoComplete: function() {
      var $el = this.$el.find('#contact-info-address');

      var streetAddress = $el.geocomplete();
      streetAddress
        .bind("geocode:result", _.bind(function(event, result) {

          this.formattedAddress = result.formatted_address;
          this.$el.find("#contact-address-placeholder").val(this.formattedAddress);
          this.customerModel.setAddress(parseAddress(this.formattedAddress));

          this.render();
        }, this));
    },

    showGeocompletePopup: function() {
      var $geocompleteTextBox = this.$el.find("#contact-info-geocomplete");
      var $streetAddressGeocomplete = this.$el.find("#contact-info-address");
      
      var currentTypedAddress = this.$el.find("#contact-address-placeholder").val();
      $streetAddressGeocomplete.val(currentTypedAddress);

      $geocompleteTextBox.show();
      $streetAddressGeocomplete.focus();
    },

    hideGeocompletePopup: function() {
      var $geocompleteTextBox = this.$el.find("#contact-info-geocomplete");
      $geocompleteTextBox.hide();
      this.$el.find("#contact-address-placeholder").val("");
    },

    syncContactAddressValue: function(e) {
      
      var typed = $(e.currentTarget).val();
      this.$el.find("#contact-address-placeholder").val(typed);

    },
    
    renderContactInfoTemplate: function(attributes, errors) {
      
      var contactAttributes = attributes || {};
      var contactErrors = errors || {};
      
      var salesforceUrl = this.branchName === "BrightCurrent" ?
        this.properties.BrightCurrentWebToLeadUrl : this.properties.SalesForceWebToLeadUrl;
      
      var isVideoType = this.formType === "video";
      
      var contactInfoTemplate = isVideoType ? VideoContactInfoTemplate : ContactInfoTemplate;
      var template = _.template(contactInfoTemplate, {
        salesReps: this.loginInfoModel.get('emails'),
        salesforceUrl: salesforceUrl,
        attributes: contactAttributes,
        errors: contactErrors
      });
      this.$el.html(template);

      if (isVideoType) {
        this.$el.show();
      }

      this.setupGeoComplete();
      
      if (this.activeStepModel.getStep() === 2) {
        this.$el.find('#contact-info-form').addClass('bill');
        this.$el.find('#contact-info-geocomplete').addClass('bill');
      }
    },

    checkErrors: function() {
      var attributes = {
        address: this.$el.find('#contact-address-placeholder').val(),
        firstName: this.$el.find('#contact-first-name').val(),
        lastName: this.$el.find('#contact-last-name').val(),
        email: this.$el.find('#contact-email').val(),
        phone: this.$el.find('#contact-phone').val()
      };
      
      if (attributes.firstName === this.LOGOUT ||
        attributes.lastName === this.LOGOUT ||
        attributes.email === this.LOGOUT ||
        attributes.phone === this.LOGOUT) {
        AddressSearchView.prototype.logoutSalesRep(this.loginInfoModel);
      } else if (attributes.firstName === this.UNLOCK ||
        attributes.lastName === this.UNLOCK ||
        attributes.email === this.UNLOCK ||
        attributes.phone === this.UNLOCK) {
        location.replace(this.TOUR_URL);
      } else {
      
        var addressMissing = this.formType !== "video" && attributes.address === "";
        var firstNameMissing = attributes.firstName === "";
        var lastNameMissing = attributes.lastName === "";
        var emailInvalid = attributes.email !== "" && !this.validateEmail(attributes.email);
        var emailAndPhoneMissing = attributes.email === "" && attributes.phone === "";
        
        var errors = {
          addressMissing: addressMissing,
          firstNameMissing: firstNameMissing,
          lastNameMissing: lastNameMissing,
          emailAndPhoneMissing: emailAndPhoneMissing || emailInvalid
        };
        
        var allClear = !(addressMissing || firstNameMissing || lastNameMissing || emailAndPhoneMissing || emailInvalid);
        
        if (allClear) {
          this.$el.find('.error').hide();
          this.validateAndSubmit();
        } else {
          this.renderContactInfoTemplate(attributes, errors);
        }
      }
    },

    validateEmail: function(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },

    validateAndSubmit: function(){
      var salesRepEmail = this.$el.find('#contact-sales-reps').val();
      
      if (this.formType === "video") {
        salesRepEmail = this.loginInfoModel.get('emails')[0];
      }

      this.loginInfoModel.set('email', salesRepEmail);
      var email = this.$el.find("#contact-email").val();
      this.customerModel.set('email', email);

      var firstName = this.$el.find("#contact-first-name").val();
      this.customerModel.set('firstName', firstName);

      var lastName = this.$el.find("#contact-last-name").val();
      this.customerModel.set('lastName', lastName);

      var phone = this.$el.find("#contact-phone").val();
      this.customerModel.set('phone', phone);

      this.customerModel.set('billAmount', "");

      this.sendContactLead();

    },

    sendContactLead: function() {
      
      var formSelector = "#contact-salesforce-form";
      
      var $form = this.$el.find(formSelector);

      ElectricBillView.prototype.prepareSalesForceLead($form, this.leadInfoModel, this.branchName);
      $form.submit();

      // wait before redirecting so we have a higher chance 
      // of sending the salesforce lead data first
      setTimeout(_.bind(function() {
        this.clearAllFields();
        var thankYouTemplate = _.template(ThankYouTemplate, {
          activeStep: this.activeStepModel.getStep()
        });
        this.$el.html(thankYouTemplate);

        this.$el.find('#thank-you-dialog').addClass('video-thank-you');
        
        setTimeout(_.bind(function() {
          this.renderContactInfoTemplate();
        }, this), 15000);
      }, this), 3000);

    },
    
    clickThankYouDone: function() {
      this.$el.hide();
      this.renderContactInfoTemplate();
    },
    
    clearAllFields: function() {
      this.$el.find("#contact-address-placeholder").val("");
      this.$el.find("#contact-first-name").val("");
      this.$el.find("#contact-last-name").val("");
      this.$el.find("#contact-phone").val("");
      this.$el.find("#contact-email").val("");
    }
    
  });

  return ViewTheWorld.Views.ContactInfo;
});
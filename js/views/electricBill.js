define(function(require) {
  'use strict';

  var $ = require('jquery')
    , _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , ElectricBillTemplate = require('text!../../templates/electricBill.tmpl')
    , Spinner = require('spinjs')
    , Redirector = require('lib/redirector')
    , EventBus = require('eventBus');

  function setupSpinner() {
    return new Spinner({
      length: 80,
      width: 12,
      className: 'spinner',
      color: "#fff",
      radius: 60,
      corners: 1
    });
  }

  function goToLightmile(endpoint, redirector, customerModel) {
    redirector.redirectTo(
      endpoint + $.param(customerModel.toJSON())
    );
  }

  ViewTheWorld.Views.ElectricBill = Backbone.View.extend({
    events: {
      'change #bill-range': 'changeBillRange',
      'touchmove #bill-range': 'changeBillRange', // hack for Kiosk
      'click #lightmile-submit': 'validateAndSubmit',
      'focus .customer-input': 'showLargePopup',
      'blur  #large-input': 'hideLargePopup'
    },

    initialize: function(options) {
      this.customerModel = options.customerModel;
      this.leadInfoModel = options.leadInfoModel;
      this.loginInfoModel = this.leadInfoModel.get('loginInfoModel');
      this.activeStepModel = options.activeStepModel;
      this.redirector = options.redirector || new Redirector();
      this.spinner = options.spinner || setupSpinner();
      this.properties = options.properties || ViewTheWorld.Properties;
      this.listenTo(EventBus, "hideLargePopup", this.hideLargePopup, this);
      this.branchName = options.branchName || "";

      var loginInfo = JSON.parse(localStorage.getItem('LoginInfo'));
      if (loginInfo !== null) {
        this.branchName = loginInfo.branchName;
      }
    },

    render: function() {
      
      var webToLeadUrl = this.branchName === "BrightCurrent" ? 
        this.properties.BrightCurrentWebToLeadUrl : this.properties.SalesForceWebToLeadUrl;
      
      var template = _.template(ElectricBillTemplate, {
        defaultBillAmount: parseInt(this.customerModel.get('billAmount')),
        salesforceUrl: webToLeadUrl,
        salesReps: this.loginInfoModel.get('emails')
      });
      this.$el.html(template);

      if (this.activeStepModel.get('step') === 3) {
        var $loading = this.$el.find('#loading');
        this.spinner.spin($loading[0]);
        $loading.fadeIn(800);
      }
      
      this.setupSyncLargeTextboxValue();

      return this;
    },

    prepareSalesForceLead: function(form, leadInfoModel, branchName) {
      form.empty(); // empty so don't add duplicate inputs
  
      _.each(leadInfoModel.getSalesforceJson(branchName), function(value, key) {
        var input = $("<input>", {
          type: "hidden",
          name: key,
          value: value
        });
        form.append(input);
      });
    },
    
    showLargePopup: function(event) {
      
      var customerInfoPlaceholder = {
        'first-name': 'First Name',
        'last-name': 'Last Name',
        'phone': 'Phone Number',
        'email': 'Email Address'
      };

      var $largeTextBox = $("#large-textbox");
      var $largeInput = $("#large-input");

      if (event) {
        var selectedInputName = event.target.name;
        var selectedInputValue = event.target.value;
  
        $largeInput.attr('placeholder', customerInfoPlaceholder[selectedInputName]);
        $largeInput.val(selectedInputValue);
        $largeInput.removeClass().addClass(selectedInputName);
      }
      
      $largeTextBox.show();
      $largeInput.focus();
    },
    
    hideLargePopup: function() {
      var $largeTextBox = $("#large-textbox");
      $largeTextBox.hide();
    },
    
    setupSyncLargeTextboxValue: function() {
      var $largeInput = $("#large-input");
      $largeInput.on("input", function() {
        
        var typed = $(this).val();  
        var selectedInput = $largeInput.attr("class");
        $('#' + selectedInput).val(typed);
      });
    },
    
    isValidBillAmount: function(amount) {
      return amount >= 0 && amount <= 9999;
    },

    changeBillRange: function(event) {
      var amount = $(event.currentTarget).val();
      this.$el.find('#bill-amount').val(amount);
      this.$el.find('.bill-amount#large-input').val(amount);
      this.setBillAmount(amount);
    },

    setBillAmount: function(amount) {
      this.customerModel.set('billAmount', amount);
    },

    sendLeadAndRedirect: function() {
      var $form = this.$el.find("#salesforce-form");

      this.activeStepModel.set('step', 3);
      this.prepareSalesForceLead($form, this.leadInfoModel);
      $form.submit();

      // wait before redirecting so we have a higher chance 
      // of sending the salesforce lead data first
      setTimeout(_.bind(function() {
        goToLightmile(
          this.properties.LightmileEndpointUrl,
          this.redirector,
          this.customerModel
        );
      }, this), 3000);
    },
    
    validateAndSubmit: function(){
      var amount = this.$el.find("#bill-amount").val();
      
      if(this.isValidBillAmount(amount)) {
        $('#bill-amount-error').hide();
      
        this.setBillAmount(amount);

        var salesRepEmail = this.$el.find('#sales-reps').val();
        this.loginInfoModel.set('email', salesRepEmail);
        var email = this.$el.find("#email").val();
        this.customerModel.set('email', email);

        var firstName = this.$el.find("#first-name").val();
        this.customerModel.set('firstName', firstName);

        var lastName = this.$el.find("#last-name").val();
        this.customerModel.set('lastName', lastName);

        var phone = this.$el.find("#phone").val();
        this.customerModel.set('phone', phone);

        this.sendLeadAndRedirect();
        
      } else {
        $('#bill-amount-error').show();
      }     
      
    }
  });

  return ViewTheWorld.Views.ElectricBill;
});
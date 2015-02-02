define(function(require) {
  'use strict';

  require('jquery.ui');
  require('animateSprite');
  
  var _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , HomeInfoTemplate = require('text!../../templates/homeInfo.tmpl')
    , EligibleTemplate = require('text!../../templates/quick_assessment/eligible.tmpl')
    , IneligibleTemplate = require('text!../../templates/quick_assessment/ineligible.tmpl')
    , GetStartedTemplate = require('text!../../templates/quick_assessment/getStarted.tmpl')
    , LaterTemplate = require('text!../../templates/quick_assessment/later.tmpl')
    , AssessmentThankYouTemplate = require('text!../../templates/quick_assessment/assessmentThankYou.tmpl')
    , Redirector = require('lib/redirector')
    , LeadInfoModel = require('models/leadInfo')
    , Spinner = require('spinjs')
    , accounting = require('accounting')
    , Dragdealer = require('dragdealer')
    , SalesforceLeadModel = require('models/salesforceLead');

  function goToLightmile(endpoint, redirector, customerModel, referer) {
    redirector.redirectTo(
      endpoint + $.param(customerModel.toJSON()) + "&Referer=" + referer
    );
  }

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
  
  ViewTheWorld.Views.HomeInfo = Backbone.View.extend({

    events: {
      'click #quick-assessment-done': 'startQuickAssessment',
      'click #return-to-tour': 'returnToTour',
      'click #eligible-start': 'clickEligibleStart',
      'click #get-started-cancel': 'cancelGetStarted',
      'click #later': 'clickLater',
      'click #later-done': 'clickLaterDone',
      'click #thank-you-done': 'returnToTour',
      'click #get-started-continue': 'continueToLightmile',
      'touchmove #bill-range': 'changeBillRange', // hack for Kiosk
      'touchmove #square-footage-range': 'changeSquareFootage',
      'blur #square-footage': 'finishUpdateSquareFootage',
      'click #quick-assessment-back': 'backToAddress'
    },
    
    initialize: function(options) {
      this.loginInfoModel = options.loginInfoModel;
      this.properties = options.properties || ViewTheWorld.Properties;
      this.redirector = options.redirector || new Redirector();
      this.customerModel = options.customerModel;
      this.activeStepModel = options.activeStepModel;
      this.spinner = options.spinner || setupSpinner();
      this.LEAD_ORG_NOT_FOUND_ERROR = "Lead Organization Location Is required if Channel is Retail: [Lead_Organization_Location_2__c]";
      
      var loginInfo = JSON.parse(localStorage.getItem('LoginInfo'));
      if (loginInfo !== null) {
        this.branchName = loginInfo.branchName;
      }

      this.leadInfoModel = new LeadInfoModel({
        customerModel: this.customerModel,
        loginInfoModel: this.loginInfoModel
      });

      this.webToLeadUrl = this.branchName === "BrightCurrent" ?
        this.properties.BrightCurrentWebToLeadUrl : this.properties.SalesForceWebToLeadUrl;

      this.SALESFORCE_OAUTH_URL = this.properties.SalesForceOAuthUrl;
      this.CLIENT_ID = this.properties.SalesForceClientId;
      this.REDIRECT_URI = this.properties.SalesForceRedirectUrl;
      this.referer = this.properties.VtwBaseUrl;
      
      this.CUSTOMER_MODEL = "customerModel";
      
      this.genabilityBaseURL = "https://api.genability.com/";
      this.activeLocation = options.activeLocation;
      this.GENABILITY_USERNAME = '4d1800c6-4954-407e-8e25-66b9790f1b0e';
      this.GENABILITY_PASSWORD = 'b33ff12d-a0c1-4fee-b401-265361685bd6';
      this.SINGLE_FAMILY_DETACHED = "singleFamilyDetached";
      this.SINGLE_FAMILY_ATTACHED = "singleFamilyAttached";
      this.APARTMENT = "apartmentUnder5Units";
      this.ASSESSMENT_MIN = 0;
      this.ASSESSMENT_MEDIUM = 0.5;
      this.ASSESSMENT_MAX = 1;
      this.SLIDER_OFFSET = 22;

      this.savings = 49;
      this.roofOffset = 0.2;
      this.shadingOffset = 0.2;
      this.buildingType = this.SINGLE_FAMILY_DETACHED;
      this.eligibility = true;
      this.roofValue = this.ASSESSMENT_MEDIUM;
      this.shadeValue = this.ASSESSMENT_MEDIUM;
    },
    
    render: function() {
      
      var that = this;
      
      var template = _.template(HomeInfoTemplate, {
        defaultBillAmount: parseInt(this.customerModel.get('billAmount')),
        defaultSquareFootage: parseInt(this.customerModel.get('squareFootage'))
      });
      this.$el.html(template);
      
      this.addGenabilityAccount();
      
      var sliders = ['slider-building-type', 'slider-basement', 'slider-roof', 'slider-shade'];
      
      _.each(sliders, function(slider) {
        new Dragdealer(slider, {
          x: that.ASSESSMENT_MEDIUM,
          steps: 3,
          left: that.SLIDER_OFFSET,
          right: that.SLIDER_OFFSET,
          callback: function(x) {

            var selectedType = this.handle.dataset.name;

            if (selectedType === "roofSpace") {
              that.roofOffset = that.calculateCoefficient(x);
              that.startAnimation(that.roofValue, x, "roof");
              that.roofValue = x;
            } else if (selectedType === "shadeArea") {
              that.shadingOffset = that.calculateCoefficient(x);
              that.startAnimation(that.shadeValue, x, "shade");
              that.shadeValue = x;
            } else if (selectedType === "buildingType") {
              if (x === that.ASSESSMENT_MIN) {
                that.buildingType = that.APARTMENT;
              } else if (x === that.ASSESSMENT_MEDIUM) {
                that.buildingType = that.SINGLE_FAMILY_DETACHED;
              } else {
                that.buildingType = that.SINGLE_FAMILY_ATTACHED;
              }
              
              that.updateBuildingType(that.buildingType);
            }
          }
        });
      });
      
      this.addGenabilityAccount();
      
      this.setupAnimation('.roof');
      this.setupAnimation('.shade');

      return this;
    },
    
    backToAddress: function() {
      this.activeStepModel.setStep(1);
    },
    
    setupAnimation: function(selector) {
      
      var animations;
      
      if (selector === ".roof") {
        animations = {
          M2L: [8, 9, 10, 11, 12, 13], //medium to large
          L2M: [13, 12, 11, 10, 9, 8], //large to medium
          S2M: [1, 2, 3, 4, 5, 6], //small to medium
          M2S: [6, 5, 4, 3, 2, 1], //medium to small
          S2L: [1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13], //small to large
          L2S: [13, 12, 11, 10, 9, 6, 5, 4, 3, 2, 1] //large to small
        };
      } else {
        animations = {
          M2L: [8, 10, 11, 12, 13, 15], //medium to large
          L2M: [15, 13, 12, 11, 10, 8], //large to medium
          S2M: [1, 2, 3, 6, 7, 8], //small to medium
          M2S: [8, 7, 6, 5, 3, 2, 1], //medium to small
          S2L: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15], //small to large
          L2S: [15, 13, 12, 11, 10, 8, 7, 6, 5, 3, 2, 1] //large to small
        };
      }
      
      $(selector).animateSprite({
        fps: 12,
        animations: animations,
        autoplay: false
      });
    },

    startAnimation: function(originalValue, newValue, type) {

      var selector = "." + type;
      if (originalValue === this.ASSESSMENT_MEDIUM) {
        if (newValue === this.ASSESSMENT_MAX) {
          $(selector).animateSprite('play', 'M2L');
        } else if (newValue === this.ASSESSMENT_MIN) {
          $(selector).animateSprite('play', 'M2S');
        }
      } else if (originalValue === this.ASSESSMENT_MAX) {
        if (newValue === this.ASSESSMENT_MEDIUM) {
          $(selector).animateSprite('play', 'L2M');
        } else if (newValue === this.ASSESSMENT_MIN) {
          $(selector).animateSprite('play', 'L2S');
        }
      } else if (originalValue === this.ASSESSMENT_MIN) {
        if (newValue === this.ASSESSMENT_MEDIUM) {
          $(selector).animateSprite('play', 'S2M');
        } else if (newValue === this.ASSESSMENT_MAX) {
          $(selector).animateSprite('play', 'S2L');
        }
      }
    },

    finishUpdateSquareFootage: function() {
      var sqaureFootage = this.$el.find('#square-footage').val();
      this.updateBuidingArea(sqaureFootage);
    },

    changeBillRange: function(event) {
      var amount = $(event.currentTarget).val();
      this.$el.find('#bill-amount').val(amount);
      this.$el.find('.bill-amount#large-input').val(amount);
      this.setBillAmount(amount);
    },
    
    changeSquareFootage: function(event) {
      var amount = $(event.currentTarget).val();
      this.$el.find('#square-footage').val(amount);
      this.updateBuidingArea(amount);
      this.setSquareFootage(amount);
    },

    setBillAmount: function(amount) {
      this.customerModel.set('billAmount', amount);
    },
    
    setSquareFootage: function(amount) {
      this.customerModel.set('squareFootage', amount);
    },
    
    startQuickAssessment: function() {
      var amount = this.$el.find("#bill-amount").val();
      this.setBillAmount(amount);

      var squareFootage = this.$el.find("#square-footage").val();
      this.setSquareFootage(squareFootage);
      
      if (this.eligibility) {
        this.directEligible();
      } else {
        this.directIneligible();
      }
    },
    
    updateBuildingType: function(buildingType) {
      
      var that = this;
      
      var inputData = {
        "keyName": "buildingTypeResidential",
        "dataValue": buildingType
      };

      $.ajax({
        type: 'PUT',
        contentType: "application/json",
        crossDomain: true,
        dataType: "json",
        url: this.genabilityBaseURL + 'rest/v1/accounts/pid/' + this.guid + '/properties?appId=' + this.GENABILITY_USERNAME +  '&appKey=' + this.GENABILITY_PASSWORD,
        data: JSON.stringify(inputData),
        success: function() {
          that.getSavings();
        }
      });
    },
    
    updateBuidingArea: function(buildingArea) {
      var that = this;

      var inputData = {
        "keyName": "buildingArea",
        "dataValue": buildingArea
      };

      $.ajax({
        type: 'PUT',
        contentType: "application/json",
        crossDomain: true,
        dataType: "json",
        url: this.genabilityBaseURL + 'rest/v1/accounts/pid/' + this.guid + '/properties?appId=' + this.GENABILITY_USERNAME +  '&appKey=' + this.GENABILITY_PASSWORD,
        data: JSON.stringify(inputData),
        success: function() {
          that.getSavings();
        }
      });
    },

    getSavings: function() {
      
      var that = this;
      
      var inputData = {
        "providerAccountId" : this.guid,
        "fromDateTime" : "20140901",
        "propertyInputs" : [ {
          "scenarios" : "before,after",
          "keyName" : "rateInflation",
          "dataValue" : "3.5"
        }, {
          "scenarios" : "solar",
          "keyName" : "rateInflation",
          "dataValue" : "1.9"
        }, {
          "scenarios" : "after,solar",
          "keyName" : "solarDegradation",
          "dataValue" : "1.5"
        }, {
          "scenarios" : "before,after,solar",
          "keyName" : "baselineType",
          "dataValue" : "TYPICAL"
        } ],
        "rateInputs" : [ {
          "scenarios" : "solar",
          "chargeType" : "CONSUMPTION_BASED",
          "rateBands" : [ {
            "rateAmount" : 0.155
          } ]
        } ]
      };

      $.ajax({
        type: 'POST',
        contentType: "application/json",
        crossDomain: true,
        dataType: "json",
        data: JSON.stringify(inputData),
        url: this.genabilityBaseURL + 'rest/v1/accounts/analysis?appId=' + this.GENABILITY_USERNAME +  '&appKey=' + this.GENABILITY_PASSWORD,
        success: function(data) {
          that.savings = data.results[0].summary.lifetimeAvoidedCost;
          that.eligibility = that.savings > 0;
        }
      });
    },
    
    addGenabilityAccount: function() {
      
      var that = this;
      
      this.guid = this.generateGuid();
      
      var address = "";
      if (this.activeLocation) {
        address = this.activeLocation.get('location').get('address');
      }

      var inputData = {
        "providerAccountId": this.guid,
        "address":{
          "addressString": address
        },
        "properties": {
          "customerClass":{
            "keyName":"customerClass",
            "dataValue":"1" //residential
          }
        }
      };

      $.ajax({
        type: 'PUT',
        contentType: "application/json",
        crossDomain: true,
        dataType: "json",
        url: this.genabilityBaseURL + 'rest/v1/accounts?appId=' + this.GENABILITY_USERNAME +  '&appKey=' + this.GENABILITY_PASSWORD,
        data: JSON.stringify(inputData),
        success: function() {
          that.updateBuildingType(that.buildingType);
        }
      });
    },
    
    generateGuid: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },

    checkErrors: function() {

      var attributes = {
        firstName: this.$el.find('#first-name').val(),
        lastName: this.$el.find('#last-name').val(),
        email: this.$el.find('#email').val(),
        phone: this.$el.find('#phone').val()
      };

      var firstNameMissing = attributes.firstName === "";
      var lastNameMissing = attributes.lastName === "";
      var emailAndPhoneMissing = attributes.email === "" && attributes.phone === "";
      var emailInvalid = attributes.email !== "" && !this.validateEmail(attributes.email);

      var errors = {
        firstNameMissing: firstNameMissing,
        lastNameMissing: lastNameMissing,
        emailAndPhoneMissing: emailAndPhoneMissing || emailInvalid
      };

      var allClear = !(firstNameMissing || lastNameMissing || emailAndPhoneMissing || emailInvalid);

      return {
        attributes: attributes,
        errors: errors,
        allClear: allClear
      };
    },

    validateEmail: function(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },

    calculateCoefficient: function(originalValue) {
      
      var output = 0;
      
      if (originalValue === 0) {
        output = 0.4;
      } else if (originalValue === 0.5) {
        output = 0.2;
      } else {
        output = 0;
      }
      
      return output;
    },

    submit: function(){
      
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

      this.sendLead();

    },

    sendLead: function() {
      
      if(this.branchName === "BrightCurrent") {
        var $form = this.$el.find("#assessment-salesforce-form");

        this.prepareSalesForceLead($form, this.leadInfoModel);
        $form.submit();
        this.redirectToLightmile();
      } else {
        
        var salesforceSecurity = JSON.parse(localStorage.getItem('salesforceSecurity'));
        
        var lead = this.leadInfoModel.getLeadAPIJson();
        lead.lightmileBaseUrl = this.properties.LightmileBaseUrl;
        lead.leadQualifier = salesforceSecurity.userEmail;
                
        localStorage.setItem(this.CUSTOMER_MODEL, JSON.stringify(this.customerModel.getJsonWithOriginalKeys()));
        var payload = {
          "lead": lead,
          "salesforceSecurity": salesforceSecurity
        };

        this.sendLeadAPIRequest(payload, this.properties, this.redirector);
      }
      
    },
    
    sendLeadAPIRequest: function(payload, properties, redirector) {
      var that = this;
      
      this.showSpinner();

      var salesforceLeadModel = new SalesforceLeadModel({
        lead: payload.lead,
        salesforceSecurity: payload.salesforceSecurity
      });
      salesforceLeadModel.save(null,
        {
        success: function(model, result) {
          if(that.loginInfoModel) {
            that.loginInfoModel.set('leadOrganizationId', result.leadOrgLocationId);
          }
          redirector.redirectTo(
            properties.LightmileBaseUrl + '/sunrun' + result.prospectUrlPath
          );
        },
        error: function(model, response) {
          if (response.status === 401) {
            redirector.redirectTo(that.SALESFORCE_OAUTH_URL + "?response_type=token&state=reauthorize&client_id=" +
              that.CLIENT_ID + "&redirect_uri=" + that.REDIRECT_URI);
          } else if (response.status === 406) {
            if (response.responseJSON.message === that.LEAD_ORG_NOT_FOUND_ERROR) {
              that.hideSpinner();
              that.clickEligibleStart(null, {leadOrgNameNotFound: true});
            }
          }
        }
      });
    },

    //the reason that this method is the same as that in electriBill.js is because we want
    //the quick assessment feature to replace the electric bill form, so electricBill.js will
    //be removed eventually
    prepareSalesForceLead: function(form, leadInfoModel) {
      form.empty(); // empty so don't add duplicate inputs

      _.each(leadInfoModel.getSalesforceJson(this.branchName), function(value, key) {
        var input = $("<input>", {
          type: "hidden",
          name: key,
          value: value
        });
        form.append(input);
      });
    },
    
    showSpinner: function() {
      if (this.$el) {
        var $loading = this.$el.find('#loading');
        this.spinner.spin($loading[0]);
        $loading.fadeIn(800);
      }
    },
    
    hideSpinner: function() {
      var $loading = this.$el.find('#loading');
      this.spinner.stop();
      $loading.fadeOut();
    },
    
    redirectToLightmile: function() {

      this.showSpinner();
      
      // wait before redirecting so we have a higher chance 
      // of sending the salesforce lead data first
      setTimeout(_.bind(function() {
        goToLightmile(
          this.properties.LightmileEndpointUrl,
          this.redirector,
          this.customerModel,
          this.referer
        );
      }, this), 3000);
    },
    
    renderThankYouTemplate: function() {

      this.showSpinner();
      
      setTimeout(_.bind(function() {
        var template = _.template(AssessmentThankYouTemplate);
        this.$el.html(template);
      }, this), 3000);
    },
    
    continueToLightmile: function() {

      var check = this.checkErrors();
      
      if (check.allClear) {
        this.$el.find('.error').hide();
        this.submit();
      } else {
        this.clickEligibleStart(check.attributes, check.errors);
      }
    },

    clickLaterDone: function() {

      var check = this.checkErrors();

      if (check.allClear) {
        this.$el.find('.error').hide();
        this.submit();
        this.renderThankYouTemplate();
      } else {
        this.clickLater(check.attributes, check.errors);
      }
    },

    clickEligibleStart: function(attributes, errors) {

      var assessmentAttributes = attributes || {};
      var assessmentErrors = errors || {};
      
      var template = _.template(GetStartedTemplate, {
        salesReps: this.loginInfoModel.get('emails'),
        salesforceUrl: this.webToLeadUrl,
        attributes: assessmentAttributes,
        errors: assessmentErrors
      });
      this.$el.html(template);
    },
    
    cancelGetStarted: function() {
      this.returnToTour();
    },
    
    clickLater: function(attributes, errors) {

      var assessmentAttributes = attributes || {};
      var assessmentErrors = errors || {};
      
      var template = _.template(LaterTemplate, {
        salesReps: this.loginInfoModel.get('emails'),
        salesforceUrl: this.webToLeadUrl,
        attributes: assessmentAttributes,
        errors: assessmentErrors
      });
      this.$el.html(template);
    },
    
    returnToTour: function() {
      location.reload();
    },

    directEligible: function() {

      this.formattedSavingsRange = {};
      
      this.savings = this.savings * (1 - this.roofOffset - this.shadingOffset);
      this.unformattedSavingsRange = this.calculateSavingsRange(this.savings);
      this.formattedSavingsRange.min = accounting.formatMoney(this.unformattedSavingsRange.min, '$', 0);
      this.formattedSavingsRange.max = accounting.formatMoney(this.unformattedSavingsRange.max, '$', 0);
      this.formattedSavingsRange.category = this.unformattedSavingsRange.category;
      
      var template = _.template(EligibleTemplate, {
        savingsRange: this.formattedSavingsRange,
        savings: accounting.formatMoney(this.savings, '$', 0)
      });
      this.$el.html(template);
    },
    
    calculateSavingsRange: function(rawSavings) {
      
      var savingsRange = {};
      
      if(rawSavings <= 5000 && rawSavings > 50) {
        savingsRange = {
          min: 0,
          max: 5000,
          category: 1
        };
      } else if (rawSavings > 5000 && rawSavings <= 10000) {
        savingsRange = {
          min: 5000,
          max: 10000,
          category: 2
        };
      } else if (rawSavings > 10000 && rawSavings <= 15000) {
        savingsRange = {
          min: 10000,
          max: 15000,
          category: 3
        };
      } else if (rawSavings > 15000) {
        savingsRange = {
          min: 15000,
          category: 4
        };
      } else if (rawSavings <= 50) {
        savingsRange = {
          category: 5
        };
      }
      
      return savingsRange;
    },
    
    directIneligible: function() {

      var template = _.template(IneligibleTemplate);
      this.$el.html(template);
    },
    
  });

  return ViewTheWorld.Views.HomeInfo;
});
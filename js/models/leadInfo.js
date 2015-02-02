define(function (require) {
  'use strict';
  
  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , _             = require('underscore');

  ViewTheWorld.Models.LeadInfo = Backbone.Model.extend({ 
    initialize: function(options){
      this.properties = options.properties || ViewTheWorld.Properties;  
    },
    
    getLeadAPIJson: function() {
      
      var DEFAULT_USAGE_OPTION = "Basic";
      
      var result = {
        'leadOrigin': 'Sunrun',
        'leadClassification': 'Field Sales',
        'salesRep': this.getSalesRepEmail(),
        'notes': this.formattedNotes(),
        'channel': 'Retail',
        "externalSource": "Sunrun Solar Station",
        'leadSource': 'Retail: ' + this.getLeadSourceStoreType() + ' Solar Station',
        'avgMonthlyElectricityBill':  this.getCustomerMonthlyBillAmount(),
        'customerFirstName': this.getCustomerFirstName(),
        'customerLastName': this.getCustomerLastName(),
        'customerEmail': this.getCustomerEmail(),
        'customerPrimayPhone': this.getCustomerPhone(),
        'customerCity': this.getCustomerCity(),
        'customerState': this.getCustomerState(),
        'customerZipCode': this.getCustomerZip(),
        'customerStreet': this.getCustomerStreetAddress(),
        'homeSize': this.getCustomerSquareFootage(),
        'fieldMarketingBranch': this.getBranchName(),
        'usageOption': DEFAULT_USAGE_OPTION
      };

      if (this.getLeadOrganizationId()) {
        result.leadOrgLocationId = this.getLeadOrganizationId();
      } else {
        result.leadOrgLocationName = this.getLeadOrganization();
      }

      return result;
    },

    getSalesforceJson: function(branchName) {
      var mapping = {
        'retURL': "http://r20.sunrundev.com",
        'leadOrigin': 'Sunrun',
        'leadClassification': 'Field Sales',
        'salesRepEmail': this.getSalesRepEmail(),
        'notes': this.formattedNotes(),
        'channel': 'Retail',
        'leadSource': 'Retail: ' + this.getLeadSourceStoreType() + ' Solar Station',
        'monthlyElectricBill':  this.getCustomerMonthlyBillAmount(),
        'firstName': this.getCustomerFirstName(),
        'lastName': this.getCustomerLastName(),
        'email': this.getCustomerEmail(),
        'phone': this.getCustomerPhone(),
        'city': this.getCustomerCity(),
        'state': this.getCustomerState(),
        'zip': this.getCustomerZip(),
        'street': this.getCustomerStreetAddress(),
        'squareFootage': this.getCustomerSquareFootage(),
        'leadOrganization': this.getLeadOrganization(),
        'branchName': this.getBranchName()
      };
      
      var isBrightCurrent = branchName === "BrightCurrent";
      var fieldIds;
      
      if (isBrightCurrent) {
        mapping.calledCenterPartner = "Sunrun";
        mapping.locationPicklist = "SunRun Solar Station";
        mapping.description = this.formattedNotes();
        mapping.recLeadSource = "Costco Road Show";
        mapping.oid = this.properties.BrightCurrentOid;
        mapping.retURL = "http://www.brightcurrent.com";
        fieldIds = this.properties.BrightCurrentFieldIds;
      } else {
        mapping.oid = this.properties.SalesForceOid;
        mapping.retURL = "https://r30.sunrundev.com";
        fieldIds = this.properties.SalesForceFieldIds;
      }

      var result = {};
      _.each(mapping, _.bind(function(fieldValue, fieldName){
        var fieldId = fieldIds[fieldName];
        if( fieldId ){
          result[fieldId] = fieldValue;
        } else {
          result[fieldName] = fieldValue;
        }
      }, this));
      
      return result;
    },
    
    getCustomerSquareFootage: function(){
      return this.get('customerModel').get('squareFootage');
    },
    
    getCustomerState: function(){
      return this.get('customerModel').get('state');
    },

    getCustomerMonthlyBillAmount: function(){
      return this.get('customerModel').getMonthlyBillAmount();
    },

    getCustomerFirstName: function(){
      return this.get('customerModel').get('firstName');
    },

    getCustomerLastName: function(){
      return this.get('customerModel').get('lastName');
    },

    getCustomerEmail: function(){
      return this.get('customerModel').get('email');
    },

    getCustomerPhone: function(){
      return this.get('customerModel').get('phone');
    },

    getCustomerZip: function(){
      return this.get('customerModel').get('zip');
    },
    
    getCustomerStreetAddress: function(){
      return this.get('customerModel').get('streetAddress');
    },
    
    getCustomerCity: function(){
      return this.get('customerModel').get('city');
    },
    
    getLoginInfo: function(){
      return this.get('loginInfoModel');
    },
    
    getSalesRepEmail: function(){
      return this.getLoginInfo().get('email');
    },
    
    getStoreType: function(){
      return this.getLoginInfo().get('storeName');  
    },
    
    getLeadSourceStoreType: function() {
      return this.getLoginInfo().get('leadSourceStoreType');
    },
    
    getStoreId: function() {
      return this.getLoginInfo().get('storeId');
    },
    
    getLeadOrganization: function() {
      return this.getLoginInfo().get('leadOrganization');
    },

    getLeadOrganizationId: function() {
      return this.getLoginInfo().get('leadOrganizationId');
    },
    
    getBranchName: function() {
      return this.getLoginInfo().get('branchName');
    },
    
    formattedNotes: function(){
      return "Lead source notes: " +
        "Lead Organization: " + this.getLeadOrganization() + ", " +
        "Store Name: " + this.getStoreType() + ", " +
        "Sales Rep Email: " + this.getSalesRepEmail();
    },

    getUnqualifiedFields: function() {
      return {
        "leadStatus": "Unqualified",
        "whyUnqualified": "Other",
        "reason": "Other"
      };
    }
  }); 
  return ViewTheWorld.Models.LeadInfo;
});

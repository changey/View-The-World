define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , Redirector = require('lib/redirector')
    , LeadInfoModel = require('models/leadInfo')
    , CustomerModel = require('models/customer')
    , HomeInfoView = require('views/homeInfo')
    , _ = require('underscore')
    , SalesforceIdModel = require('models/salesforceId')
    , SfcallbackTemplate = require('text!../../templates/sfcallback.tmpl')
    , Spinner = require('spinjs');

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
  
  ViewTheWorld.Views.Sfcallback = Backbone.View.extend({
    
    initialize: function(options) {
      
      this.BASE_URL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
      this.TOUR_URL = this.BASE_URL + '/#/tour';
      this.redirector = options.redirector || new Redirector();
      this.properties = options.properties || ViewTheWorld.Properties;
      this.model = options.model;
      this.spinner = options.spinner || setupSpinner();
      
      this.params = options.params;
      this.SALESFORCE_SECURITY = "salesforceSecurity";
      this.salesforceIdModel = new SalesforceIdModel({
        id: this.params.id,
        access_token: this.params.access_token
      });
      
      this.render();
          
    },
    
    render: function() {

      var that = this;

      if (this.params.state === "reauthorize") {
        var template = _.template(SfcallbackTemplate, {
        });
        this.$el.html(template);
      }
      
      this.salesforceIdModel.save(null, {
        dataType: 'jsonp',
        success: function(model, result) {
          that.setSalesforceSecurity(result.email);
        }
      });
    },
    
    setSalesforceSecurity: function(userEmail) {
      var salesforceSecurity = {
        "accessToken": this.params.access_token,
        "instanceId": this.params.instance_url,
        "userEmail": userEmail,
        "returnUrl": this.BASE_URL
      };

      localStorage.setItem(this.SALESFORCE_SECURITY, JSON.stringify(salesforceSecurity));

      this.loginInfoModel = this.model.get('loginInfoModel');

      this.loginInfoModel.set('isLoggedIn', true);
      if (this.params.state === "login") {
        this.redirector.redirectTo(this.TOUR_URL);
      } else {
        this.properties.fetch({
          success: _.bind(this.sendLeadAPIRequest, this)
        });
      }
    },
    
    sendLeadAPIRequest: function() {
      
      var customerModel = new CustomerModel(JSON.parse(localStorage.getItem("customerModel")));
      var leadInfoModel = new LeadInfoModel({
        loginInfoModel: this.loginInfoModel,
        customerModel: customerModel
      });
      var lead = leadInfoModel.getLeadAPIJson();
      var salesforceSecurity = JSON.parse(localStorage.getItem('salesforceSecurity'));

      lead.lightmileBaseUrl = this.properties.LightmileBaseUrl;
      lead.leadQualifier = salesforceSecurity.userEmail;

      var payload = {
        "lead": lead,
        "salesforceSecurity": salesforceSecurity
      };
      this.showSpinner();
      HomeInfoView.prototype.sendLeadAPIRequest(payload, this.properties, this.redirector);
    },

    showSpinner: function() {
      var $loading = this.$el.find('#loading');
      this.spinner.spin($loading[0]);
      $loading.fadeIn(800);
    }
  });
  
  return ViewTheWorld.Views.Sfcallback;
});
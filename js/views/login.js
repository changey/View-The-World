define(function (require) {
  'use strict';
  
  var $             = require('jquery')
    , _             = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , HeaderView    = require('views/header')
    , ActiveStepModel = require('models/activeStep')
    , LoginTemplate = require('text!../../templates/login.tmpl')
    , BranchesCollection = require('collections/branches')
    , LeadOrganizationsCollection = require('collections/leadOrganizations')
    , Redirector = require('lib/redirector');


  ViewTheWorld.Views.Login = Backbone.View.extend({
    events: {
      'click #login-button': 'login',
      'click .add-email': 'addEmailField',
      'click .remove-email': 'removeEmailField',
      'click #loop-mode': 'loopMode'
    },

    initialize: function(options) {
      
      this.model = options.model;
      
      this.createSubViews();

      this.branchesCollection = new BranchesCollection();
      this.leadOrganizationsCollection = new LeadOrganizationsCollection();
      this.branchesCollection.fetch({
        success: _.bind(this.fetchLeadOrganizations, this)
      });

      this.properties = options.properties || ViewTheWorld.Properties;

      this.properties.fetch({
        success: _.bind(this.setProperties, this)
      });

      this.redirector = options.redirector || new Redirector();
    },
    
    createSubViews: function() {
      this.headerView = new HeaderView({
        el: '#header',
        activeStepModel: new ActiveStepModel({ step: 0 })
      });
    },
    
    fetchLeadOrganizations: function() {
      
      this.leadOrganizationsCollection.fetch({
        success: _.bind(this.render, this)
      });
    },
    
    setProperties: function() {
      this.SALESFORCE_OAUTH_URL = this.properties.SalesForceOAuthUrl;
      this.CLIENT_ID = this.properties.SalesForceClientId;
      this.REDIRECT_URI = this.properties.SalesForceRedirectUrl;
      
      this.render();
    },

    render: function() {
      $('#map-canvas').hide();
      $('#faded-in-map-canvas').hide();

      this.assign(this.headerView, '#header');
      this.model.set('errors', this.checkErrors());

      var branches = [];

      _.each(this.branchesCollection.models, function(branchModel) {
        branches.push(branchModel.get('name'));
      });

      this.model.attributes.branches = branches;
      
      var template =  _.template(LoginTemplate, this.model.attributes);
      this.$el.find('#contents').html(template);
      
      var leadOrganizations = [];

      _.each(this.leadOrganizationsCollection.models, function(leadOrganizationModel) {
        leadOrganizations.push(leadOrganizationModel.get('name'));
      });

      $('#lead-organization').autocomplete({
        source: leadOrganizations,
        appendTo: '#lead-organization-container'
      });
      
      return this;
    },

    login: function(branchName) {
      this.preserveFormFields();
      
      var loginInfoModel = this.model.get('loginInfoModel');
      this.branchName = this.$el.find('#branch-name').val() || branchName;
      var isBrightCurrent = this.branchName === "BrightCurrent";

      if(loginInfoModel.isAuthorized()) {
        loginInfoModel.save();
        if(isBrightCurrent) {
          loginInfoModel.set('isLoggedIn', true);
          Backbone.history.navigate('tour', true);
        } else {
          if (this.SALESFORCE_OAUTH_URL) {
            this.callOAuthURL();
          }
        }
      }
      
      this.submitAttempted = true;
      this.render();
    },
    
    callOAuthURL: function() {
      this.redirector.redirectTo(this.SALESFORCE_OAUTH_URL + "?response_type=token&state=login&client_id=" +
        this.CLIENT_ID + "&redirect_uri=" + this.REDIRECT_URI);
    },
    
    loopMode: function() {
      this.preserveFormFields();

      var loginInfoModel = this.model.get('loginInfoModel');

      if(loginInfoModel.isAuthorized()) {
        loginInfoModel.set('isLoggedIn', true);
        loginInfoModel.save();
        Backbone.history.navigate('video', true);
      } else {
        this.submitAttempted = true;
        this.render();
      }
    },
    
    addEmailField: function() {
      this.preserveFormFields();

      this.model.get('loginInfoModel').get('emails')
        .push("");
      
      this.render();
    },
    
    removeEmailField: function(event) {
      this.preserveFormFields();
      
      this.model.get('loginInfoModel').get('emails')
        .splice($(event.target).attr('data'), 1);
      
      this.render();
    },
    
    preserveEmailFields: function() {
      var loginInfoModel = this.model.get('loginInfoModel');
      var emails = loginInfoModel.get('emails');
      _.each(this.$el.find('.email'), function(emailEl, index) {
        emails[index] = $(emailEl).val();
      });
    },
    
    preserveFormFields: function(){
      var loginInfoModel = this.model.get('loginInfoModel');
      var branchName = this.$el.find('#branch-name').val();
      var storeName = this.$el.find('#store-name').val();
      var leadSourceStoreType;
      if (storeName === 'Costco' || storeName === 'Best Buy') {
        loginInfoModel.set('leadSourceStoreType', storeName);
      } else {
        loginInfoModel.set('leadSourceStoreType', 'Sunrun');
      }
      leadSourceStoreType = loginInfoModel.getLeadSourceStoreType();
      
      var locationSet = this.$el.find('#location-set').val();

      loginInfoModel.attributes = {
        branchName: branchName === 'default' ? undefined : branchName,
        leadOrganization: this.$el.find('#lead-organization').val(),
        storeName: storeName === 'default' ? undefined : storeName,
        leadSourceStoreType: leadSourceStoreType,
        emails: [''],
        locationSet: locationSet === 'default' ? undefined : locationSet
      };

      this.preserveEmailFields();
    },
    
    checkErrors: function() {
      var loginInfoModel = this.model.get('loginInfoModel');
      var emailAddresses = loginInfoModel.get('emails');
      var noEmailAddresses = !emailAddresses || _.isEmpty(_.filter(emailAddresses, function(email){
        return email && email !== '';
      }));
 
      return {
        branchNameMissing: this.submitAttempted && !loginInfoModel.get('branchName'),
        leadOrganizationMissing: this.submitAttempted && !loginInfoModel.get('leadOrganization'),
        storeNameMissing: this.submitAttempted && !loginInfoModel.get('storeName'),
        emailMissing: this.submitAttempted && noEmailAddresses,
        locationSetMissing: this.submitAttempted && !loginInfoModel.get('locationSet')
      };
    }
  });

  return ViewTheWorld.Views.Login;
});
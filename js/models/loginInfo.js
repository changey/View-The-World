define(function (require) {
  'use strict';
  
  var Backbone      = require('backbone')
    , _             = require('underscore')
    , ViewTheWorld  = require('viewTheWorld');

  ViewTheWorld.Models.LoginInfo = Backbone.Model.extend({
  
    defaults: function() {
      return {
        branchName: undefined,
        leadOrganization: undefined,
        leadOrganizationId: undefined,
        emails: [""],
        storeName: undefined,
        leadSourceStoreType: "Sunrun",
        storeId: undefined,
        locationSet: undefined,
        isLoggedIn: false
      };
    },
    
    initialize: function() {
      this.id = 'LoginInfo';
      this.fetch();
      this.on('change', this.save, this);
    },

    fetch: function() {
      this.set(JSON.parse(localStorage.getItem(this.id)));
    },

    save: function() {
      localStorage.setItem(this.id, JSON.stringify(this.attributes));
    },

    destroy: function() {
      this.clear();
      localStorage.removeItem(this.id);
    },

    isAuthorized: function(){
      var emails = this.get('emails');
      var anEmailExists;

      anEmailExists = !(!emails || _.isEmpty(_.filter(emails, function(email){
        return email && email !== '';
      })));
      
      return anEmailExists && this.get('branchName') && this.get('leadOrganization') && this.get('storeName') && this.get('locationSet');
    },

    isLoggedIn: function(submissionType) {
      return this.isAuthorized(submissionType) && this.get('isLoggedIn');
    },

    getLocationSet: function(){
      return this.get('locationSet');
    },

    getLeadSourceStoreType: function() {
      return this.get('leadSourceStoreType');
    }
    
  });

  return ViewTheWorld.Models.LoginInfo;
});
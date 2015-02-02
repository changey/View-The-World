define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld');

  ViewTheWorld.Models.SalesforceLead = Backbone.Model.extend({
    url: function(){
      return this.get('lead').lightmileBaseUrl + "/sunrun/api/sfdc/lead";
    },
    defaults: {
      lead: {},
      salesforceSecurity: {}
    }
  });

  return ViewTheWorld.Models.SalesforceLead;
});
define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , LeadOrganizationModel  = require('models/leadOrganization');

  ViewTheWorld.Collections.LeadOrganizations = Backbone.Collection.extend({
    model: LeadOrganizationModel,
    url: 'leadOrganizations.json'
  });

  return ViewTheWorld.Collections.LeadOrganizations;
});
define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld');

  ViewTheWorld.Models.SalesforceId = Backbone.Model.extend({
    url: function(){
      return this.get('id') + "?oauth_token=" + this.get('access_token');
    }
  });

  return ViewTheWorld.Models.SalesforceId;
});
define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , BranchModel  = require('models/branch');

  ViewTheWorld.Collections.Branches = Backbone.Collection.extend({
    model: BranchModel,
    url: 'branches.json'
  });

  return ViewTheWorld.Collections.Branches;
});
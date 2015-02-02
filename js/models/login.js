define(function (require) {

  var Backbone       = require('backbone')
    , ViewTheWorld   = require('viewTheWorld')
    , LoginInfoModel = require('models/loginInfo');

  ViewTheWorld.Models.Login = Backbone.Model.extend({
    defaults: function() {
      return {
        stores: ['Best Buy', 'Costco', 'Home Depot', 'REI', 'Other'],
          locationSets: ['Global', 'Hawaii', 'Los Angeles Area', 'San Diego Area', 'San Francisco Bay Area'],
        errors: {
          branchNameMissing: false,
          storeIdMissing: false,
          emailMissing: false,
          locationSetMissing: false,
          leadOrganizationMissing: false
        },
        loginInfoModel: new LoginInfoModel()
      };
    }
  });
  
  return ViewTheWorld.Models.Login;
});
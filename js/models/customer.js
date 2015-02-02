define(function (require) {
  'use strict';
  
  var Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld');

  ViewTheWorld.Models.Customer = Backbone.Model.extend({
    defaults: {
      billAmount: '200',
      streetAddress: '',
      city: '',
      state: '',
      zip: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      squareFootage: '1000'
    },

    getJsonWithOriginalKeys: function() {

      var result = {
        billAmount: this.get('billAmount'),
        streetAddress: this.get('streetAddress'),
        city: this.get('city'),
        state: this.get('state'),
        zip: this.get('zip'),
        firstName: this.get('firstName'),
        lastName: this.get('lastName'),
        email: this.get('email'),
        phone: this.get('phone'),
        squareFootage: this.get('squareFootage')
      };

      return result;
    },
    
    setAddress: function(parsedAddress) {
      this.set('streetAddress', parsedAddress.streetAddress);
      this.set('zip', parsedAddress.zip);
      this.set('city', parsedAddress.city);
      this.set('state', parsedAddress.state);
    },
    
    resetToDefaults: function() {
      this.clear({silent: true});
      this.set(this.defaults);
    },

    getMonthlyBillAmount: function() {
      return this.get('billAmount').toString();
    },

    getYearlyBillAmount: function() {
      return (this.get('billAmount') * 12).toString();
    },
    
    toJSON: function() {
      return {
        "CustomerStreet": this.get('streetAddress'),
        "CustomerCity": this.get('city'),
        "State": this.get('state'),
        "CustomerZipCode": this.get('zip') ,
        "PartnerCurrentYearBill": this.getYearlyBillAmount(),
        "CustomerFirstName": this.get('firstName'),
        "CustomerLastName": this.get('lastName'),
        "CustomerEmail": this.get('email'),
        "CustomerCellPhone": this.get('phone'),
        "County": "NA"
      };
    }
  });

  return ViewTheWorld.Models.Customer;
});


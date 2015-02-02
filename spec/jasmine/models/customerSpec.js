define(function (require) {
  var CustomerModel = require('models/customer');

  describe("ViewTheWorld.Models.Customer", function () { 
    describe("#setAddress", function() {
      var address, customer;
      beforeEach(function () {
        customer = new CustomerModel({
          billAmount: "200"
        });
        address = {
          streetAddress: "24th St",
          city: "San Francisco",
          state: "CA",
          zip: "94103"
        };
      });
      
      it("should set the address on the model", function () {
        customer.setAddress(address);
        expect(customer.get('streetAddress')).toEqual(address.streetAddress);
        expect(customer.get('city')).toEqual(address.city);
        expect(customer.get('state')).toEqual(address.state);
        expect(customer.get('zip')).toEqual(address.zip);
      });

      it("should not unset the bill amount", function () {
        customer.setAddress(address);
        expect(customer.get('billAmount')).toEqual('200');
      });
    });

    describe("#getYearlyBillAmount", function() {
      it("returns the bill amount multiplied by 12", function() {
        var customer = new CustomerModel({ billAmount: "200" });
        expect(customer.getYearlyBillAmount()).toEqual('2400');
      });
    });
    
    describe("#resetToDefaults", function() {
      var customer;
      
      beforeEach(function () {
        customer = new CustomerModel({a:'abc', city:'San Jose'});
      });
      
      it("should set the attributes to the model defaults", function () {
        customer.resetToDefaults();
        expect(customer.attributes).toEqual(customer.defaults);        
      });
    });
    
    describe("#toJSON", function() {
      it("should contain the correct data", function() {
        var customer = new CustomerModel({
          billAmount: '200',
          streetAddress: "24th St. Apt 6",
          city: "San Francisco",
          state: 'CA',
          zip: '94103',
          firstName: 'Testfirst',
          lastName: 'Testlast',
          email: 'test@email.com',
          phone: '1112223333'
        });

        expect(customer.toJSON()).toEqual({
          CustomerStreet: '24th St. Apt 6',
          CustomerCity: 'San Francisco',
          State: 'CA',
          CustomerZipCode: '94103',
          PartnerCurrentYearBill: '2400',
          CustomerFirstName: 'Testfirst',
          CustomerLastName: 'Testlast',
          CustomerEmail: 'test@email.com',
          CustomerCellPhone: '1112223333',
          County: 'NA'
        });

      });
      
    });
  });
});
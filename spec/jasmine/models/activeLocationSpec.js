define(function(require) {
  var Backbone = require('backbone')
    , ActiveLocationModel = require('models/activeLocation');

  describe("ViewTheWorld.Models.ActiveLocation", function() {
    var activeLocationModel;

    beforeEach(function() {
      activeLocationModel = new ActiveLocationModel();
    });

    describe("#setLocation", function() {
      describe("when the location is a model", function() {
        it("should set the location to that model", function() {
          var locationModel = new Backbone.Model({});

          expect(activeLocationModel.get('location')).toBeUndefined();

          activeLocationModel.setLocation(locationModel);

          expect(activeLocationModel.get('location')).toEqual(locationModel);
        });
      });

      describe("when the location is not a model", function() {
        var address, location;

        beforeEach(function() {
          address = "This is not a Backbone model";
          activeLocationModel.setLocation({ address: address });
          location = activeLocationModel.get('location');
        });

        it("creates a new TourLocationModel with the given information", function() {
          expect(location.get('address')).toEqual(address);
        });

        it("sets the location name to 'My House'", function() {
          expect(location.get('name')).toEqual('My House');
        });
      });
    });

    describe("#getName", function() {
      it("returns the name of the location", function() {
        var name = "Sunrun";
        var locationModel = new Backbone.Model({ name: name });

        activeLocationModel.setLocation(locationModel);

        expect(activeLocationModel.getName()).toEqual(name);
      });
      
    });

    describe("#getAddress", function() {
      it("returns the address of the location", function() {
        var address = "Sunrun Street";
        var locationModel = new Backbone.Model({ address: address });

        activeLocationModel.setLocation(locationModel);

        expect(activeLocationModel.getAddress()).toEqual(address);
      });
    });
  });
});

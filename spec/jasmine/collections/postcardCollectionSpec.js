define(function (require) {
  var PostcardCollection = require('collections/postcards');
  var ActiveLocation = require('models/activeLocation');
  var TourLocation = require('models/tourLocation');

  describe("ViewTheWorld.Collections.Postcards", function() {
    var postCardCollection, activeLocation, tourLocation;
    beforeEach(function() {
      tourLocation = new TourLocation({
        "photoSphereIds": [
          "blah",
          "foo",
          "bar",
          "baz"
        ]
      });
      
      activeLocation = new ActiveLocation({
        location: tourLocation
      });
    });
    
    describe("#initialize", function() {
      it("should add postcards to the collection", function() {
        postCardCollection = new PostcardCollection([], {activeLocation: activeLocation});
        expect(postCardCollection.models.length).toBe(4);
      });
    });

    describe("a postcard added to the collection", function() {
      it("should have a thumbnail url", function() {
        postCardCollection = new PostcardCollection([], {activeLocation: activeLocation});
        expect(postCardCollection.models[0].get('thumbnail')).toBeDefined();
      });
    });

    describe("when the activeLocation changed", function() {
      var newTourLocation;
      
      beforeEach(function() {
        postCardCollection = new PostcardCollection([], {activeLocation: activeLocation});
        newTourLocation = new TourLocation({
          "photoSphereIds": [
            "yayyy",
            "wooot"
          ]
        });
      });
      
      it("should update the postcards", function() {
        expect(postCardCollection.size()).toBe(4);
        activeLocation.set('location', newTourLocation);
        expect(postCardCollection.size()).toBe(2);
      });

      it("should trigger a change on the collection", function() {
        spyOn(postCardCollection, 'trigger');
        activeLocation.set('location', newTourLocation);
        expect(postCardCollection.trigger).toHaveBeenCalledWith('change');
      });
    });
  });
});
  
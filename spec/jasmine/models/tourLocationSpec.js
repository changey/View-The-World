define(function (require) {
  var TourLocation = require('models/tourLocation');

  describe("ViewTheWorld.Models.TourLocation", function() {
    describe("#initialize", function() {
      describe("when there is no image path specified", function() {
        it("should look for the image at the default location", function() {
          var tourLocation = new TourLocation({name:'The Name of The Place'});
          expect(tourLocation.get('thumbnail')).toEqual('the-name-of-the-place.png');
        });
      });
      
      describe("when there is an image path specified", function() {
        it("should look for the image at the specified location", function() {
          var tourLocation = new TourLocation({name:'The Name of The Place', thumbnail: 'some-image.jpg'});
          expect(tourLocation.get('thumbnail')).toEqual('some-image.jpg');
        });
      });
    });
  });
});
  
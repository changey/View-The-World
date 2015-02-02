define(function(require) {
  require('googleMapsLoader');
  var GoogleMap = require('lib/googleMap');

  describe("ViewTheWorld.GoogleMap", function() {
    describe("#initMap", function() {
      var gmapView;

      beforeEach(function() {
        gmapView = new GoogleMap({});
      });

      describe("when goToCoordinates is called before the map is initialized", function() {
        var coordinates;
        
        beforeEach(function() {
          coordinates = {
            lat: function() {
              return 100;
            },
            lng: function() {
              return 100;
            }
          };

          gmapView.goToCoordinates(coordinates);
        });

        it("should go to that location once initialized", function() {
          spyOn(gmapView, 'goToCoordinates');
          gmapView.initMap();
          expect(gmapView.goToCoordinates).toHaveBeenCalledWith(coordinates);
        });
      });
    });

    describe("#zoomBy", function() {
      var previousZoom, zoomChange, gmapView;

      beforeEach(function() {
        gmapView = new GoogleMap({});
        gmapView.initMap();
      });

      describe("when the zoom is less than 1", function() {
        it("should set the zoom level to 1", function() {
          zoomChange = -2;
          previousZoom = gmapView.map.getZoom();
          gmapView.zoomBy(zoomChange);

          expect(gmapView.map.getZoom()).toEqual(1);
        });
      });

      it("should change the map zoom by the zoom amount", function() {
        zoomChange = -2;
        gmapView.map.setZoom(5);
        previousZoom = gmapView.map.getZoom();

        gmapView.zoomBy(zoomChange);

        expect(gmapView.map.getZoom()).toEqual(previousZoom + zoomChange);
      });

    });

    describe("#rotate", function() {
      var gmapView;

      beforeEach(function() {
        gmapView = new GoogleMap({ });
        gmapView.initMap();
      });

      describe("when we are viewing 45 degree aerial imagery", function() {
        it("should increase the map heading by 90", function() {
          gmapView.map.setTilt(45);

          gmapView.rotate();
          expect(gmapView.map.getHeading()).toEqual(90);

          gmapView.rotate();
          expect(gmapView.map.getHeading()).toEqual(180);
        });
      });

      describe("when we are not viewing 45 degree aerial imagery", function() {
        it("should not increase the map heading", function() {
          gmapView.map.setTilt(0);

          gmapView.rotate();

          expect(gmapView.map.getHeading()).toBeUndefined();
        });
      });
    });

    describe("#centerOnAddress", function() {
      var gmapView, coordinates;

      beforeEach(function() {
        gmapView = new GoogleMap({ });
        gmapView.initMap();
        
        coordinates = {
          lat: function() {
            return 100;
          },
          lng: function() {
            return 100;
          }
        };

        gmapView.goToCoordinates({
          latitude: 100,
          longitude: 100
        });
      });

      it("should center the map on the location address currently active", function() {
        gmapView.map.setCenter({
          lat: function() {
            return 101;
          },
          lng: function() {
            return 101;
          }
        });
        
        var centerCoordinates = gmapView.map.getCenter();
        expect(centerCoordinates.lat()).toEqual(101);
        expect(centerCoordinates.lng()).toEqual(101);
        
        gmapView.centerOnAddress();

        centerCoordinates = gmapView.map.getCenter();
        expect(centerCoordinates.lat()).toEqual(100);
        expect(centerCoordinates.lng()).toEqual(100);
      });
      
    });
  });
});
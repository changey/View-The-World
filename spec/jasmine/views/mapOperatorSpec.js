define(function (require) {
  var Backbone = require("backbone");
  var _ = require('underscore');
  var MapOperatorView = require('views/mapOperator');
  var TourLocation = require('models/tourLocation');
  
  describe("ViewTheWorld.Views.MapOperatorView", function() {
    var mapOperatorView;
    
    beforeEach(function() {
      jasmine.content.append('<div id="map-operator-view"></div>');
      
      mapOperatorView = new MapOperatorView({
        el: '#map-operator-view'
      });
    });


    it("should have a map controls view", function() {
      expect(mapOperatorView.mapControlsView).toBeDefined();
    });
    
    it("should let the mapControls control both the original map and the faded in map", function() {
      expect(mapOperatorView.mapControlsView.googleMapView).toBe(mapOperatorView.googleMapView);
      expect(mapOperatorView.mapControlsView.fadeGoogleMapView).toBe(mapOperatorView.fadeGoogleMapView);
    });

    describe("#fadeToLocation", function() {
      var location;
      beforeEach(function() {
        spyOn(window, 'setTimeout').andCallFake(function(callback){
          (_.bind(callback, mapOperatorView))();
          return 'fake-timeout-id';
        });
        
        location = new TourLocation();
      });

      it("should go to the specified location", function() {
        spyOn(mapOperatorView, 'setMapLocation');
        mapOperatorView.fadeToLocation(location);
        expect(mapOperatorView.setMapLocation).toHaveBeenCalledWith(location, jasmine.any(Backbone.View));
      });

      it("should set some timeouts on some effects", function() {
        mapOperatorView.fadeToLocation(location);
        expect(window.setTimeout).toHaveBeenCalled();
      });
      
      it("should add a marker on the address users selected", function() {
        spyOn(mapOperatorView.fadeGoogleMapView, 'addMarker');
        mapOperatorView.fadeToLocation(location, true);
        expect(mapOperatorView.fadeGoogleMapView.addMarker).toHaveBeenCalled();
      });
    }); 
  });
});
define(function (require) {
  var MapControlsView = require('views/mapControls')
    , GoogleEarth = require('lib/googleEarth')
    , GoogleMap = require('lib/googleMap')
    , EventBus = require('eventBus')
    , ActiveLocationModel = require('models/activeLocation');
  
  describe("ViewTheWorld.Views.MapControls", function() {
    var mapControlsView, googleEarthView, googleMapView, fadeGoogleMapView, activeLocation;
    
    beforeEach(function() {
      jasmine.content.append('' +
        '<div id="earth-view-container">' +
        '</div><div id="map-canvas">' +
        '</div><div id="faded-in-map-canvas">' +
        '</div><div id="map-controls">' +
        '</div>' +
        '');
      
      googleEarthView = new GoogleEarth({
        el: '#earth-view-container'  
      });
      
      googleMapView = new GoogleMap({
        el: '#map-canvas'
      });

      fadeGoogleMapView = new GoogleMap({
        el: '#faded-in-map-canvas'
      });
      
      googleMapView.render();
      fadeGoogleMapView.render();
      
      activeLocation = new ActiveLocationModel();
      
      mapControlsView = new MapControlsView({
        el: '#map-controls',
        googleEarthView: googleEarthView,
        googleMapView: googleMapView,
        fadeGoogleMapView: fadeGoogleMapView,
        activeLocation: activeLocation
      });
    });
    
    describe("clicking on the zoom in button", function() {
      it("should trigger a zoom event with a value of 2", function() {
        mapControlsView.render();
        
        spyOn(googleMapView, 'zoomBy');

        $('.zoom-in').click();
        
        expect(googleMapView.zoomBy).toHaveBeenCalledWith(2);
      });

      it("should trigger a pauseTour event", function() {
        mapControlsView.render();

        spyOn(EventBus, 'trigger');
        $('.zoom-in').click();

        expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
      });
    });

    describe("clicking on the zoom out button", function() {
      it("should trigger a zoom event with a value of -2", function() {
        mapControlsView.render();

        spyOn(googleMapView, 'zoomBy');

        $('.zoom-out').click();

        expect(googleMapView.zoomBy).toHaveBeenCalledWith(-2);
      });

      it("should trigger a pauseTour event", function() {
        mapControlsView.render();

        spyOn(EventBus, 'trigger');
        $('.zoom-out').click();

        expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
      });
    });

    describe("clicking on the rotate button", function() {
      it("should rotate the map by 90 degrees", function() {
        spyOn(googleMapView, 'getTilt').andReturn(45);
        mapControlsView.render();
        
        spyOn(googleMapView, 'rotate');

        $('.rotate').click();

        expect(googleMapView.rotate).toHaveBeenCalled();
      });

      it("should trigger a pauseTour event", function() {
        mapControlsView.render();

        spyOn(EventBus, 'trigger');
        $('.rotate').click();

        expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
      });
    });

    describe("clicking on the center-on-address button", function() {
      it("should center the map on the active location", function() {
        mapControlsView.render();

        spyOn(googleMapView, 'centerOnAddress');

        $('.center-on-address').click();

        expect(googleMapView.centerOnAddress).toHaveBeenCalled();
      });

      it("should trigger a pauseTour event", function() {
        mapControlsView.render();
        
        spyOn(googleMapView, 'centerOnAddress');

        spyOn(EventBus, 'trigger');
        $('.center-on-address').click();

        expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
      });
    });
  });
});
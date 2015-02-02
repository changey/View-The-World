define(function(require) {
  var TourLocationsView = require('views/tourLocations')
    , ActiveLocationModel = require('models/activeLocation')
    , TourLocationCollection = require('collections/tourLocations')
    , TourLocationModel = require('models/tourLocation')
    , EventBus = require('eventBus');

  describe("ViewTheWorld.Views.TourLocations", function() {
    var tourLocationsView, activeLocation, tourLocationModel, anotherTourLocationModel;

    beforeEach(function() {
      jasmine.content.append("<div id='tourLocations'></div>");

      activeLocation = new ActiveLocationModel();
      tourLocationModel = new TourLocationModel({name: 'Somewhere'});
      anotherTourLocationModel = new TourLocationModel({name: 'Somewhere Else'});

      activeLocation.setLocation(tourLocationModel);
      var locations = new TourLocationCollection([ tourLocationModel, anotherTourLocationModel]);
      tourLocationsView = new TourLocationsView({
        activeLocation: activeLocation,
        locations: locations,
        el: '#tourLocations'
      });

      tourLocationsView.render();
    });

    describe("when the map is touched and dragged", function() {
      it("should hide the current location label", function() {
        var currentLocation = tourLocationsView.$el.find('.current-location');
        expect(currentLocation).not.toHaveClass('hide');

        $('#map-canvas').trigger('touchmove');

        expect(currentLocation).toHaveClass('hide');
      });
    });

    describe("#onActiveLocationChange", function() {
      it("should highlight the active location", function() {
        spyOn(tourLocationsView, 'highlightActiveLocation');
        tourLocationsView.onActiveLocationChange(activeLocation);
        expect(tourLocationsView.highlightActiveLocation).toHaveBeenCalled();
      });
      
      describe("when postcards are shown", function() {
        beforeEach(function() {
          var event = {
            currentTarget: $('.location')[0]
          };
          tourLocationsView.clickLocation(event);  
        });
        
        it("should pop up again", function() {
          tourLocationsView.onActiveLocationChange(activeLocation);
          expect(tourLocationsView.$el.find('#locations')).not.toHaveClass('recessed');
        });

        it("should hide the postcards", function() {
          spyOn(tourLocationsView.postcardsView, 'hide');
          tourLocationsView.onActiveLocationChange(activeLocation);
          expect(tourLocationsView.postcardsView.hide).toHaveBeenCalled();
        });
      });
    });
    
    describe("#clickLocation", function() {
      var event;
      beforeEach(function() {
        event = {
          currentTarget: $('.location')[0]
        };
      });

      it("should set the active location to that location", function() {
        activeLocation.set('location', anotherTourLocationModel);
        tourLocationsView.clickLocation(event);
        expect(activeLocation.getLocation()).toEqual(tourLocationModel);
      });

      it("should hightlight the location", function() {
        tourLocationsView.clickLocation(event);
        expect(event.currentTarget).toHaveClass('active');    
      });

      it("should show the postcards", function() {
        var postcardsView = tourLocationsView.postcardsView;
        spyOn(postcardsView, 'show');
        spyOn(postcardsView, 'hide');
        tourLocationsView.clickLocation(event);
        expect(postcardsView.show).toHaveBeenCalled();
        expect(postcardsView.hide).not.toHaveBeenCalled();
      });

      it("should trigger a pauseTour event", function() {
        spyOn(EventBus, 'trigger');
        tourLocationsView.clickLocation(event);
        expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
      });

    });
    
    describe("#highlightActiveLocation", function() {
      it("should should show the current location label", function() {
        var currentLocationEl = tourLocationsView.$el.find('.current-location');
        currentLocationEl.addClass('hide');

        tourLocationsView.highlightActiveLocation(activeLocation);

        expect(currentLocationEl).not.toHaveClass('hide');
      });
    });
  });
});
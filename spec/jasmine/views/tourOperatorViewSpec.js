define(function (require) {
  var ActiveStepModel         = require('models/activeStep')
    , TourOperatorView        = require('views/tourOperator')
    , ActiveLocationModel     = require('models/activeLocation')
    , TourLocationCollection  = require('collections/tourLocations')
    , TourLocation            = require('models/tourLocation')
    , EventBus                = require('eventBus');

  describe("ViewTheWorld.Views.TourOperator", function() {
    var activeStepModel, tourOperator;
    
    beforeEach(function() {
      activeStepModel = new ActiveStepModel({ step: 0 });

      var tourLocation = new TourLocation({
        "name": "Your Home",
        "address": "Somewhere, CA"
      });

      var activeLocation = new ActiveLocationModel({ location: tourLocation });

      var tourLocationCollection = new TourLocationCollection([tourLocation]);
      
      tourOperator = new TourOperatorView({
        activeLocation: activeLocation,
        locations: tourLocationCollection,
        activeStepModel: activeStepModel
      });
    });
    
    describe("when the active step model changes to step 1", function() {
      describe("and stay at location is false", function() {
        it("should start the tour", function() {
          var originalTourId = tourOperator.tourId;

          activeStepModel.setStayAtLocation(false);
          activeStepModel.setStep(1);

          setTimeout(function() {
            expect(tourOperator.tourId).not.toEqual(originalTourId);
          }, 250);
        });
      });

      describe("and stay at location is true", function() {
        it("should not start the tour", function() {
          var originalTourId = tourOperator.tourId;
          
          activeStepModel.setStayAtLocation(true);
          activeStepModel.setStep(1);
          
          expect(tourOperator.tourId).toEqual(originalTourId);
        });
      });
    });
    
    describe("when the active step model changes to step 2", function() {
      var originalTourId;

      beforeEach(function() {
        originalTourId = '123456';
        tourOperator.tourId = originalTourId;
      });

      afterEach(function() {
        tourOperator.stopTour();
      });

      it("should not restart the tour", function() {
        activeStepModel.setStep(2);
        expect(tourOperator.tourId).toEqual(originalTourId);
      });
    });

    describe("when the pauseTour event is triggered", function() {
      var tourId;

      beforeEach(function() {
        tourId = 'abcdef';
        tourOperator.tourId = tourId;
      });
      
      it("should stop the tour", function() {
        spyOn(window, 'clearTimeout');
        EventBus.trigger('pauseTour');
        expect(window.clearTimeout).toHaveBeenCalledWith(tourId);
      });

    });

    describe("#stopTour", function() {
      var tourId;

      beforeEach(function() {
        tourId = '12345';
        tourOperator.tourId = tourId;
      });
      
      it("should clear the interval", function() {
        spyOn(window, 'clearTimeout');
        tourOperator.stopTour();
        expect(window.clearTimeout).toHaveBeenCalledWith(tourId);
      });

      it("should unset the tourId", function() {
        tourOperator.stopTour();
        expect(tourOperator.tourId).toBeFalsy();
      });
    });
    
    describe("#setTourInterval", function() {
      describe("When the step is step 1 and the tour is unstarted", function() {
        var newTourId;

        beforeEach(function() {
          activeStepModel.set('step', 1);
          newTourId = 'abcdef';
          spyOn(window, 'setTimeout').andReturn(newTourId);
          tourOperator.tourId = undefined;
        });

        it("should set the tourId", function() {
          tourOperator.setTourInterval();
          expect(tourOperator.tourId).toEqual(newTourId);
        });

        it("should set the interval again", function() {
          spyOn(tourOperator, 'setTourInterval');
          tourOperator.setTourInterval();
          expect(tourOperator.setTourInterval).toHaveBeenCalled();
        });
      });
    });
  });
});

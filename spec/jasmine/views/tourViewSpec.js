define(function (require) {
  var TourView          = require('views/tour')
    , TourLocationSets  = require('collections/tourLocationSets')
    , TourLocationSet   = require('models/tourLocationSet')
    , EventBus          = require('eventBus')
    , LoginInfoModel    = require('models/loginInfo');
    
  describe("ViewTheWorld.Views.Tour", function() {
    var tourView, locationSetName, loginInfoModel, tourLocationSet
      , tourLocationSets;
    
    beforeEach(function() {
      jasmine.content.append("<div id='tour'></div>");
      locationSetName = "Global";
      loginInfoModel = new LoginInfoModel({locationSet: "Global"});
      tourLocationSet = new TourLocationSet({
        "Global": [
          {
            "name":     "The White House",
            "address":  "The White House, Washington DC, USA"
          },
          {
            "name":     "Taipei 101 MALL",
            "address":  "Taipei 101 MALL, Taipei, Taiwan"
          }
        ]
      });
      tourLocationSets = new TourLocationSets([tourLocationSet]);
      tourView = new TourView({ el: "#tour", loginInfoModel: loginInfoModel});
    });

    describe("#initialize", function() {
      it("should set the active step to 1", function() {
        tourView = new TourView({ el: "#tour", loginInfoModel: loginInfoModel});
        expect(tourView.activeStepModel.getStep()).toEqual(1);
      });

      it('fetches the TourLocationSets', function() {
        spyOn(tourLocationSets, 'fetch');

        new TourView({ el: "#tour", loginInfoModel: loginInfoModel,
          tourLocationSets: tourLocationSets });
        expect(tourLocationSets.fetch).toHaveBeenCalled();
      });
    });

    describe("when a touchmove is triggered on the map", function() {
      beforeEach(function() {

        spyOn(tourLocationSets, 'fetch').andCallFake(
          function(options){
            options.success();
          }
        );
        new TourView({ el: "#tour", loginInfoModel: loginInfoModel,
          tourLocationSets: tourLocationSets });      
      });

      it("should trigger a pauseTour event", function() {
        spyOn(EventBus, 'trigger');
        $('#map-canvas').trigger('touchstart');
        
        expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
      });
    });

    describe("#createSubViews", function() {
      var tourView;
      
      beforeEach(function() {

        spyOn(tourLocationSets, 'fetch').andCallFake(function(options) {
          options.success();
        });
        
        tourView = new TourView({
          el: "#tour",
          tourLocationSets: tourLocationSets,
          loginInfoModel: loginInfoModel
        });
      });
      
      it("should set the active location", function() {
        expect(tourView.activeLocation).toBeDefined();
      });

      it("should initialize sub-views", function() {
        expect(tourView.headerView).toBeDefined();
        expect(tourView.tourOperatorView).toBeDefined();
        expect(tourView.tourLocationSets).toBeDefined();
        expect(tourView.tourLocationsView).toBeDefined();
        expect(tourView.addressSearchView).toBeDefined();
        expect(tourView.electricBillView).toBeDefined();
      });
    });

    describe("#render", function() {
      var tourView;
      
      beforeEach(function() {

        spyOn(tourLocationSets, 'fetch').andCallFake(function(options) {
          options.success();
        });

        tourView = new TourView({
          el: "#tour",
          tourLocationSets: tourLocationSets,
          loginInfoModel: loginInfoModel
        });
      });
      
      it("should render the header", function() {
        var headerView = tourView.headerView;
        spyOn(headerView, 'render');
        
        tourView.render();
        
        expect(headerView.render).toHaveBeenCalled();
      });

      it("should render the tour operator", function() {
        var tourOperatorView = tourView.tourOperatorView;
        spyOn(tourOperatorView, 'render');

        tourView.render();

        expect(tourOperatorView.render).toHaveBeenCalled();
      });


      it("should render the tour locations view during step 1", function() {
        var tourLocationsView = tourView.tourLocationsView;
        spyOn(tourLocationsView, 'render');
        
        tourView.render();
        
        expect(tourLocationsView.render).toHaveBeenCalled();
      });

      it("should render the address search view during step 1", function() {
        var addressSearchView = tourView.addressSearchView;
        spyOn(addressSearchView, 'render');
        
        tourView.render();
        
        expect(addressSearchView.render).toHaveBeenCalled();
      });

      it("should render the electric bill view during step 2", function() {
        var homeInfoView = tourView.homeInfoView;
        spyOn(homeInfoView, 'render');
        
        tourView.activeStepModel.set('step', 2);

        expect(homeInfoView.render).toHaveBeenCalled();
      });
    });
  });
});

define(function (require) {
  var GoogleEarth = require('lib/googleEarth');
    require('googleMapsLoader');

  describe("ViewTheWorld.googleEarthView", function () {
    var gEarthView;
    beforeEach(function() {
      var earthDiv = document.createElement('div');
      $(earthDiv).attr('id', 'googleEarthContainer');


      var controlsDiv = document.createElement('div');
      $(controlsDiv).attr('id', 'controls-div');
      
      jasmine.content.append(earthDiv);
      jasmine.content.append(controlsDiv);
      
      gEarthView = new GoogleEarth({
        el: '#controls-div' 
      });
      
      gEarthView.render();
    });

    describe("#initCallback", function() {
      var fakeEarthInstance;
      
      beforeEach(function() {
        fakeEarthInstance = jasmine.createSpyObj('earthInstance', [
          'getLayerRoot', 'getWindow',
          'getOptions', 'enableLayerById', 
          'setFlyToSpeed', 'setMapType',
          'setVisibility']);
        
        fakeEarthInstance.getLayerRoot.andReturn(fakeEarthInstance);
        fakeEarthInstance.getWindow.andReturn(fakeEarthInstance);
        fakeEarthInstance.getOptions.andReturn(fakeEarthInstance);
        
      });
      describe("when goToLocation is called before the earth is initialized", function() {
        var coordinates;
        beforeEach(function() {
          coordinates = {
            lat: function(){ return 100; },
            lng: function(){ return 100; }
          };

          gEarthView.goToLocation(coordinates);
        });

        it("should go to that location once initialized", function() {
          spyOn(gEarthView, 'goToLocation');
          gEarthView.initCallback(fakeEarthInstance);
          expect(gEarthView.goToLocation).toHaveBeenCalledWith(coordinates);
        });
      });
    });
    
    describe("#show", function() {
      it("should show google earth", function() {
        gEarthView.hide();
        expect($('#googleEarthContainer').css('display')).toBe('none');
        
        gEarthView.show();
        expect($('#googleEarthContainer').css('display')).not.toBe('none');
      });
    });

    describe("#hide", function() {
      it("should hide google earth", function() {
        gEarthView.show();
        expect($('#googleEarthContainer')).toBeVisible();
        
        gEarthView.hide();
        expect($('#googleEarthContainer')).not.toBeVisible();
      });
    });

    describe("#goToLocation", function() {
      var coordinates;
      beforeEach(function() {
        coordinates = {
          lat: function(){ return 1;},
          lng: function(){ return 140;}
        };
      });
      
      it("should go to the specified address", function() {
        var googleEarthViewport = jasmine.createSpyObj('googleEarthViewport', ['setAbstractView']);
        var lookAt = jasmine.createSpyObj('lookat', ['set', 'get', 'setTilt']);
        
      
        var earthInstance = { 
          getView: function(){
            return googleEarthViewport; 
          },
          createLookAt: function(){
           return lookAt; 
          }
        };
        
        gEarthView.googleEarthInstance = earthInstance;

        gEarthView.goToLocation(coordinates);
        expect(googleEarthViewport.setAbstractView).toHaveBeenCalledWith(lookAt);
      });
    });
  });
});
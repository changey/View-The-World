define(function(require) {
  var ModelSelection = require('models/modelSelection')
    , Backbone = require('backbone');
  
  describe("ViewTheWorld.Models.ModelSelection", function() {
    var modelSelection;
    
    beforeEach(function() {
      modelSelection = new ModelSelection();
    });
    
    describe("#isSelected", function() {
      var model;
      
      beforeEach(function() {
        model = new Backbone.Model();
      });
      describe("when no model is selected", function() {
        it("should return false", function() {
          expect(modelSelection.isSelected(model)).toBeFalsy();
        });
      });

      describe("when the model is selected", function() {
        beforeEach(function() {
          modelSelection.select(model);  
        });
        
        it("should return true", function() {
          expect(modelSelection.isSelected(model)).toBeTruthy();
        });

      });

      describe("when a different model is selected", function() {
        beforeEach(function() {
          modelSelection.select(model);
          modelSelection.select(new Backbone.Model());
        });
        
        it("should return true", function() {
          expect(modelSelection.isSelected(model)).toBeFalsy();
        });
      });
    });

    describe("#select", function() {
      it("should select the model passed in", function() {
        var model = new Backbone.Model();
        modelSelection.select(model);
        expect(modelSelection.get('model')).toBe(model);
      });
    });

    describe("getSelection", function() {
      it("should return the selected model", function() {
        var model = new Backbone.Model();
        modelSelection.set('model', model);
        expect(modelSelection.getModel()).toBe(model);
      });

    });
  });
});

define(function (require) {
  var ActiveStepModel  = require('models/activeStep')
    , HeaderView       = require('views/header'); 

  describe("clicking on the sunrun logo", function() {
    
    describe("from step 2", function() {
      var activeStepModel, headerView;
      beforeEach(function() {
        activeStepModel = new ActiveStepModel({
          step: 2
        });
        
        headerView = new HeaderView({
          activeStepModel: activeStepModel,
          customerModel: jasmine.createSpyObj('customerModel', ['resetToDefaults']),
          el: jasmine.content
        }).render();
      });

      it("should go to step 1", function() {
        $('#logo').click();
        
        expect(activeStepModel.get('step')).toEqual(1);
      });

      it("should trigger a change on the activeStepModel", function() {
        var changed = false;
        activeStepModel.on('change', function() {
          changed = true;
        });
        
        $('#logo').click();
        expect(changed).toBeTruthy();
      });
    });

    describe("from step 1", function() {
      var activeStepModel, headerView, customerModel;
      beforeEach(function() {
        activeStepModel = new ActiveStepModel({
          step: 1
        });
        
        customerModel = jasmine.createSpyObj('customerModel', ['resetToDefaults']);
        
        headerView = new HeaderView({
          activeStepModel: activeStepModel,
          customerModel: customerModel,
          el: jasmine.content
        }).render();
      });
      
      it("should still trigger a change on the activeStepModel", function() {
        var changed = false;
        activeStepModel.on('change', function() {
          changed = true;
        });

        $('#logo').click();
        expect(changed).toBeTruthy();
      });

      it("should reset to an empty customer", function() {
        $('#logo').click();
        expect(customerModel.resetToDefaults).toHaveBeenCalled();
      });

    });
  });

  describe("clicking on the step 1 chevron", function() {
    var activeStepModel, headerView, customerModel;
    beforeEach(function() {
      activeStepModel = new ActiveStepModel({
        step: 2
      });

      customerModel = jasmine.createSpyObj('customerModel', ['resetToDefaults']);
      
      headerView = new HeaderView({
        activeStepModel: activeStepModel,
        customerModel: customerModel,
        el: jasmine.content
      }).render();
    });

    it("should go to step 1", function() {
      $('#step-1').click();
      expect(activeStepModel.get('step')).toEqual(1);
    });

    it("should trigger a change on the activeStepModel", function() {
      var changed = false;
      activeStepModel.on('change', function() {
        changed = true;
      });

      $('#step-1').click();
      expect(changed).toBeTruthy();
    });

    it("should not reset the customerModel to defaults", function() {
      $('#step-1').click();
      expect(customerModel.resetToDefaults).not.toHaveBeenCalled();
    });
  });
});
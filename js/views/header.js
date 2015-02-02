define(function (require) {
  'use strict';
  
  var _             = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , HeaderTemplate = require('text!../../templates/header.tmpl');

  ViewTheWorld.Views.Header = Backbone.View.extend({
    events: {
      'click #logo': 'returnToStep1AndClear',
      'click #step-1': 'returnToStep1'
    },

    initialize: function(options){
      this.activeStepModel = options.activeStepModel;
      this.listenTo(this.activeStepModel, 'change', this.render, this); 
      this.customerModel = options.customerModel;
    },
    
    render: function() {
      var template =  _.template(HeaderTemplate, {
        activeStep: this.activeStepModel.getStep()
      });
      this.$el.html(template);
      return this;
    },

    returnToStep1AndClear: function(){
      this.customerModel.resetToDefaults();
      this.activeStepModel.setStayAtLocation(false);
      this.activeStepModel.setStep(1);
      this.activeStepModel.trigger('change');
    },
    
    returnToStep1: function() {
      this.activeStepModel.setStayAtLocation(true);
      this.activeStepModel.setStep(1);
    }
  });

  return ViewTheWorld.Views.Header;
});
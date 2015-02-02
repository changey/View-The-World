define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , _ = require('underscore')
    , ViewTheWorld = require('viewTheWorld')
    , FaqcardQuestionTemplate = require('text!../../templates/faqcardQuestion.tmpl')
    , FaqcardContentView = require('views/faqcardContent');

  ViewTheWorld.Views.FaqcardQuestion = Backbone.View.extend({

    events: {
      'click .faqcard-question': 'selectQuestion'
    },
    
    initialize: function(options) {
      this.faqcardQuestionsView = options.faqcardQuestionsView;
      this.faqcardsView = options.faqcardsView;
      this.questions = options.questions;
    },
    
    render: function() {
      var template = _.template(FaqcardQuestionTemplate, {
        faqcardQuestion: this.model
      });
      this.$el.html(template);
      
    },

    selectQuestion: function() {

      this.faqcardContentView = new FaqcardContentView({
        el: '#faqcard-content',
        url: this.model.get("url"),
        faqcardsView: this.faqcardsView,
        questions: this.questions
      });
      
      this.faqcardContentView.render();

      this.faqcardQuestionsView.$el.hide();
      this.faqcardsView.$el.find('#faqcard-content').removeClass('hidden');
    }
  });
  
  return ViewTheWorld.Views.FaqcardQuestion;
});
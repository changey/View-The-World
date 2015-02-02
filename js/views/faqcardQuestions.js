define(function(require) {
  'use strict';

  var _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , FaqcardQuestionView = require('views/faqcardQuestion')
    , FaqcardQuestionsTemplate = require('text!../../templates/faqcardQuestions.tmpl');
  
  ViewTheWorld.Views.FaqcardQuestions = Backbone.View.extend({
    
    initialize: function(options) {
      this.questions = options.questions;
      this.faqcardsView = options.faqcardsView;
    },
    
    render: function() {
      var template = _.template(FaqcardQuestionsTemplate, {
        questions: this.questions
      });
      this.$el.html(template);
      
      var filteredQuestions = [];
      _.each(this.questions, function(question) {
        filteredQuestions.push(question.attributes);
      });

      _.each(this.$el.find('.faqcard-question-container'), _.bind(function(faqcardQuestionContainerDiv, index) {
        this.assign(new FaqcardQuestionView({
          model: this.questions[index],
          faqcardQuestionsView: this,
          faqcardsView: this.faqcardsView,
          questions: filteredQuestions
        }), faqcardQuestionContainerDiv);
      }, this));
    }
    
  });
  
  return ViewTheWorld.Views.FaqcardQuestions;
});
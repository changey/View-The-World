define(function(require){
  var FaqcardContentView = require('views/faqcardContent');
  
  describe("ViewTheWorld.Views.FaqcardContent", function() {
    var faqcardContentView;
    
    beforeEach(function() {
      jasmine.content.append('<div id="faqcard-content-view-container"></div>');
      
      var questions = [
        {url: "url1"},
        {url: "url2"},
        {url: "url3"}
      ];
      
      faqcardContentView = new FaqcardContentView({
        el: '#faqcard-content-view-container',
        url: 'url2',
        questions: questions
      });
      
      faqcardContentView.render();
    });
    
    describe("when the next button is clicked", function() {
      it("should have the card with the correct index displayed", function() {
        expect(faqcardContentView.currentQuestionIndex).toBe(1);
        $('#next-button').click();
        expect(faqcardContentView.currentQuestionIndex).toBe(2);
        $('#next-button').click();
        expect(faqcardContentView.currentQuestionIndex).toBe(2);
      });
    });

    describe("when the previous button is clicked", function() {
      it("should have the card with the correct index displayed", function() {
        expect(faqcardContentView.currentQuestionIndex).toBe(1);
        $('#previous-button').click();
        expect(faqcardContentView.currentQuestionIndex).toBe(0);
      });
    });
  });
});
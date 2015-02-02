define(function(require){
  var FaqcardView = require('views/faqcard')
    , ModelSelection = require('models/modelSelection')
    , FaqcardModel = require('models/faqcard');
  
  describe("ViewTheWorld.Views.Faqcard", function() {
    var faqcardView, faqcardSelection, faqcardModel;
    
    beforeEach(function() {
      jasmine.content.append('<div id="faqcard-view-container"></div>');
    
      faqcardSelection = new ModelSelection();
      faqcardModel = new FaqcardModel();
      faqcardView = new FaqcardView({
        el: '#faqcard-view-container',
        model: faqcardModel,
        modelSelection: faqcardSelection
      });
    });
    
    describe("when the faqcard is clicked", function() {
      beforeEach(function() {
        faqcardView.render();
      });
      
      it("should set itself as selected", function() {
        $('.faqcard').click();
        expect(faqcardSelection.isSelected(faqcardModel)).toBeTruthy();
      });
    });
  
    describe("when the faqcard view is rendered", function() {
      describe("when the faqcard is selected", function() {
        beforeEach(function() {
          faqcardSelection.select(faqcardModel);
        });

        it("should set itself as selected", function() {
          faqcardView.render();
          expect($('.faqcard')).not.toHaveClass('unselected');
        });
      });
    });
  });
});
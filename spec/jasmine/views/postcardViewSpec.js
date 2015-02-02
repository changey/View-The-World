define(function(require){
  var PostcardView = require('views/postcard')
    , ModelSelection = require('models/modelSelection')
    , PostcardModel = require('models/postcard')
    , EventBus = require('eventBus');

  describe("ViewTheWorld.Views.Postcard", function() {
    var postcardSelection, postcardModel, postcardView;
    
    beforeEach(function() {
      jasmine.content.append('<div id="postcard-view-container"></div>');
      
      postcardSelection = new ModelSelection();
      postcardModel = new PostcardModel();
      postcardView = new PostcardView({
        el: '#postcard-view-container',
        model: postcardModel,
        modelSelection: postcardSelection
      });
    });

    describe("when the postcard is clicked", function() {
      beforeEach(function() {
        postcardView.render();
      });

      it("should set itself as selected", function() {
        $('.postcard').click();
        expect(postcardSelection.isSelected(postcardModel)).toBeTruthy();
      });
    });

    describe("when the postcard selection changes", function() {
      it("should re-render", function() {
        postcardView.$el.html('');
        postcardSelection.select(new PostcardModel());
        expect(postcardView.$el.html()).not.toEqual('');
      });
    });

    describe("#selectPostcard", function() {
      it("should trigger a pauseTour event", function() {
        spyOn(EventBus, 'trigger');
        postcardView.selectPostcard();
        expect(EventBus.trigger).toHaveBeenCalledWith('pauseTour');
      });
    });

    describe("#render", function() {
      describe("when the postcard is selected", function() {
        beforeEach(function() {
          postcardSelection.select(postcardModel);
        });
        
        it("should be rendered as selected", function() {
          postcardView.render();
          expect($('.postcard')).toHaveClass('selected');
        });
      });

      describe("when the postcard is not selected", function() {
        beforeEach(function() {
          postcardSelection.select();
        });

        it("should be rendered as unselected", function() {
          postcardView.render();
          expect($('.postcard')).not.toHaveClass('selected');
        });
      });
    });
  });

});
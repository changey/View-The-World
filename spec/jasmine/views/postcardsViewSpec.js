define(function (require) {
  var PostcardsView = require('views/postcards')
    , ActiveLocationModel = require('models/activeLocation')
    , PostcardModel = require('models/postcard')
    , PostcardCollection = require('collections/postcards')
    , TourLocationModel = require('models/tourLocation');

  describe("ViewTheWorld.Views.Postcards", function() {
    var postcardsView, postcardCollection, postcardDiv;
    
    beforeEach(function() {
      var locationDiv = document.createElement('div');
      $(locationDiv).addClass('location active');
      jasmine.content.append(locationDiv);


      postcardDiv = document.createElement('div');
      jasmine.content.append(locationDiv);
      
      var activeLocation = new ActiveLocationModel({location: new TourLocationModel()});
      postcardCollection = new PostcardCollection([], {
        activeLocation: activeLocation
      }); 
      postcardsView = new PostcardsView({
        activeLocation: activeLocation,
        collection: postcardCollection,
        el: postcardDiv
      });
    });

    describe("when the view is hidden", function() {
      beforeEach(function() {
        postcardsView.show();
        postcardCollection.push(new PostcardModel());
        
        postcardsView.hide();
      });

      it("should be hidden", function() {
        expect($(postcardDiv).html()).toEqual('');
      });

      describe("when the postcards are changed", function() {
        it("should not re-render", function() {
          postcardCollection.push(new PostcardModel());
          expect($(postcardDiv).html()).toEqual('');
        });
      });
    });
    
    describe("when the view is shown", function() {
      beforeEach(function() {
        postcardsView.show();  
      });
      
      describe("when the postcards are changed", function() {
        it("should re-render", function() {
          $(postcardDiv).html('');
          postcardCollection.push(new PostcardModel());
          expect($(postcardDiv).html()).not.toEqual('');
        });
      });
    });
  });
});
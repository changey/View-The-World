define(function(require){
  require('googleMapsLoader');
  var PhotoSphereView = require('views/photoSphere');
  
  describe("ViewTheWorld.Views.PhotoSphere", function() {
    var photoSphereView;

    beforeEach(function() {
      jasmine.content.append('<div id="photo-sphere"></div>');
      
      photoSphereView = new PhotoSphereView({
        el: '#photo-sphere'
      });
    });
    
    describe("#showPhotoSphere", function() {
      
      it("should show a photoSphere", function() {
        expect($('#photo-sphere')).toBeVisible();
      });

    });

    describe("#hide", function() {
      beforeEach(function() {
        photoSphereView.showPhotoSphere();
      });
      
      it("should hide the photoSphere", function() {
        photoSphereView.hide();
        expect($('#photo-sphere')).not.toBeVisible();
      });
    });
  });

});
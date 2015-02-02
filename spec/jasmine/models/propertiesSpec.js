define(function (require) {
  var Properties = require('models/properties');

  describe("ViewTheWorld.Models.Properties", function() {
    describe("#initialize", function() {
      it("fetches the properties json", function() {
        var properties = new Properties();
        properties.fetch();
        var request = mostRecentAjaxRequest();
        
        expect(request.url).toEqual("properties.json");
      });

      it("defines properties for each of its attributes", function() {
        var properties = new Properties();
        properties.fetch();
        
        var request = mostRecentAjaxRequest();
        request.response({
          status: "200",
          responseText: JSON.stringify({
            "tada": "wow"
          })
        });

        expect(properties.get("tada")).toEqual("wow");
      });
    });
  });
});
  
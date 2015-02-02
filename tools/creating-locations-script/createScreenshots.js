//to run: 
//set the travel time to 0/instantaneous
// then on the command line:
//casperjs --engine=slimerjs test createScreenshots.js
var HOST = casper.cli.options.host || 'http://localhost:9001/';

Global ="Times Square ~Grand Canyon ~The Great Wall of China ~The Forbidden City, Tiananmen Square ~Eiffel Tower ~Sydney Opera House ~The Coliseum, Rome ~The Guggenheim Bilboa, Spain ~Pyramids of Giza, Egypt ~Taj Mahal, India ~Graceland/Elvis, Nashville";
Hawaii ="The Maze at Dole Plantations ~World War II Pacific National Monument ~Hawaii Volcanoes National Park ~Haleakala National Park. Maui ~Akaka Falls ~The Desolation Trail ~Aloha Stadium ~North Shore, Oahu ~Waimea Canyon ~Old Koloa Town";
LosAngelesArea ="Venice Beach ~Griffith Observatory ~The Getty Center ~Watts Towers ~Chateau Marmont ~Hollywood Bowl ~Santa Monica Pier ~Pink's Hot Dogs ~La Brea Tar Pits ~Malibu";
SanDiegoArea ="San Diego Zoo ~Petco Park ~Balboa Park ~Torrey Pines State Reserve ~La Jolla Cove ~Botanical Gardens and Lily Pond ~University of San Diego ~Encinitas ~Museum of Contemporary Art, La Jolla ~Catalina Island";
SanFranciscoBayArea ="Golden Gate Bridge ~Point Bonita Lighthouse ~Alcatraz ~Lombard Street ~Sutro Tower ~Giants Ballpark ~Muir Woods National Monument ~Winchester Mystery House ~Mt Diablo ~Mendocino ~";

var LOCATIONS = Hawaii;

casper.test.begin("Can select a different tour location", {
  setUp: function() {
    casper.start(HOST + '#login');
    casper.evaluate(function() {
      localStorage.clear();
    }, {});
    casper.wait(1000);
  },

  
  
  test: function(test) {
    casper
      .then(function() {
        this.viewport(1500,520);

        this.fill('form#login-form', {
          'store-name': ['Home Depot'],
          'store-id': 'Costco',
          'email': 'saleschuck@norris.com',
          'location-set': ['Hawaii']
        }, false);

      })

      .thenClick("#login-button", function() {
        test.assertMatch(this.getCurrentUrl(), /\#tour/);
      })

      .waitForSelector('#locations', function() {
        test.assertExists('#locations');

        var clickAndCapture = function(name){
          casper.clickLabel( name );
          
          casper.waitFor(function(){return false;},function(){}, 1000)
          .then(function(){
            this.capture('screenshots/' + name.toLowerCase().split(' ').join('-') + '.png', {top: 120, left: 560, width: 326, height: 194});
          });
        };
        
        var locations = LOCATIONS.split(' ~');
        casper.each(locations, function(self, location) {
          self.then(function() {
            clickAndCapture(location);
          });
        });
      });
      
    casper.run(function() {
      test.done();
    });

  }
});
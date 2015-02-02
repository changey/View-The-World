var HOST = casper.cli.options.host || 'http://localhost:9514/';

casper.test.begin("Sales Rep can login and logout", {
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
        this.fill('form#login-form', {
          'branch-name': ['Bakersfield'],
          'store-name': ['Home Depot'],
          'email': 'saleschuck@norris.com',
          'location-set': ['San Francisco Bay Area']
        }, false);
      })

      .then(function() {
        this.evaluate(function() {
          $('#lead-organization').val('goGiants');
        });
      })

      .thenClick("#login-button", function() {
        test.assertMatch(this.getCurrentUrl(), /\#tour/);
      })

      .waitForSelector('#locations', function() {
        test.assertExists('#locations');

        this.evaluate(function() {
          var locationCount = $(".locations").length;
          test.assert(locationCount > 2);
        });
      })

      .then(function() {
        test.assertVisible("#map-canvas");
      })

      .then(function() {
        this.evaluate(function() {
          $("#street-address").val("/logout");
        });
      })

      .thenClick("#get-started", function() {
        test.assertMatch(this.getCurrentUrl(), /\#login/);
        test.assertNotVisible("#map-canvas");
        test.assertNotVisible("#faded-in-map-canvas");
      });

    casper.run(function() {
      test.done();
    });
  }
});
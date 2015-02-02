var HOST = casper.cli.options.host || 'http://localhost:9514/';

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
          $(".location-name:contains('Downtown San Francisco')").click();
        });
      })

      .then(function() {
        var selected = this.evaluate(function() {
          return $('.location.active .location-name:contains("Downtown San Francisco")').length;
        });
        test.assert(!!selected, "Downtown San Francisco tour location selected");
      });

    casper.run(function() {
      test.done();
    });

  }
});
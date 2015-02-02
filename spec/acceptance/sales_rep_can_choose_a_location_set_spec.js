var HOST = casper.cli.options.host || 'http://localhost:9514/';

casper.test.begin("Sales Rep can select a different location set", {
  setUp: function() {
    casper.start(HOST + '#login');
    casper.evaluate(function() {
      localStorage.clear();
    }, {});
    casper.viewport(1500,1500);
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
        var locationExists = this.evaluate(function() {
          return $(".location-name:contains('Downtown San Francisco')").length;
        });
        test.assert(!!locationExists, "Downtown San Francisco tour location is shown as a tour location.");
      })

      .then(function() {
        this.evaluate(function() {
          $("#street-address").val("/logout");
        });
        this.click('#get-started');
      })
      
      .then(function() {
        this.fill('form#login-form', {
          'branch-name': ['Bakersfield'],
          'store-name': ['Home Depot'],
          'email': 'saleschuck@norris.com'
        }, false);
      })

      .then(function() {
        this.evaluate(function() {
          $('#lead-organization').val('goGiants');
          $('#location-set').val('Global');
        });
      })
      
      .thenClick("#login-button", function() {
        test.assertMatch(this.getCurrentUrl(), /\#tour/);
      })

      .waitForSelector('#locations', function() {
        var leaningTower = this.evaluate(function() {
          return $(".location-name:contains('Leaning Tower of Pisa')").length;
        });
        test.assert(!!leaningTower, "The Leaning Tower of Pisa tour location is shown as a tour location.");
      })
      .then(function() {
        var timeSquare = this.evaluate(function() {
          return $(".location-name:contains('Times Square')").length;
        });
        test.assert(!!timeSquare, "Times Square tour location is shown as a tour location.");
      });

    casper.run(function() {
      test.done();
    });
  }
});
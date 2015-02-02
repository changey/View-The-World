/*global module:false*/
module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    sass: {
      compile: {
        options: {
          bundleExec: true,
          style: 'compressed'
        },
        files: {
          'dist/compiled/css/main.css': 'css/main.scss'
        }
      },
      development: {
        options: {
          bundleExec: true,
          style: 'expanded',
          lineNumbers: true
        },
        files: {
          'tmp/main.css': 'css/main.scss'
        }
      }
    },
    clean: {
      clear_compiled_folder: {
        src: ['dist/compiled/', '.tmp/']
      },
      clear_staging_folder: {
        src: ['dist/staging/']
      },
      clear_prod_folder: {
        src: ['dist/prod/']
      },
      clear_properties: {
        src: ['properties.json']
      },
      clear_dist: {
        src: ['dist/']
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        laxcomma: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        predef: ["define", "require"],
        globals: {
          getJSONFixture: false,
          jQuery: true,
          jasmine: false,
          describe: false,
          it: false,
          before: false,
          beforeEach: false,
          after: false,
          afterEach: false,
          expect: false,
          mostRecentAjaxRequest: false,
          spyOn: false,
          google: false,
          $: false,
          casper: false,
          ViewTheWorld: false
        }
      },
      all: [
        'js/**/*.js',
        'Gruntfile.js',
        'spec/jasmine/**/*.js',
        'spec/acceptance/**/*.js'
      ]
    },
    copy: {
      developmentConfig: {
        files: [
          {expand: false, src: ['config/development.json'], dest: 'properties.json'}
        ]
      },
      staging: {
        files: [
          {expand: true,  cwd: 'dist/compiled/', src: '**', dest: 'dist/staging/'},
          {expand: false, src: ['config/development.json'], dest: 'dist/staging/properties.json'}
        ]
      },
      prod: {
        files: [
          {expand: true,  cwd: 'dist/compiled/', src: '**', dest: 'dist/prod/'},
          {expand: false, src: ['config/production.json'], dest: 'dist/prod/properties.json'}
        ]
      },
      archive: {
        files: [
          {expand: true,  cwd: 'dist/compiled/', src: '**', dest: 'dist/archive/'},
          {expand: false, src: ['config/development.json'], dest: 'dist/archive/development.json'},
          {expand: false, src: ['config/staging.json'], dest: 'dist/archive/staging.json'},
          {expand: false, src: ['config/production.json'], dest: 'dist/archive/production.json'}
        ]
      },
      compiled: {
        files: [
          {expand: true, src: ['images/**'], dest: 'dist/compiled/'},
          {
            expand: true,
            src: [
              'vendor/js/requirejs/require.js',
              'tourLocationSets.json',
              'faqcards.json',
              'branches.json',
              'leadOrganizations.json'
            ],
            dest: 'dist/compiled/'
          },
          {expand: false, src: ['*.html'], dest: 'dist/compiled/'}
        ]
      }
    },
    useminPrepare: {
      html: 'dist/compiled/*.html'
    },
    usemin: {
      html: 'dist/compiled/*.html',
      options: {
        assetsDirs: ['images']
      }
    },
    requirejs: {
      compile: {
        options: {
          paths: {
            "googleMaps": "empty:" // loading from CDN directly
          },
          baseUrl: "./js",
          mainConfigFile: "./js/mainApp.js",
          name: "mainApp",
          out: "dist/compiled/js/mainApp.js"
        }
      },
      test_friendly_compile: {
        options: {
          paths: {
            "googleMaps": "empty:" // loading from CDN directly
          },
          baseUrl: "./js",
          mainConfigFile: "./spec/support/testMain.js",
          include: ["mainApp"],
          name: "../spec/support/testMain",
          out: "dist/compiled/js/mainApp.js"
        }
      }
    },
    connect: {
      server: {
        options: {
          protocol: 'https',
          hostname: 'localhost',
          port: 9001,
          debug: true,
          base: '.',
          open: true,
          livereload: true
        }
      },
      jasmine_server: {
        options: {
          hostname: 'localhost',
          port: 9111,
          debug: true,
          base: '.',
          livereload: 35728,
          open: 'http://localhost:9111/_SpecRunner.html'
        }
      },
      staging_server: {
        options: {
          hostname: 'localhost',
          port: 9514,
          debug: true,
          keepalive: true,
          base: 'dist/staging/'
        }
      },
      prod_server: {
        options: {
          hostname: 'localhost',
          port: 9999,
          debug: true,
          keepalive: true,
          base: 'dist/prod/',
          open: true
        }
      },
      casper_server: {
        options: {
          hostname: 'localhost',
          port: 9514,
          debug: true,
          keepalive: false,
          base: 'dist/staging/'
        }
      }
    },
    watch: {
      scss: {
        files: ['css/**/*.scss'],
        tasks: ['sass:development'],
        options: {
          interrupt: true,
          livereload: true,
          atBegin: true // run the task when you load watch
        }
      },
      jasmine_specs: {
        files: ['specs/jasmine/**/*.js', 'specs/support/*.js', 'js/**/*.js'],
        tasks: ['jasmine'],
        options: {
          interrupt: true,
          livereload: 35728,
          atBegin: true // run the task when you load watch
        }
      }
    },
    casperjs: {
      files: ['spec/acceptance/**/*.js']
    },
    jasmine: {
      specs: {
        options: {
          keepRunner: true,
          specs: 'spec/jasmine/**/*Spec.js',
          helpers: [
            'spec/support/jasmine_runner_helper.js',
            'spec/support/jasmine-jquery.js',
            'spec/support/mock-ajax.js',
            'spec/support/specHelper.js'
          ],
          vendor: [
            "vendor/js/jquery-2.1.0.js",
            "vendor/js/requirejs/require.js"
          ],
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: './spec/support/testMain.js',
            requireConfig: {
              baseUrl: './js',
              callback: function() {
                require(['models/properties', 'viewTheWorld', 'extensions'], function(Properties) {
                  ViewTheWorld.Properties = new Properties();
                });

              }
            }
          }
        }
      }
    },
    wait: {
      basic: {
        options: {
          delay: 1000
        }
      },
      short: {
        options: {
          delay: 200
        }
      }
    },
    'cache-busting': {
      requirejs: {
        replace: ['dist/**/*.html'],
        replacement: 'mainApp',
        file: 'dist/compiled/js/mainApp.js'
      },
      css: {
        replace: ['dist/**/*.html'],
        replacement: 'main.css',
        file: 'dist/compiled/css/main.css',
        cleanup: true //Remove previously generated hashed files.
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-casperjs');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-wait');
  grunt.loadNpmTasks('grunt-cache-busting');


  grunt.registerTask('compile',       [ 'jshint', 'sass:compile', 'requirejs:compile', 'copy:compiled', 'cache-busting', 'useminPrepare', 'usemin' ]);
  grunt.registerTask('compile_test',  [ 'jshint', 'sass:compile', 'requirejs:test_friendly_compile', 'copy:compiled', 'cache-busting', 'useminPrepare', 'usemin' ]);

  grunt.registerTask('build_staging', [ 'clean_staging', 'compile', 'copy:staging']);
  grunt.registerTask('build_prod',    [ 'clean_prod', 'compile', 'copy:prod']);
  grunt.registerTask('build_test',    [ 'clean_staging', 'compile_test', 'copy:staging']);
  grunt.registerTask('build_archive', [ 'clean_all', 'compile', 'copy:archive']);

  grunt.registerTask('dev_server',     [ 'copy:developmentConfig', 'connect:server', 'watch:scss' ]);
  grunt.registerTask('staging_server', [ 'build_staging', 'connect:staging_server' ]);
  grunt.registerTask('prod_server',    [ 'build_prod', 'connect:prod_server' ]);
  grunt.registerTask('casper_server',  [ 'build_test', 'connect:casper_server' ]);

  grunt.registerTask('default',       [ 'staging_server' ]);
  grunt.registerTask('clean_prod',    [ 'clean:clear_compiled_folder', 'clean:clear_prod_folder']);
  grunt.registerTask('clean_staging', [ 'clean:clear_compiled_folder', 'clean:clear_staging_folder']);
  grunt.registerTask('clean_all',     [ 'clean:clear_dist', 'clean:clear_properties' ]);


  grunt.registerTask('run_casper', ['casper_server', 'wait:basic', 'casperjs']);
 
  grunt.registerTask('run_jasmine', "Runs the jasmine specs in the browser", function() {
    // Short wait to give the specRunner.html time to be generated before opening the browser
    grunt.option('force', true);
    grunt.task.run(['jasmine', 'wait:short', 'connect:jasmine_server', 'watch:jasmine_specs']);
  });
  
  grunt.registerTask('run_tests', ['jasmine']);
};

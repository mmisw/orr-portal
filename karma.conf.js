module.exports = function (config) {
  config.set({

    basePath: './',

    files: [
      //'src/app/vendor/angular/angular.js',
      //'src/app/vendor/angular-mocks/angular-mocks.js',
      //'component/**/*.module.js',
      'src/app/js/util0.js',
      'src/app/js/**/*.spec.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-phantomjs-launcher'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};

var gulp        = require('gulp');
var gutil       = require('gulp-util');
var replace     = require('gulp-replace');
var rimraf      = require('rimraf');
var zip         = require('gulp-zip');
var merge       = require('merge-stream');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var webserver   = require('gulp-webserver');
var open        = require('open');
var fs          = require('fs');

var extend      = require('extend');
var karma       = require('karma').server;
var karmaConfig = require('./karma.conf');
var plugins     = require('gulp-load-plugins')();
// TODO use plugins.* for the others above...


(function getAppConfig() {
  var path = require('path');
  function evalJs(filenames) {
    filenames.forEach(function(filename) {
      var file = path.join(__dirname, '/src/app/js', filename);
      if (fs.existsSync(file)) eval.apply(this, [fs.readFileSync(file).toString()]);
    });
  }
  evalJs(['config.js', 'local.config.js']);
  console.log("appConfig=", appConfig);
})();


// TODO min'ified version

var ciMode = false;

var base = gutil.env.base;

var appInfo = require('./package');
var appName = appInfo.name;
var version = appInfo.version;

var distDest = './dist/' + appName;
var zipFile = appName + '-' + version + (base ? '-BASE' + base.replace(/\//g, '_') : '') + '.zip';
var zipDest = './dist';

gutil.log("Building version " + version);

if (base) {
  gutil.log('Will insert <base href="' +base+ '">');
}

var installDest = gutil.env.dest;
if (installDest) {
  gutil.log('dest=' +installDest);
  installDest = installDest.replace(/^~/, process.env.HOME);
  gutil.log('Install destination: ' +installDest);
}

gulp.task('default', ['dist']);


/////////////////////////////////////////////////////////////////////////////
// local development/testing

var localPort   = 9001;
var localUrl    = 'http://localhost:' +localPort+ '/src/app/';

gulp.task('dev', ['webserver'], function(cb) {
    open(localUrl);
    cb();
});

gulp.task('webserver', function() {
    gulp.src('.')
        .pipe(webserver({port: localPort}))
    ;
});


/////////////////////////////////////////////////////////////////////////////
// dist

gulp.task('dist', ['dist-directory'], function(){
  return gulp.src([distDest + '/**'])
    .pipe(zip(zipFile))
    .pipe(gulp.dest(zipDest));
});

/////////////////////////////////////////////////////////////////////////////
// install

gulp.task('install', ['check-dest', 'dist-directory'], function(){
  return gulp.src([distDest + '/**'])
    .pipe(gulp.dest(installDest));
});

gulp.task('check-dest', function (cb) {
  if (installDest === undefined) throw Error("install needs --dest=dir");
  if (!fs.lstatSync(installDest).isDirectory()) throw Error(installDest+ " is not a directory");
  cb()
});

/////////////////////////////////////////////////////////////////////////////
gulp.task('test', function () {
  karmaConfig({
    set: function (testConfig) {
      extend(testConfig, {
        singleRun: ciMode,
        autoWatch: !ciMode,
        browsers: ['PhantomJS']
      });

      karma.start(testConfig, function (exitCode) {
        plugins.util.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
      });
    }
  });
});

gulp.task('ci', function () {
  ciMode = true;
  return gulp.start(['test']);
  //return gulp.start(['clean', 'scripts', 'test']);
});


/////////////////////////////////////////////////////////////////////////////

gulp.task('dist-directory', ['app', 'vendor']);

gulp.task('app', ['clean'], function(){
  var src = ['./src/app/**', '!./src/app/**/*.html'];
  if (gutil.env.localConfig) {
    gutil.log("Including local.config.js");
  }
  else {
    src.push('!./src/app/js/local.config.js');
  }
  return merge(
    gulp.src(src)
      .pipe(gulp.dest(distDest)),
    gulp.src(['./src/app/**/*.html'])
      .pipe(replace(/<head>/g, '<head>' + (base ? '<base href="' +base+ '">' : '')))
      .pipe(replace(/@@version/g, version))
      .pipe(replace(/@@portalMainPage/g, appConfig.portal.mainPage))
      .pipe(replace(/@@brandingLogo/g, appConfig.branding.logo || 'img/mmi-orr3-logo.png'))
      .pipe(replace(/\.\.\/\.\.\/node_modules/g, 'vendor'))
      .pipe(gulp.dest(distDest))
  );
});

gulp.task('vendor', ['clean'], function() {
  return gulp.src([
      './node_modules/angular/**',
      './node_modules/angular-clipboard/**',
      './node_modules/angular-cookie/**',
      './node_modules/angular-sanitize/**',
      './node_modules/angular-ui-bootstrap/**',
      './node_modules/angular-ui-grid/**',
      './node_modules/angular-ui-router/**',
      './node_modules/angular-xeditable/**',
      './node_modules/comma-separated-values/**',
      './node_modules/bootstrap-css-only/**',
      './node_modules/font-awesome/**',
      './node_modules/lodash/**',
      './node_modules/moment/**',
      './node_modules/ng-file-upload/**',
      './node_modules/select2/**',
      './node_modules/ui-select/**'
    ], {base: './node_modules/'})
      .pipe(gulp.dest(distDest + '/vendor'))
});

gulp.task('clean', function (cb) {
    rimraf(distDest, cb);
});

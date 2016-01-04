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


var bower = require('./bower');
var appname = bower.name;
var version = bower.version;

var distDest = './dist/' + appname;
var zipfile = appname + '-' + version + '.zip';
var zipDest = './dist';

gutil.log("Building version " + version);

var base = gutil.env.base;
if (base) {
  gutil.log('Will insert <base href="' +base+ '">');
}

var installDest = gutil.env.dest;
gutil.log('dest=' +installDest);
if (installDest) {
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

gulp.task('dist', ['min'], function(){
  return gulp.src([distDest + '/**'])
    .pipe(zip(zipfile))
    .pipe(gulp.dest(zipDest));
});

/////////////////////////////////////////////////////////////////////////////
// install

gulp.task('install', ['check-dest', 'min'], function(){
  return gulp.src([distDest + '/**'])
    .pipe(gulp.dest(installDest));
});

gulp.task('check-dest', function (cb) {
  if (installDest === undefined) throw Error("install needs --dest=dir");
  if (!fs.lstatSync(installDest).isDirectory()) throw Error(installDest+ " is not a directory");
  cb()
});



/////////////////////////////////////////////////////////////////////////////

// TODO we are not actually using the min'ified stuff

gulp.task('min', ['app', 'vendor', 'orrportal']);

gulp.task('app', ['clean'], function(){
  return merge(
    gulp.src(['./src/app/**', '!./src/app/**/*.html', '!./src/app/js/config.local.js'])
      .pipe(gulp.dest(distDest)),
    gulp.src(['./src/app/**/*.html'])
      .pipe(replace(/<head>/g, '<head>' + (base ? '<base href="' +base+ '">' : '')))
      .pipe(replace(/@@version/g, version))
      .pipe(gulp.dest(distDest))
  );
});

gulp.task('vendor', ['vendor-js', 'vendor-css', 'vendor-other']);

gulp.task('vendor-js', ['clean'], function() {
  return merge(
    gulp.src([
      'src/app/vendor/angular/angular.min.js',
      'src/app/vendor/angular-sanitize/angular-sanitize.min.js',
      'src/app/vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'src/app/vendor/moment/min/moment.min.js',
      'src/app/vendor/lodash/dist/lodash.min.js',
      'src/app/vendor/angular-cookie/angular-cookie.min.js'
    ])
      .pipe(concat('vendor.js'))
      .pipe(gulp.dest(distDest + '/min/js'))
      .pipe(uglify())
      .pipe(rename('vendor.min.js'))
      .pipe(gulp.dest(distDest + '/min/js/vendor'))
  )
});

gulp.task('vendor-css', ['clean'], function() {
  return gulp.src([
      'src/app/vendor/bootstrap-css-only/css/bootstrap.min.css',
      'src/app/vendor/bootstrap-css-only/css/bootstrap-theme.min.css',
      'src/app/vendor/fontawesome/css/font-awesome.min.css',
      'src/app/vendor/angular-growl-v2/build/angular-growl.min.css'
    ])
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest(distDest + '/min/css/vendor'))
});

gulp.task('vendor-other', ['clean'], function() {
  return merge(
    gulp.src([
      'src/app/vendor/fontawesome/fonts/**'
    ], {base: 'src/app/vendor/fontawesome/'})
      .pipe(gulp.dest(distDest + '/min/css')),
    gulp.src([
      'src/app/vendor/bootstrap-css-only/fonts/**'
    ], {base: 'src/app/vendor/bootstrap-css-only/'})
      .pipe(gulp.dest(distDest + '/min/css'))
  )
});

gulp.task('orrportal', ['orrportal-js', 'orrportal-css', 'orrportal-other'], function(){
  gulp.src(['./src/app/index.min.html'])
    .pipe(replace(/@@version/g, version))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(distDest))
});

gulp.task('orrportal-js', ['clean'], function() {
  return gulp.src([
    'src/app/js/app.js',
    'src/app/js/config.js',
    'src/app/js/util.js',
    'src/app/js/services.js',
    'src/app/js/directives.js',
    'src/app/js/ontgrid.js'
  ])
    .pipe(concat('orrportal.js'))
    .pipe(gulp.dest(distDest + '/min/js'))
    .pipe(uglify())
    .pipe(rename('orrportal.min.js'))
    .pipe(gulp.dest(distDest + '/min/js'))
});

gulp.task('orrportal-css', ['clean'], function() {
  return gulp.src([
    'src/app/css/orrportal.css'
  ])
    .pipe(concat('orrportal.css'))
    .pipe(gulp.dest(distDest + '/min/css'))
});

gulp.task('orrportal-other', ['clean'], function() {
  return merge(
    gulp.src([
      'src/app/template/*.html',
      'src/app/template/*.html'
    ], {base: 'src/app/'})
      .pipe(replace(/@@version/g, version))
      .pipe(gulp.dest(distDest + '/min'))

  )
});

gulp.task('clean', function (cb) {
    rimraf(distDest, cb);
});

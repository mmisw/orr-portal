var gulp        = require('gulp');
var gutil       = require('gulp-util');
var replace     = require('gulp-replace');
var rimraf      = require('rimraf');
var zip         = require('gulp-zip');
var merge       = require('merge-stream');
var concat      = require('gulp-concat');
var rename      = require('gulp-rename');
var webserver   = require('gulp-webserver');
var open        = require('open');
var fs          = require('fs');

var extend      = require('extend');
var karma       = require('karma').server;
var karmaConfig = require('./karma.conf');

var runSequence = require('run-sequence');

//////////////////////////
// for minified version
// js: using uglify for now.
var uglify = require('gulp-uglify');
// var closure = require('google-closure-compiler').gulp();
// var sourcemaps = require('gulp-sourcemaps');
var csso = require('gulp-csso');

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

gulp.task('default', dist);


/////////////////////////////////////////////////////////////////////////////
// local development/testing

var localPort   = 9001;
var localUrl    = 'http://localhost:' +localPort+ '/src/app/indexdev.html';

gulp.task('dev', webserver, function(cb) {
    open(localUrl);
    cb();
});

function webserver() {
  gulp.src('.')
      .pipe(webserver({port: localPort}))
  ;
};

gulp.task('clean', function (cb) {
    rimraf(distDest, cb);
});

/////////////////////////////////////////////////////////////////////////////
// dist

function dist(cb) {
  runSequence('clean', 'package', 'min', cb);
};

gulp.task('app', gulp.series('clean'), function(){
  var src = ['./src/app/**', '!./src/app/**/*.html'];
  if (gutil.env.localConfig) {
    gutil.log("app task: Including local.config.js");
  }
  else {
    gutil.log("app task: Excluding local.config.js");
    src.push('!./**/local.config.js');
  }
  return merge(
    gulp.src(src)
      .pipe(gulp.dest(distDest)),
    gulp.src(['./src/app/**/*.html'])
      .pipe(replace(/<head>/g, '<head>' + (base ? '<base href="' +base+ '">' : '')))
      .pipe(replace(/@@version/g, version))
      .pipe(replace(/\.\.\/\.\.\/node_modules/g, 'vendor'))
      .pipe(gulp.dest(distDest))
  );
});

gulp.task('vendor', gulp.series('clean'), function() {
  return gulp.src([
      './node_modules/angular/**',
      './node_modules/angular-clipboard/**',
      './node_modules/angular-cookie/**',
      './node_modules/angular-sanitize/**',
      './node_modules/angular-ui-bootstrap/**',
      './node_modules/angular-ui-grid/**',
      './node_modules/angular-ui-router/**',
      './node_modules/angular-xeditable/**',
      './node_modules/angular-recaptcha/**',
      './node_modules/angular-jwt/**',
      './node_modules/angular-local-storage/**',
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

gulp.task('dist-directory', gulp.series('app', 'vendor'));

gulp.task('package', gulp.series('dist-directory'), function(){
  return gulp.src([distDest + '/**'])
    .pipe(zip(zipFile))
    .pipe(gulp.dest(zipDest));
});

/////////////////////////////////////////////////////////////////////////////
// install

function check_dest() {
  if (installDest === undefined) throw Error("install needs --dest=dir");
  if (!fs.lstatSync(installDest).isDirectory()) throw Error(installDest+ " is not a directory");
  cb()
};

gulp.task('install', gulp.series(check_dest, dist), function(){
  return gulp.src([distDest + '/**'])
    .pipe(gulp.dest(installDest));
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
        gutil.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
      });
    }
  });
});

gulp.task('ci', (done) => {
  ciMode = true;
  gulp.series(['test']);
  done();
  //return gulp.series(['clean', 'scripts', 'test']);
});


/////////////////////////////////////////////////////////////////////////////

gulp.task('app-index-and-config', function () {
  var cfgSrc = ['./src/app/js/config.js'];
  if (gutil.env.localConfig) {
    gutil.log("app-index-and-config: Including local.config.js");
    cfgSrc.push('./src/app/js/local.config.js');
  }
  else {
    gutil.log("app-index-and-config: Excluding local.config.js");
  }

  return merge(
    gulp.src(cfgSrc)
      .pipe(gulp.dest(distDest + '/js')),
    gulp.src(['./src/app/img/**'])
      .pipe(gulp.dest(distDest + '/img'))
  )
});

gulp.task('vendor-other', function() {
  return merge(
    gulp.src([
      'node_modules/font-awesome/fonts/**'
    ], {base: 'node_modules/font-awesome/'})
      .pipe(gulp.dest(distDest)),
    gulp.src([
      'node_modules/bootstrap-css-only/fonts/**'
    ], {base: 'node_modules/bootstrap-css-only/'})
      .pipe(gulp.dest(distDest)),
    gulp.src([
      'node_modules/angular-ui-grid/ui-grid.woff',
      'node_modules/angular-ui-grid/ui-grid.ttf'
    ], {base: 'node_modules/angular-ui-grid/'})
      .pipe(gulp.dest(distDest + "/css"))
  )
});

gulp.task('app-min-js', function() {
  return gulp.src(vendorJsSources.concat(appJsSources))
    .pipe(concat('orrportal.js'))
    .pipe(uglify())
    .pipe(rename('orrportal.min.js'))
    .pipe(gulp.dest(distDest + '/js'))
});

gulp.task('app-min-css', function() {
  return gulp.src(vendorCssSources.concat(appCssSources))
    .pipe(concat('orrportal.all.css'))
    .pipe(csso())
    .pipe(rename('orrportal.min.css'))
    .pipe(gulp.dest(distDest + '/css'))
});

gulp.task('app-min', gulp.series('app-min-css', 'vendor-other', 'app-min-js'));

gulp.task('min', gulp.series('app-index-and-config', 'app-min'));

const vendorCssSources = [
  'node_modules/bootstrap-css-only/css/bootstrap.css',
  'node_modules/bootstrap-css-only/css/bootstrap-theme.css',
  'node_modules/font-awesome/css/font-awesome.css',
  'node_modules/angular-ui-grid/ui-grid.css',
  'node_modules/ui-select/dist/select.css',
  'node_modules/select2/dist/css/select2.css',
  'node_modules/angular-xeditable/dist/css/xeditable.css'
]

const appCssSources = [
  'src/app/css/orrportal.css'
]

const appJsSources = [
  'src/app/js/bUtil.js',
  'src/app/js/appUtil.js',
  'src/app/js/app.js',
  'src/app/js/main/directives.js',
  'src/app/js/main/filters.js',
  'src/app/js/main/services.js',
  'src/app/js/main/main.js',
  'src/app/js/main/queryUtil.js',
  'src/app/js/facet/facetModel.js',
  'src/app/js/facet/facets.js',
  'src/app/js/ontgrid/ontgrid.js',
  'src/app/js/org/org.js',
  'src/app/js/org/org-create.js',
  'src/app/js/vocabulary/vocabulary.js',
  'src/app/js/uri/uri.js',
  'src/app/js/ont/metaUtil.js',
  'src/app/js/ont/ont.js',
  'src/app/js/ont/ont-contents.js',
  'src/app/js/ont/ont-meta.js',
  'src/app/js/ont/ont-meta-section.js',
  'src/app/js/ont/ont-data.js',
  'src/app/js/ont/v2r/v2r.js',
  'src/app/js/ont/v2r/v2r-csv.js',
  'src/app/js/ont/m2r/m2rUtil.js',
  'src/app/js/ont/m2r/m2r.js',
  'src/app/js/ont/rj/rj-viewer.js',
  'src/app/js/ont/multivalueedit.js',
  'src/app/js/term/term.js',
  'src/app/js/user/user.js',
  'src/app/js/st/st.js',
  'src/app/js/kw/kw.js',
  'src/app/js/search/search.js',
  'src/app/js/auth/auth.js',
  'src/app/js/auth/controllers.js',
  'src/app/js/upload/upload.js',
  'src/app/js/util/items-viewer.js',
  'src/app/js/util/util.js',
  'src/app/js/util/clipboardCopy.js',
  'src/app/js/util/view-as-options.js',
  'src/app/js/admin/users.js',
  'src/app/js/admin/orgs.js',
  'src/app/js/admin/triplestore.js',
  'src/app/js/admin/admin.js'
]

const vendorJsSources = [
  'node_modules/angular/angular.js',
  'node_modules/angular-cookie/angular-cookie.js',
  'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
  'node_modules/angular-sanitize/angular-sanitize.js',
  'node_modules/angular-ui-router/release/angular-ui-router.js',
  'node_modules/angular-clipboard/angular-clipboard.js',
  'node_modules/lodash/lodash.js',
  'node_modules/moment/moment.js',
  'node_modules/angular-ui-grid/ui-grid.js',
  'node_modules/ng-file-upload/dist/ng-file-upload.js',
  'node_modules/ui-select/dist/select.js',
  'node_modules/angular-xeditable/dist/js/xeditable.js',
  'node_modules/comma-separated-values/csv.js',
  'node_modules/angular-recaptcha/release/angular-recaptcha.js',
  'node_modules/angular-jwt/dist/angular-jwt.js',
  'node_modules/angular-local-storage/dist/angular-local-storage.js'
]

// gulp.task('closure', function() {
//   return gulp.src(vendorJsSources.concat(appJsSources))
//     .pipe(closure({
//       compilation_level: 'SIMPLE',
//       // warning_level: 'VERBOSE',
//       output_wrapper: '(function(){\n%output%\n}).call(this)',
//       js_output_file: 'orrportal.closure.min.js'
//     }))
//     .pipe(sourcemaps.write('/')) // gulp-sourcemaps automatically adds the sourcemap url comment
//     .pipe(gulp.dest(distDest))
// });

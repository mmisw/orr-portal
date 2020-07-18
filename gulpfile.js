const gulp        = require('gulp');
const argv        = require('minimist')(process.argv.slice(3))
const log         = require('fancy-log')
const replace     = require('gulp-replace');
const rimraf      = require('rimraf');
const zip         = require('gulp-zip');
const concat      = require('gulp-concat');
const rename      = require('gulp-rename');
const webserver   = require('gulp-webserver');
const fs          = require('fs');
const karma       = require('karma');

//////////////////////////
// for minified version
// js: using uglify for now.
//const uglify = require('gulp-uglify');
var uglify = require('gulp-uglify-es').default;
// var closure = require('google-closure-compiler').gulp();
// var sourcemaps = require('gulp-sourcemaps');
const csso = require('gulp-csso');

///////////////////////////////////////////////////////////
// Exports:

const app = gulp.parallel(localConfig, baseStuff)
const dist_directory = gulp.series(app, vendor);
const vendor_other = gulp.parallel(vendor_other_fontawesome, vendor_other_bootstrap);
const min = gulp.series(config, img, vendor_other, app_min_js, app_min_css);
const dist = gulp.series(dist_directory, do_package, min);
const try_dist = gulp.series(dist, open_dist);
const install = gulp.series(check_dest, dist, do_install);

exports.default = dist;
exports.dist = dist
exports.try_dist = try_dist
exports.dev = dev;
exports.install = install;
exports.test = doKarma(false);
exports.ci = gulp.series(doKarma(true));
exports.clean = clean;

///////////////////////////////////////////////////////////

const base = argv.base;

const appInfo = require('./package');
const appName = appInfo.name;
const version = appInfo.version;

const distDest = './dist/' + appName;
const zipFile = appName + '-' + version + (base ? '-BASE' + base.replace(/\//g, '_') : '') + '.zip';
const zipDest = './dist';

log("Building version " + version);

if (base) {
  log('Will insert <base href="' +base+ '">');
}

let installDest = argv.dest;
if (installDest) {
  log('dest=' +installDest);
  installDest = installDest.replace(/^~/, process.env.HOME);
  log('Install destination: ' +installDest);
}

/////////////////////////////////////////////////////////////////////////////
// local development/testing

const localPort   = 9001;
const localUrl    = 'http://localhost:' +localPort+ '/src/app/indexdev.html';

function dev(cb) {
  gulp.src('.')
      .pipe(webserver({
        port: localPort,
        open: localUrl,
        livereload: true
      }));
 cb();
}

function open_dist(cb) {
  gulp.src('dist')
      .pipe(webserver({
        port: localPort,
        open: 'http://localhost:9001/orrportal/',
        livereload: false
      }));
 cb();
}

function clean(cb) {
    rimraf(distDest, cb);
};

/////////////////////////////////////////////////////////////////////////////
// dist

function localConfig(cb) {
  var src = ['./src/app/**', '!./src/app/**/*.html'];
  if (argv.localConfig) {
    log("app task: Including local.config.js");
  }
  else {
    log("app task: EXCLUDING local.config.js");
    src.push('!./**/local.config.js');
  }

  gulp.src(src)
      .pipe(gulp.dest(distDest));

  cb();
}

function baseStuff(cb) {
    gulp.src(['./src/app/**/*.html'])
        .pipe(replace(/<head>/g, '<head>' + (base ? '<base href="' +base+ '">' : '')))
        .pipe(replace(/@@version/g, version))
        .pipe(replace(/\.\.\/\.\.\/node_modules/g, 'vendor'))
        .pipe(gulp.dest(distDest));

    cb();
}

function vendor(cb) {
  gulp.src([
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
      .pipe(gulp.dest(distDest + '/vendor'));

  cb();
}

function do_package(cb) {
  gulp.src([distDest + '/**'])
    .pipe(zip(zipFile))
    .pipe(gulp.dest(zipDest));
  cb();
}

/////////////////////////////////////////////////////////////////////////////
// install

function check_dest(cb) {
  if (!installDest) throw Error("install needs --dest=dir");
  if (!fs.lstatSync(installDest).isDirectory()) throw Error(installDest+ " is not a directory");
  cb();
}

function do_install(cb) {
  gulp.src(distDest + '/**')
      .pipe(gulp.dest(installDest));
  cb();
}

/////////////////////////////////////////////////////////////////////////////
function doKarma(singleRun) {
  return done => {
    const karmaConfig = {
      configFile: __dirname + '/karma.conf.js',
      singleRun: singleRun,
      browsers: ['PhantomJS']
    };
    const karmaServer = new karma.Server(
      karmaConfig,
      function handleKarmaServerExit(processExitCode){
        if (!processExitCode) {
          done();
        } else {
          var err = new Error('ERROR: Karma Server exited with code "' + processExitCode + '"');
          taskDone(err);
        }
        done();
        process.exit(processExitCode); //Exit the node process
      }
    );
    karmaServer.start();
  }
}

/////////////////////////////////////////////////////////////////////////////

function config(cb) {
  var cfgSrc = ['./src/app/js/config.js'];
  if (argv.localConfig) {
    log("config: INCLUDING local.config.js");
    cfgSrc.push('./src/app/config/local.config.js');
  }
  else {
    log("config: EXCLUDING local.config.js");
  }
  gulp.src(cfgSrc)
    .pipe(gulp.dest(distDest + '/js'));

  cb();
}

function img(cb) {
  gulp.src(['./src/app/img/**'])
    .pipe(gulp.dest(distDest + '/img'));

  cb();
}

function vendor_other_fontawesome(cb) {
  gulp.src([
    'node_modules/font-awesome/fonts/**'
  ], {base: 'node_modules/font-awesome/'})
      .pipe(gulp.dest(distDest));

  cb();
}

function vendor_other_bootstrap(cb) {
  gulp.src([
    'node_modules/bootstrap-css-only/fonts/**'
  ], {base: 'node_modules/bootstrap-css-only/'})
      .pipe(gulp.dest(distDest));

  cb();
}

function vendor_other_bootstrap(cb) {
  gulp.src([
    'node_modules/angular-ui-grid/fonts/ui-grid.woff',
    'node_modules/angular-ui-grid/fonts/ui-grid.ttf'
  ], {base: 'node_modules/angular-ui-grid/'})
      .pipe(gulp.dest(distDest + "/css"));

  cb();
}

function app_min_js(cb) {
  gulp.src(vendorJsSources.concat(appJsSources))
    .pipe(concat('orrportal.js'))
    .pipe(uglify())
    .pipe(rename('orrportal.min.js'))
    .pipe(gulp.dest(distDest + '/js'));
  cb();
}

function app_min_css(cb) {
  gulp.src(vendorCssSources.concat(appCssSources))
    .pipe(concat('orrportal.all.css'))
    .pipe(csso())
    .pipe(rename('orrportal.min.css'))
    .pipe(gulp.dest(distDest + '/css'));
  cb();
}

const vendorCssSources = [
  'node_modules/bootstrap-css-only/css/bootstrap.css',
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

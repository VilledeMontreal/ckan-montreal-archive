const gulp = require('gulp');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const svgSprite = require('gulp-svg-sprite');
const concat = require('gulp-concat');
const nodemon = require('gulp-nodemon');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');
const runTimestamp = Math.round(Date.now()/1000);

// CSS
gulp.task('css', function () {
  return gulp.src('./src/css/app.css')
    .pipe(postcss([
        require('postcss-import'),
        postcssPresetEnv({
          features: {
            'nesting-rules': true
          }
        }),
        tailwindcss('./tailwind.config.js'),
        require('autoprefixer'),
        require('cssnano')
      ]))
    .pipe(gulp.dest('./themes/montreal/public/stylesheets'));
});


// icons
gulp.task('icons', function(done) {
  gulp.src('**/*.svg', { cwd: './src/icons' })
    .pipe(svgSprite(
      config = {
        mode: {
          symbol: true
        }
      }
    ))
    .pipe(gulp.dest('./opendk/views/partials'));
    done();
});


// js
gulp.task('js', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./opendk/public/js'));
});


// server
gulp.task("server", cb => {
  let started = false;

  return nodemon({
    script: 'index.js',
    options: '-e', // -e means we watch for changes in templates too
    ext: 'js html',
    env: { 'API_URL': 'https://demo.ckan.org/api/3/action/' }
  }).on("start", () => {
    if (!started) {
      cb();
      started = true;
    }
  });
});


// watching
gulp.task('watch:css', function() {
  return gulp.watch(['./src/css/**/*.css'],
  gulp.series('css'));
});

gulp.task('watch:icons', function() {
  return gulp.watch(['./src/icons/**/*.svg'],
  gulp.series('icons'));
});

gulp.task('watch:js', function() {
  return gulp.watch(['./src/js/**/*.js'],
  gulp.series('js'));
});

gulp.task('watch', gulp.parallel('watch:css', 'watch:icons', 'watch:js'));

// deafult task (this task is not completing..)
gulp.task('default', gulp.parallel('watch', 'server'));

// svg to font-icon generator from src directory
var fontName = 'icons'; 

gulp.task('iconfont', function(){
  return gulp.src(['./src/icons/**/*.svg']) // Source folder containing the SVG images
    .pipe(iconfontCss({
      fontName: fontName, // The name that the generated font will have
      path: './public/font-icon/template/_icons.css', // The path to the template that will be used to create the SASS/LESS/CSS file
      targetPath: '../_icons.css', // The path where the file will be generated
      fontPath: './fonts/' // The path to the icon font file
    }))
    .pipe(iconfont({
      prependUnicode: false, // Recommended option 
      fontName: fontName, // Name of the font
      formats: ['ttf', 'eot', 'woff'], // The font file formats that will be created
      normalize: true,
      timestamp: runTimestamp // Recommended to get consistent builds when watching files
    }))
    .pipe(gulp.dest('./public/font-icon/fonts'));
});
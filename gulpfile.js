const gulp = require('gulp');
const compiler = require('google-closure-compiler-js').gulp();

gulp.task('compile-server', function() {
  // select your JS code here
  return gulp.src([
        './public/data_api/action.js',
        './public/data_api/board.js',
        './public/data_api/cards.js',
        './app/helpers/shuffler.js',
        './app/data_api/*.js',
        './app/game/chat.js',
        './app/game/board_builder.js',
        './app/game/game.js',
        './app/game/state_machine.js',
        './app/game/games.js',
        './app/app.js',
  ])
      .pipe(compiler({
          externs: './app/externs.js',
          compilation_level: 'SIMPLE',
          warning_level: 'VERBOSE',
          output_wrapper: '(function(){\n%output%\n}).call(this)',
          js_output_file: 'server.min.js',  // outputs single file
          create_source_map: true,
          process_common_js_modules: true,
          language_out: 'ES6',
        }))
      .pipe(gulp.dest('./app'));
});

gulp.task('compile-client', function() {
  // select your JS code here
  return gulp.src([
        './public/data_api/action.js',
        './public/data_api/board.js',
        './public/data_api/cards.js',
        './public/js/game/client.js',
        './public/js/game/popups.js',
        './public/js/game/player.js',
        './public/js/game/game.js',
  ])
      .pipe(compiler({
          externs: './app/externs.js',
          compilation_level: 'SIMPLE',
          warning_level: 'VERBOSE',
          output_wrapper: '(function(){\n%output%\n}).call(this)',
          js_output_file: 'client.min.js',  // outputs single file
          create_source_map: true,
          process_common_js_modules: true,
          language_out: 'ES6',
        }))
      .pipe(gulp.dest('./public'));
});

gulp.task('default', [ 'compile-server', 'compile-client' ]);

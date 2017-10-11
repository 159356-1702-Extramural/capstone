const gulp = require('gulp');
const fs = require('fs');
const ClosureCompiler = require('google-closure-compiler-js').gulp();

var options = {
	languageIn: 'ECMASCRIPT6',
	languageOut: 'ECMASCRIPT6',
	compilationLevel: 'ADVANCED',
	warningLevel: 'VERBOSE',
	externs: ['app/externs/core.js',
	            'app/externs/http.js',
	            'app/externs/process.js',
	            'app/externs/Express.js',
	            'app/externs/Express-static.js',
	            'app/externs/socket.io-externs.js'],
	create_source_map: true,
    process_common_js_modules: true,
    //use_types_for_optimization: false,
    output_wrapper: '(function(){\n%output%\n}).call(this)',
    js_output_file: 'server.min.js',  // outputs single file
}

function toArray(arg) {
	if (typeof arg === 'string') {
		return [arg];
	} else if (arg) {
		return arg;
	} else {
		return [];
	}
}

function readExternFile(extern) {
	if ('string' === typeof extern ||
		'object' === typeof extern && undefined === extern.src && 'string' === typeof extern.path) {
		var newExtern = {
			src: '',
			path: 'string' === typeof extern? extern: extern.path
		};
		fs.readFile(newExtern.path, 'utf8', (err, src) => {
			if (err) {
				throw new Error(err);
			}
			else {
				newExtern.src = src;
			}
		});
		return newExtern;
	}
	else {
		return extern;
	}
}

function translateOptions(options) {
	var externs = options.externs;
	if (externs) {
		externs = toArray(externs);
		options.externs = externs.map(extern => readExternFile(extern));
	}
}

// we have to translate 'externs' content,
// due to google closure compiler's webpack plugin doesn't support extern path string(OK with 'src' content)
translateOptions(options);

var compiler = new ClosureCompiler(options);



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
        './app/app.js'
  ])
      .pipe(compiler)
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
          compilation_level: 'SIMPLE',
          warning_level: 'DEFAULT',
          output_wrapper: '(function(){\n%output%\n}).call(this)',
          js_output_file: 'client.min.js',  // outputs single file
          create_source_map: true,
          process_common_js_modules: true,
          language_out: 'ES6',
        }))
      .pipe(gulp.dest('./public'));
});

gulp.task('default', [ 'compile-server']);

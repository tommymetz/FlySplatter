module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		////////////////////////////////////////////////////
		//JSHINT////////////////////////////////////////////
		////////////////////////////////////////////////////
		jshint: {
      all: [
        'gruntfile.js',
        'assets/js/flysplatter.js',
      ]
    },

		////////////////////////////////////////////////////
		//UGLIFY////////////////////////////////////////////
		////////////////////////////////////////////////////
		uglify: {
		  	dist: {
					files: {
			  		'dist/js/flysplatter.min.js': [
							'assets/js/flysplatter.js',
						]
					},
		  	},
    },

		////////////////////////////////////////////////////
		//WATCH/////////////////////////////////////////////
		////////////////////////////////////////////////////
		watch: {
			files: [
				'assets/js/flysplatter.js'
			],
			tasks: ['jshint', 'uglify']
		},

	}); //END grunt.initConfig

	//LOAD TASKS
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	//REGISTER TASKS
	grunt.registerTask('default', [ 'jshint', 'uglify', ]);

};

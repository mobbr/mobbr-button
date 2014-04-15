module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                files: {
                    'mobbr.src.js': [
                        'bower_components/base64/base64.js',
                        'bower_components/js-md5/js/md5.js',
                        'bower_components/json3/lib/json3.js',
                        'src/mobbr-button.js',
                        'src/mobbr-sso.js',
                        'src/mobbr-widget.js'
                    ]
                }
            }
        },
        uglify: {
            options: {

            },
            dist: {
                files: {
                    'mobbr.js': [ 'mobbr.src.js' ]
                }
            }
        },
        jshint: {
            files: [ 'Gruntfile.js', 'src/*.js' ],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: [ '<%= jshint.files %>' ],
            tasks: [ 'jshint' ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('test', [ 'jshint' ]);
    grunt.registerTask('default', [ 'jshint', 'concat', 'uglify' ]);
};

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            base: {
                src: ['src/ts/app.ts'],
                dest: 'public/js/app.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es3', //or es3
                    basePath: 'src/ts',
                    sourceMap: true,
                    declaration: true
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/ts/**/*.ts'],
                tasks: ['typescript'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Default task(s).
    grunt.registerTask('default', ['typescript']);
    grunt.registerTask('watcher', ['watch']);

};
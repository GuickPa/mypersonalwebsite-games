module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // --------------------------------------------------------------------------------
    // UGLIFY
    //
    uglify: {
      dist: {
        files: {
          'build/assets/js/app.js': ['src/assets/js/*.js','src/assets/js/**/*.js'],
          'build/games/base/engineBase.js' :['src/games/base/*.js', 'src/games/base/**/*.js']
        },
        options: {
          mangle: false,
          compress: false,
          sourceMap: true,
          sourceMapName: 'build/assets/js/scripts.map',
          sourceMapIncludeSources: true
        }
      }
    },

    // --------------------------------------------------------------------------------
    // SASS
    //
    sass: {
      dist: {
        options : {
          outputStyle : 'compressed',
          precision: 6,
          loadPath: ['src/assets/scss/partials','src/assets/scss/partials/components','src/assets/scss/partials/content-modules','src/assets/scss/lib','src/assets/scss/lib/bootstrap'],
          sourceMap: 'build/assets/css/screen.css.map',
          sourceComments: false
        },
        files: [
          {
            expand: true,
            cwd: 'src/assets/scss',
            src: ['*.scss'],
            dest: 'build/assets/css',
            ext: '.css'
          }
        ]
      }
    },

    // --------------------------------------------------------------------------------
    // INCLUDEREPLACE
    //
    includereplace: {
      dist: {
        options: {
          includesDir: 'src/html-partials',
          globals: {
            "metaTitle": "Guglielmo Deletis",
            "metaDescription": "",
            "metaSiteName": "Guglielmo Deletis",
            "gMapsApiKey": "",
            "appVersion": "<%= pkg.version %>"
          }
        },
        files: [
          { src: ['**/*.html','!**/_*.html','!html-partials/**'], dest: 'build/', expand: true, cwd: 'src/' }
        ]
      }
    },

    // --------------------------------------------------------------------------------
    // CONCAT
    //
    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: ['src/assets/js/lib/*.js','src/assets/js/lib/jquery-plugins/*.js'],
        dest: 'build/assets/js/lib/utils.js'
      }
    },

    // --------------------------------------------------------------------------------
    // COPY
    //
    copy: {
      dist: {
        expand: true,
        cwd: 'src/',
        src: ['*.json','ajax/**/*','assets/**/*','games/**/*','games/*', '!games/base/*','!assets/scss/**','!assets/js/*.*','!assets/js/**','!assets/js/**/*.*','!assets/js/lib/**/*','!assets/js/jst/**','favicon.ico','!**/README.txt'],
        dest: 'build/'
      }
    },

    // --------------------------------------------------------------------------------
    // DELETE SYNC
    //
    delete_sync: {
      dist: {
        cwd: 'build',
        src: ['*.html','ajax/**/*','assets/**/*','!assets/scss/**','!assets/css/*.*','!assets/js/*.*','!assets/js/lib/**/*','favicon.ico','!**/README.txt'],
        syncWith: 'src'
      }
    },

    // --------------------------------------------------------------------------------
    // CONNECT
    //
    connect: {
      server: {
        options: {
          port: 9000,
          base: 'build',
          protocol: 'http',
          livereload: 35739,
          useAvailablePort: true,
          middleware: function (connect, options, middlewares) {
            var fs = require('fs');
            var path = require('path');
            var support = ['POST', 'PUT', 'DELETE'];
            middlewares.unshift(function (req, res, next) {
              if (support.indexOf(req.method.toUpperCase()) != -1) {
                var filepath = path.join(options.base[0], req.url);
                if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
                  return res.end(fs.readFileSync(filepath));
                }
              }
              return next();
            });
            return middlewares;
          }
        }
      }
    },

    // --------------------------------------------------------------------------------
    // OPEN
    //
    open: {
      dev: {
        path: 'http://localhost:9000',
        app: 'Google Chrome'
      }
    },

    // --------------------------------------------------------------------------------
    // CLEAN
    //
    clean: {
      build: {
        src: ["build"]
      },
      sasscache: {
        src: [".sass-cache"]
      }
    },

    // --------------------------------------------------------------------------------
    // WATCH
    //
    watch: {
      js: {
        files: ['src/assets/js/*.js','src/assets/js/**/*.js', 'src/games/**/*.js'],
        tasks: ['uglify'],
        options: {
          livereload: {
            port: 35739
          }
        }
      },      
      libjs: {
        files: ['src/assets/js/lib/*.js','src/assets/js/lib/jquery-plugins/*.js'],
        tasks: ['concat'],
        options: {
          livereload: {
            port: 35739
          }
        }
      },
      css: {
        files: ['src/assets/scss/**/*.scss','src/assets/scss/**/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: {
            port: 35739
          }
        }
      },
      html: {
        files: ['src/**/*.html'],
        tasks: ['includereplace'],
        options: {
          livereload: {
            port: 35739
          }
        }
      },
      copyfiles: {
        files: ['src/ajax/**','src/assets/**', 'src/games/**/*.js'],
        tasks: ['newer:copy'],
        options: {
          livereload: {
            port: 35739
          }
        }
      },
      delete_sync: {
        files: ['src/*.html','src/*.json','src/assets/**','src/ajax/**'],
        tasks: ['delete_sync'],
        options: {
          livereload: {
            port: 35739
          }
        }
      }
    }

  });


  // caricamento dei plugin
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);


  // registerTask
  grunt.registerTask('default', []);
  grunt.registerTask('build', ['clean:build','copy','sass','uglify','concat','includereplace']);
  grunt.registerTask('dev', ['build','connect','open:dev','watch']);

};

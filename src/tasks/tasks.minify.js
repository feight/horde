

/* ------------------------------------------------------------------------ */
/*
        client code minification
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            requires
    */
    /* -------------------------------------------------------------------- */


    var utils = require(require("path").resolve("horde/src/utils/utils.js"))(grunt);

    var settings = grunt.file.readJSON(require("path").resolve("horde/settings.json"));

    var extend = require("node.extend");


    /* -------------------------------------------------------------------- */
    /*
            private
    */
    /* -------------------------------------------------------------------- */


    var writeMinification = function(dest, output, original, options){

        var humanize = require("humanize");
        var path = require("path");
        var fs = require("fs");

        options = options || {};

        if(options.cwd && options.dest){

            var rel = path.relative(options.cwd, dest);
            var base = dest.split(rel)[0];

            dest = path.join(base, options.dest, rel);

        }

        if(dest === original){

            grunt.log.ok("File {0} already exists".format(dest["cyan"]));

        }else{

            grunt.file.write(dest, output);

            var stat1 = fs.statSync(original);
            var stat2 = fs.statSync(dest);

            grunt.log.ok("File {0} created: {1} → {2}".format(
                dest["cyan"],
                humanize.filesize(stat1["size"])["green"],
                humanize.filesize(stat2["size"])["green"]
            ));

        }

    };


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.js = function(paths, options){

        var selects = utils.getCacheSelects((paths || []), "minify", "uglify");

        if(selects){

            var uglify = require("uglify-js");

            selects.forEach(function(select){

                var dest = String(select);
                var code = grunt.file.read(select);

                if(!dest.match(/[\.-]min.js$/)){

                    dest = dest.replace(/(.*?).js$/g, "$1.min.js");
                    code = uglify.minify(select).code;

                }

                writeMinification(dest, code, select, options);

            });

            utils.setCacheSelects(selects, "minify", "uglify");

        }

    };

    this.css = function(paths, options){

        var selects = utils.getCacheSelects((paths || []), "minify", "css");

        if(selects){

            var cssmin = require("cssmin");

            selects.forEach(function(select){

                var dest = String(select);
                var code = grunt.file.read(select);

                if(!dest.match(/[\.-]min.css$/)){

                    dest = dest.replace(/(.*?).css$/g, "$1.min.css");
                    code = cssmin(code);

                }

                writeMinification(dest, code, select, options);

            });

            utils.setCacheSelects(selects, "minify", "css");

        }

    };

    return this;

};
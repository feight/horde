

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
    var humanize = require("humanize");
    var fs = require("fs");


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.js = function(paths, options, id){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.minify.js.paths || []));

        options = extend(settings.minify.js.options || {}, options || {});

        utils.runHistoryFunction(paths, "minify", "uglify", id, function(selects, callback){

            var uglify = require("uglify-js");
            var data = [];

            for(var i = 0; i < selects.length; i++){

                var output = uglify.minify(selects[i]);
                var dest = selects[i].replace(/(.*?).js$/g, "$1.min.js");

                fs.writeFileSync(dest, output.code);

                var stat1 = fs.statSync(selects[i]);
                var stat2 = fs.statSync(dest);

                grunt.log.ok("File {0} created: {1} → {2}".format(
                    dest["cyan"],
                    humanize.filesize(stat1["size"])["green"],
                    humanize.filesize(stat2["size"])["green"]
                ));

            }

            callback();

        });

    };

    this.css = function(paths, options, id){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.minify.css.paths || []));

        options = extend(settings.minify.css.options || {}, options || {});

        utils.runHistoryFunction(paths, "minify", "css", id, function(selects, callback){

            var cssmin = require("cssmin");

            for(var i = 0; i < selects.length; i++){

                var output = cssmin(fs.readFileSync(selects[i], "utf8"));
                var dest = selects[i].replace(/(.*?).css$/g, "$1.min.css");

                fs.writeFileSync(dest, output);

                var stat1 = fs.statSync(selects[i]);
                var stat2 = fs.statSync(dest);

                grunt.log.ok("File {0} created: {1} → {2}".format(
                    dest["cyan"],
                    humanize.filesize(stat1["size"])["green"],
                    humanize.filesize(stat2["size"])["green"]
                ));

            }

            callback();

        });

    };

    return this;

};
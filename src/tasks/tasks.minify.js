

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


    var utils = require(require("path").resolve("grunt/src/utils/utils.js"))(grunt);

    var fs = require("fs");


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.js = function(paths, options, id){

        utils.runHistoryFunction(paths, "minify", "uglify", id, function(selects, callback){

            var uglify = require("uglify-js");

            for(var i = 0; i < selects.length; i++){

                var output = uglify.minify(selects[i]);

                fs.writeFileSync(selects[i].replace(/(.*?).js$/g, "$1.min.js"), output.code);

            }

        });

    };

    this.css = function(paths, options, id){

        utils.runHistoryFunction(paths, "minify", "css", id, function(selects, callback){

            var cssmin = require("cssmin");

            for(var i = 0; i < selects.length; i++){

                var output = cssmin(fs.readFileSync(selects[i], "utf8"));

                fs.writeFileSync(selects[i].replace(/(.*?).css$/g, "$1.min.css"), output);

            }

            callback();

        });

    };

    return this;

};
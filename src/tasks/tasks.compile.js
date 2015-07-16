

/* ------------------------------------------------------------------------ */
/*
        client code compiling
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
            public
    */
    /* -------------------------------------------------------------------- */


    this.less = function(paths, options, id){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.compile.less.paths || []));

        options = extend(settings.compile.less.options || {}, options || {});

        utils.runHistoryFunction(paths, "compile", "less", id, function(selects, callback){

            var less = require("less");
            var fs = require("fs");

            var process = function(files, index){

                index = index || 0;

                if(files[index]){

                    var data = fs.readFileSync(files[index], "utf8");
                    var last = !files[index + 1];

                    less.render(data, options, function(error, output){

                        if(error){
                            grunt.fail.fatal(error);
                        }

                        fs.writeFileSync(files[index].replace(/(.*?).less$/g, "$1.css"), output.css);

                        if(!last){
                            process(files, index + 1);
                        }else{
                            callback();
                        }

                    });

                }

            };

            process(selects);

        });

    };

    return this;

};
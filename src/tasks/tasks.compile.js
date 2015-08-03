

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


    this.less = function(paths, options, complete){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.compile.less.paths || []));

        options = extend(settings.compile.less.options || {}, options || {});

        utils.runHistoryFunction(paths, "compile", "less", function(selects, callback){

            if(!selects){
                return complete();
            }

            var humanize = require("humanize");
            var less = require("less");
            var path = require("path");
            var fs = require("fs");

            var processLess = function(files, index){

                index = index || 0;

                if(files[index]){

                    var data = fs.readFileSync(files[index], "utf8");
                    var output = files[index].replace(/(.*?).less$/g, "$1.css");
                    var last = !files[index + 1];

                    options.filename = path.join(process.cwd(), files[index]);

                    less.render(data, options.less, function(error, response){

                        if(error){

                            grunt.fail.fatal(error);

                        }

                        if(options.cwd && options.dest){

                            var rel = path.relative(options.cwd, output);
                            var base = output.split(rel)[0];

                            output = path.join(base, options.dest, rel);

                        }

                        grunt.file.write(output, response.css);

                        var stat = fs.statSync(output);

                        grunt.log.ok("File {0} created: {1}".format(
                            output["cyan"],
                            humanize.filesize(stat["size"])["green"]
                        ));

                        if(!last){

                            processLess(files, index + 1);

                        }else{

                            callback();

                            complete();

                        }

                    });

                }

            };

            processLess(selects);

        });

    };

    return this;

};
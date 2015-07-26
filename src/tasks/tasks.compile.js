

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


    this.less = function(paths, options, id, complete){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.compile.less.paths || []));

        options = extend(settings.compile.less.options || {}, options || {});

        utils.runHistoryFunction(paths, "compile", "less", id, function(selects, callback){

            var humanize = require("humanize");
            var less = require("less");
            var fs = require("fs");

            var process = function(files, index){

                index = index || 0;

                if(files[index]){

                    var data = fs.readFileSync(files[index], "utf8");
                    var output = files[index].replace(/(.*?).less$/g, "$1.css");
                    var last = !files[index + 1];

                    options.filename = files[index];

                    less.render(data, options, function(error, response){

                        if(error){
                            grunt.fail.fatal(error);
                        }

                        fs.writeFileSync(output, response.css);

                        var stat = fs.statSync(output);

                        grunt.log.ok("File {0} created: {1}".format(
                            output["cyan"],
                            humanize.filesize(stat["size"])["green"]
                        ));

                        if(!last){

                            process(files, index + 1);

                        }else{

                            callback();

                            complete();

                        }

                    });

                }

            };

            process(selects);

        }, complete);

    };

    return this;

};
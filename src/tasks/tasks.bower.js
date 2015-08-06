

/* ------------------------------------------------------------------------ */
/*
        run bower install across multiple bower.json files
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            requires
    */
    /* -------------------------------------------------------------------- */


    var utils = require(require("path").resolve("horde/src/utils/utils.js"))(grunt);


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.install = utils.deasync(function(args, complete){

        args = args || {};

        var selects = utils.getCacheSelects(args.paths, "bower", "install");

        if(!selects){
            return complete();
        }

        var bower = require("bower");
        var path = require("path");

        var log = function(result){
            grunt.log.writeln(["bower", result.id.cyan, result.message].join(" "));
        };

        var error = function(error){
            grunt.fail.fatal(error);
        };

        var processBowers = function(files, index){

            index = index || 0;

            if(files[index]){

                var next = function(){

                    if(files[index + 1]){

                        processBowers(files, index + 1);

                    }else{

                        utils.setCacheSelects(selects, "bower", "install");

                        complete();

                    }

                };

                grunt.log.ok("{0} : {1} {2}".format(
                    "bower"["cyan"],
                    "install"["green"],
                    files[index]
                ));

                bower.commands.install(
                    [],
                    { save : true },
                    { cwd : path.dirname(files[index]), directory : args.dest }
                )
                .on("log", log)
                .on("error", error)
                .on("end", next);

            }

        };

        processBowers(selects);

    });

    return this;

};
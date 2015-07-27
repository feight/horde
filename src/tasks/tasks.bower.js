

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


    this.install = function(paths, destination){

        var path = require("path");

        destination = destination || "assets/lib/bower";

        utils.runHistoryFunction(paths, "bower", "install", function(selects, callback){

            if(selects){

                for(var i = 0; i < selects.length; i++){
                    utils.execSync("cd " + path.resolve(path.dirname(selects[i])) + "; bower install --config.directory=" + destination);
                }

            }

            callback();

        });

    };

    return this;

};
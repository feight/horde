

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


    this.install = function(paths){

        var path = require("path");

        utils.runHistoryFunction(paths, "bower", "install", "all", function(selects, callback){

            for(var i = 0; i < selects.length; i++){
                utils.execSync("cd " + path.resolve(path.dirname(selects[i])) + "; bower install --config.directory=assets/lib/bower");
            }

            callback();

        });

    };

    return this;

};
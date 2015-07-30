

/* ------------------------------------------------------------------------ */
/*
        cleans
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


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    var clean = function(paths){

        paths = paths.concat(settings.clean.paths || []);

        for(var i = 0; i < paths.length; i++){

            grunt.file.delete(paths[i]);

            console.log("Cleaned {0}".format(paths[i]["green"]));

        }

    };

    return clean;

};
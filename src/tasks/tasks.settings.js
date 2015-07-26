

/* ------------------------------------------------------------------------ */
/*
        Module to collect settings related tasks
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.compile = function(paths, formats){

        var extend = require("node.extend");
        var fs = require("fs");

        var settings = {};

        for(var i = 0; i < paths.length; i++){

            paths[i] = paths[i].format.apply(paths[i], formats);

            if(fs.existsSync(paths[i])){

                try{
                    settings = extend(true, settings, JSON.parse(fs.readFileSync(paths[i], "utf8")));
                }catch(e){
                    grunt.fail.fatal("Configuration file is not valid JSON: " + paths[i]);
                }

            }

        }

        return settings;

    };

    return this;

};

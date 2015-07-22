

/* ------------------------------------------------------------------------ */
/*
        grunt tasks
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    var tasks = [
        "bower",
        "clean",
        "compile",
        "compress",
        "copy",
        "filter",
        "images",
        "lint",
        "minify",
        "prompt"
    ];

    var exports = {};

    for(var i = 0; i < tasks.length; i++){

        exports[tasks[i]] = require(
            require("path").resolve("horde/src/tasks/tasks.{0}.js".format(tasks[i]))
        )(grunt);

    }

    return exports;

};

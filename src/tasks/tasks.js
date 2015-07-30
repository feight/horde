

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


    var resolve = require("path").resolve;

    return {
        bower    : require(resolve("horde/src/tasks/tasks.bower.js"))(grunt),
        clean    : require(resolve("horde/src/tasks/tasks.clean.js"))(grunt),
        compile  : require(resolve("horde/src/tasks/tasks.compile.js"))(grunt),
        compress : require(resolve("horde/src/tasks/tasks.compress.js"))(grunt),
        display  : require(resolve("horde/src/tasks/tasks.display.js"))(grunt),
        images   : require(resolve("horde/src/tasks/tasks.images.js"))(grunt),
        lint     : require(resolve("horde/src/tasks/tasks.lint.js"))(grunt),
        minify   : require(resolve("horde/src/tasks/tasks.minify.js"))(grunt),
        prompt   : require(resolve("horde/src/tasks/tasks.prompt.js"))(grunt),
        replace  : require(resolve("horde/src/tasks/tasks.replace.js"))(grunt),
        settings : require(resolve("horde/src/tasks/tasks.settings.js"))(grunt)
    };

};

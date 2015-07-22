

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


    return {
        bower    : require(require("path").resolve("horde/src/tasks/tasks.bower.js"))(grunt),
        clean    : require(require("path").resolve("horde/src/tasks/tasks.clean.js"))(grunt),
        compile  : require(require("path").resolve("horde/src/tasks/tasks.compile.js"))(grunt),
        compress : require(require("path").resolve("horde/src/tasks/tasks.compress.js"))(grunt),
        copy     : require(require("path").resolve("horde/src/tasks/tasks.copy.js"))(grunt),
        display  : require(require("path").resolve("horde/src/tasks/tasks.display.js"))(grunt),
        filter   : require(require("path").resolve("horde/src/tasks/tasks.filter.js"))(grunt),
        images   : require(require("path").resolve("horde/src/tasks/tasks.images.js"))(grunt),
        lint     : require(require("path").resolve("horde/src/tasks/tasks.lint.js"))(grunt),
        minify   : require(require("path").resolve("horde/src/tasks/tasks.minify.js"))(grunt),
        prompt   : require(require("path").resolve("horde/src/tasks/tasks.prompt.js"))(grunt)
    };

};

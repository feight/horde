

/* ------------------------------------------------------------------------ */
/*
        filters files
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.utils = require(require("path").resolve("horde/src/utils/utils.js"))(grunt);

    this.tasks = require(require("path").resolve("horde/src/tasks/tasks.js"))(grunt);

    return this;

};
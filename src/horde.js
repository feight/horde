

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


    return {
        utils : require(require("path").resolve("horde/src/utils/utils.js"))(grunt),
        tasks : require(require("path").resolve("horde/src/tasks/tasks.js"))(grunt)
    };

};
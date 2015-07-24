

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


    var resolve = require("path").resolve;

    return {
        utils : require(resolve("horde/src/utils/utils.js"))(grunt),
        tasks : require(resolve("horde/src/tasks/tasks.js"))(grunt)
    };

};
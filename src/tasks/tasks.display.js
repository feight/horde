

/* ------------------------------------------------------------------------ */
/*
        terminal display
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


    this.image = function(path){

        var pictureTube = require('picture-tube')
        var fs = require('fs');

        var tube = pictureTube();

        tube.pipe(process.stdout);

        fs.createReadStream(path).pipe(tube);

    };

    return this;

};
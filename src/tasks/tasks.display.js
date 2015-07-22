

/* ------------------------------------------------------------------------ */
/*
        terminal display
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.image = function(task, path, width, callback){

        var fs = require("fs");
        var done = task.async();
        var pictureTube = require("picture-tube");

        width = Number(width) || 50;

        var tube = pictureTube({
            cols : Math.floor(process.stdout.columns / (100 / width))
        });

        tube.pipe(process.stdout);

        console.log("");

        fs.createReadStream(path).pipe(tube).on("end", function(){

            done();

            callback();

        });

    };

    return this;

};
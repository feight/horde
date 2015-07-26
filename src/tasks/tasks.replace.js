

/* ------------------------------------------------------------------------ */
/*
        Module to do regex replacements
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.regex = function(paths, regex, replacement){

        var fs = require("fs");

        var replacements = !(regex instanceof Array) ? [regex, replacement] : [regex];

        for(var i = 0; i < paths.length; i++){

            var data = fs.readFileSync(paths[i], "utf8");

            for(var j = 0; j < replacements.length; j++){

                data = data.replace(replacements[j][0], replacements[j][1]);

            }

            // fs.writeFileSync(paths[i], data);

        }

    };

    return this;

};

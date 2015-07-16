

/* ------------------------------------------------------------------------ */
/*
        client code compiling
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            requires
    */
    /* -------------------------------------------------------------------- */


    var utils = require(require("path").resolve("grunt/src/utils/utils.js"))(grunt);


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.less = function(paths, options, id){

        utils.runHistoryFunction(paths, "compile", "less", id, function(selects, callback){

            var less = require("less");
            var fs = require("fs");

            var process = function(files, index){

                index = index || 0;

                if(files[index]){

                    var data = fs.readFileSync(files[index], "utf8");
                    var last = !files[index + 1];

                    less.render(data, options, function(error, output){

                        if(error){
                            grunt.fail.fatal(error);
                        }

                        fs.writeFileSync(files[index].replace(/(.*?).less$/g, "$1.css"), output.css);

                        if(!last){
                            process(files, index + 1);
                        }else{
                            callback();
                        }

                    });

                }

            };

            process(selects);

        });

    };

    return this;

};
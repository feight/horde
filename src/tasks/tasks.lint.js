

/* ------------------------------------------------------------------------ */
/*
        code linting
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


    this.jscs = function(paths, options, id){

        utils.runHistoryFunction(paths, "lint", "jscs", id, function(selects, callback){

            utils.execSync("jscs {0} --config {1}".format(selects.join(" "), options.config));

            callback();

        });

    };

    this.jshint = function(paths, options, id){

        utils.runHistoryFunction(paths, "lint", "jshint", id, function(selects, callback){

            utils.execSync("jshint {0} --config {1}".format(selects.join(" "), options.config));

            console.log("No code style errors found.");

            callback();

        });

    };

    this.lesslint = function(paths, options, lessPaths, id){

        utils.runHistoryFunction(paths, "lint", "lesslint", id, function(selects, callback){

            var csslint = require("csslint").CSSLint;
            var table = require("text-table");
            var less = require("less");
            var fs = require("fs");

            var errors = [];

            var process = function(files, index){

                index = index || 0;

                if(files[index]){

                    var data = fs.readFileSync(files[index], "utf8");
                    var last = !files[index + 1];

                    less.render(data, options, function(error, output){

                        if(error){
                            grunt.fail.fatal(error);
                        }

                        result = csslint.verify(output.css, options);

                        result.messages.forEach(function(message){

                            errors.push({
                                message : message,
                                file : files[index],
                                output : output.css
                            });

                        });

                        if(!last){

                            process(files, index + 1);

                        }else{

                            if(errors.length){

                                errors.forEach(function(error){

                                    var line = error.message.line - 1;
                                    var lines = error.output.split("\n");
                                    var prints = [[line, lines[line]]];
                                    var printsLine = 0;

                                    if(lines[line - 1]){

                                        prints.unshift([line - 1, lines[line - 1]]);
                                        printsLine++;

                                    }

                                    if(lines[line - 2]){

                                        prints.unshift([line - 2, lines[line - 2]]);
                                        printsLine++;

                                    }

                                    prints.push([line + 1, lines[line + 1] || ""]);
                                    prints.push([line + 2, lines[line + 2] || ""]);

                                    var data = [];

                                    for(var i = 0; i < prints.length; i++){

                                        data.push([
                                            (String(prints[i][0] + 1) + " | ")["grey"],
                                            (" " + prints[i][1])[i === printsLine ? "red" : "white"]
                                        ]);

                                        if(i === printsLine){

                                            data.push([
                                                "---------"["grey"],
                                                (new Array(error.message.col + 1).join("-") + "^")["grey"]
                                            ]);

                                        }

                                    }

                                    console.log(error.message.rule.name["white"].bold + " at " + error.file["green"] + " :");
                                    console.log(error.message.rule.desc["grey"]);
                                    console.log(table(data, { align : ["r", "l"], hsep : "" }));

                                });

                                console.log("\n\n{0} code style error{1} found.".format(errors.length, errors.length > 1 ? "s" : ""));

                                grunt.fail.fatal("CSS Lint errors detected.");

                            }

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
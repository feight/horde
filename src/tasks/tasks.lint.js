

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


    var utils = require(require("path").resolve("horde/src/utils/utils.js"))(grunt);

    var settings = grunt.file.readJSON(require("path").resolve("horde/settings.json"));

    var extend = require("node.extend");


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.jscs = function(paths, options){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.lint.jscs.paths || []));

        options = extend(settings.lint.jscs.options || {}, options || {});

        utils.runHistoryFunction(paths, "lint", "jscs", function(selects, callback){

            if(selects){

                utils.execSync("jscs {0} --config {1}".format(selects.join(" "), options.config));

                callback();

            }

        });

    };

    this.jshint = function(paths, options){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.lint.jshint.paths || []));

        options = extend(settings.lint.jshint.options || {}, options || {});

        utils.runHistoryFunction(paths, "lint", "jshint", function(selects, callback){

            if(selects){

                utils.execSync("jshint {0} --config {1}".format(selects.join(" "), options.config));

                console.log("No code style errors found.");

                callback();

            }

        });

    };

    this.jshintNode = function(paths, options){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.lint.jshint_node.paths || []));

        options = extend(settings.lint.jshint_node.options || {}, options || {});

        this.jshint(paths, options);

    };

    this.lesslint = function(paths, options, complete){

        paths = paths || [];

        paths.concat(settings.lint.lesslint.paths || []);

        options = extend(settings.lint.lesslint.options || {}, options || {});

        utils.runHistoryFunction(paths, "lint", "lesslint", function(selects, callback){

            if(!selects){
                return complete();
            }

            var csslint = require("csslint").CSSLint;
            var table = require("text-table");
            var less = require("less");
            var path = require("path");
            var fs = require("fs");

            var errors = [];

            var processLint = function(files, index){

                index = index || 0;

                if(files[index]){

                    var data = fs.readFileSync(files[index], "utf8");

                    options.filename = path.join(process.cwd(), files[index]);

                    less.render(data, options.less, function(error, output){

                        if(error){
                            grunt.fail.fatal(error);
                        }

                        if(output.css !== ""){

                            result = csslint.verify(output.css, grunt.file.readJSON(options.config));

                            result.messages.forEach(function(message){

                                errors.push({
                                    message : message,
                                    file : files[index],
                                    output : output.css
                                });

                            });

                        }

                        if(files[index + 1]){

                            processLint(files, index + 1);

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

                                complete();

                            }else{

                                console.log("No code style errors found.");

                                callback();

                                complete();

                            }

                        }

                    });

                }

            };

            processLint(selects);

        });

    };

    return this;

};
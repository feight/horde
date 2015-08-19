

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

    var self = this;


    /* -------------------------------------------------------------------- */
    /*
            private
    */
    /* -------------------------------------------------------------------- */


    var validate = function(errors, type, callback){

        if(!errors){
            return false;
        }

        if(!errors.length){

            console.log("No {0} code style errors found.".format(type));

            return typeof callback === "function" ? callback() : true;

        }

        var table = require("text-table");

        errors.forEach(function(error){

            var line = error.line;
            var lines = error.code.split("\n");

            var prints = {
                line : lines[line - 1],
                post : [
                    (lines[line] ? lines[line] : ""),
                    (lines[line + 1] ? lines[line + 1] : "")
                ],
                pre : [
                    (lines[line - 3] ? lines[line - 3] : ""),
                    (lines[line - 2] ? lines[line - 2] : "")
                ]
            };

            var data = [];

            prints.pre.forEach(function(text, index){

                var li = line - (prints.pre.length - index);

                if(li >= 0){
                    data.push(["{0} | ".format(li)["grey"], " {0}".format(text)["white"]]);
                }

            });

            data.push(["{0} | ".format(line)["grey"], " {0}".format(lines[line - 1]["red"])]);
            data.push(["---------"["grey"], (new Array(error.character - 1).join("-") + "^")["grey"]]);

            prints.post.forEach(function(text, index){
                data.push(["{0} | ".format(line + (index + 1))["grey"], " {0}".format(text)["white"]]);
            });

            console.log("");
            console.log(error.reason["white"].bold + " at " + error.file["green"] + " :");

            if(error.description){
                console.log(error.description["grey"]);
            }

            console.log(table(data, { align : ["r", "l"], hsep : "" }));

        });

        console.log("");

        grunt.fail.fatal("{1} {2} code style {0} found.".format(
            grunt.util.pluralize(errors, "errors/error"),
            errors.length,
            type
        ));

        return false;

    };


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.jscs = function(paths, options, complete){

        paths = paths || [];
        paths = paths.concat(utils.expand(settings.lint.jscs.paths || []));
        options = extend(settings.lint.jscs.options || {}, options || {});

        var selects = utils.getCacheSelects(paths, "lint", "jscs");

        if(!selects){

            validate([], "JSCS");

            return complete();

        }

        var JSCS = require("jscs");
        var fs = require("fs");

        options.config = grunt.file.readJSON(options.config);

        var jscs = new JSCS();
        var errors = [];

        jscs.registerDefaultRules();
        jscs.configure(options.config);

        var processJSCS = function(files, index){

            index = index || 0;

            if(files[index]){

                var next = function(){

                    if(files[index + 1]){

                        processJSCS(files, index + 1);

                    }else{

                        if(validate(errors, "JSCS")){

                            utils.setCacheSelects(selects, "lint", "jscs");

                            complete();

                        }

                    }

                };

                var code = fs.readFileSync(files[index], "utf8");

                jscs.checkFile(files[index]).then(function(list){

                    var errs = list["_errorList"];

                    for(var i = 0; i < errs.length; i++){

                        errors.push({
                            character : errs[i].column + 3,
                            reason : errs[i].message,
                            line : errs[i].line,
                            file : files[index],
                            description : "",
                            code : code
                        });

                    }

                    next();

                });

            }

        };

        processJSCS(selects);

    };

    this.jshint = function(paths, options, skipNode){

        paths = paths || [];
        paths = paths.concat(utils.expand(settings.lint.jshint.paths || []));
        options = extend(settings.lint.jshint.options || {}, options || {});

        var selects = utils.getCacheSelects(paths, "lint", "jshint");
        var errors = [];

        if(selects){

            var jshint = require("jshint").JSHINT;
            var fs = require("fs");

            options.config = grunt.file.readJSON(options.config);

            for(var i = 0; i < selects.length; i++){

                var code = fs.readFileSync(selects[i], "utf8");

                jshint(code, options.config);

                for(var j = 0; j < jshint.errors.length; j++){

                    if(jshint.errors[j] !== null){

                        errors.push({
                            character : jshint.errors[j].character,
                            reason : jshint.errors[j].reason,
                            line : jshint.errors[j].line,
                            file : selects[i],
                            description : "",
                            code : code
                        });

                    }

                }

            }

        }

        if(validate(errors, "JSHint")){
            utils.setCacheSelects(selects, "lint", "jshint");
        }

        if(!skipNode){
            this.jshintNode();
        }

    };

    this.jshintNode = function(){

        this.jshint(
            (utils.expand(settings.lint.jshint_node.paths || [])),
            (settings.lint.jshint_node.options || {}),
            true
        );

    };

    this.lesslint = function(paths, options, complete){

        paths = paths || [];

        paths.concat(settings.lint.lesslint.paths || []);

        options = extend(settings.lint.lesslint.options || {}, options || {});

        var selects = utils.getCacheSelects(paths, "lint", "lesslint");

        if(!selects){
            return validate([], "LessLint", complete);
        }

        var csslint = require("csslint").CSSLint;
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

                    var next = function(){

                        if(files[index + 1]){

                            processLint(files, index + 1);

                        }else{

                            validate(errors, "LessLint", function(){

                                utils.setCacheSelects(selects, "lint", "lesslint");

                                complete();

                            });

                        }

                    };

                    if(error){
                        grunt.fail.fatal(error);
                    }

                    if(output.css !== ""){

                        result = csslint.verify(output.css, grunt.file.readJSON(options.config));

                        result.messages.forEach(function(message){

                            errors.push({
                                character : message.col,
                                reason : message.rule.name,
                                line : message.line,
                                file : files[index],
                                description : message.rule.desc,
                                code : output.css
                            });

                        });

                    }

                    next();

                });

            }

        };

        processLint(selects);

    };

    return this;

};
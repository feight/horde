

/* ------------------------------------------------------------------------ */
/*
        prompts for input
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
            presets
    */
    /* -------------------------------------------------------------------- */


    var presets = {
        environment : [
            { name : "Local", value : "dev" },
            { name : "Stage", value : "stage" },
            { name : "Live", value : "live" }
        ],
        application : [
            { name : "Frontend", value : "frontend" },
            { name : "Backend", value : "backend" }
        ],
        site : function(){

            var path = require("path");
            var fs = require("fs");

            var folders = grunt.file.expand("src/sites/*/");
            var extensions = [];
            var choices = [];

            for(var i = 0; i < folders.length; i++){

                var id = folders[i].replace(/.*\/(.*?)\/$/g, "$1");
                var config = utils.getSiteBuildConfig(id);

                var choice = {
                    name : config.name,
                    "extends" : config.extends,
                    value : id
                };

                if(choice.extends){
                    extensions.push(choice);
                }else{
                    choices.push(choice);
                }

            }

            for(var j = 0; j < extensions.length; j++){

                for(var k = 0; k < choices.length; k++){

                    if(extensions[j].extends === choices[k].value){

                        extensions[j].name = "  " + extensions[j].name;
                        choices.splice(k + 1, 0, extensions[j]);

                        break;

                    }

                }

            }

        }
    };


    /* -------------------------------------------------------------------- */
    /*
            private
    */
    /* -------------------------------------------------------------------- */


    var runPrompt = function(args){

        var inquirer = require("inquirer");

        args = args || {};

        if(
            grunt.config.data.prompt &&
            grunt.config.data.prompt[args.id]
        ){

            callback(grunt.config.data.prompt[args.id]);

        }else{

            grunt.config("prompt", grunt.config("prompt") || {});

            var history = utils.getBuildHistory();

            history.prompt = history.prompt || {};

            if(typeof args.choices === "function"){
                args.choices = args.choices();
            }

            inquirer.prompt([
                {
                    message : "Select {0}:".format(args.id),
                    name : args.id,
                    type : "list",
                    default : history.prompt[args.id],
                    choices : args.choices
                }
            ], function(answers){

                grunt.config("prompt." + args.id, answers[args.id]);

                history.prompt[args.id] = answers[args.id];

                utils.setBuildHistory(history);

                args.callback(answers[args.id]);

            });

        }

    };


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.get = function(task, prompts, callback){

        var done = task.async();

        if(typeof prompts === "string"){
            prompts = [prompts];
        }

        var completed = 0;
        var data = {};

        var process = function(prompts, index){

            index = index || 0;

            var prmpt = prompts[index];

            if(typeof prmpt === "string"){

                prmpt = {
                    id : prmpt,
                    choices : presets[prmpt]
                };

            }

            var cb = function(response){

                data[prmpt.id] = response;

                completed++;

                if(index !== prompts.length - 1){

                    process(prompts, index + 1);

                }else{

                    callback(data);

                    done();

                }

            };

            runPrompt({
                id : prmpt.id,
                callback : cb,
                choices : prmpt.choices
            });

        };

        process(prompts);

    };

    return this;

};


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


    var getDefault = function(prompt){

        var hist = utils.getBuildHistory().prompt || {};
        var def = hist[prompt.id];

        for(var i = 0; i < prompt.choices.length; i++){
            if(prompt.choices[i].value === def){
                return def;
            }
        }

        return null;

    };

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
                    message : "Select {0}:".format(args.label),
                    name : args.id,
                    type : "list",
                    default : getDefault(args),
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


    this.get = function(task, prompts, callback, useHistory){

        var done = task.async();

        var history = utils.getBuildHistory();

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
                    label : prmpt,
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

            if(
                useHistory &&
                history.prompt &&
                history.prompt[prmpt.id]
            ){

                var val = history.prompt[prmpt.id];

                for(var i = 0; i < prmpt.choices.length; i++){
                    if(prmpt.choices[i].value ===  history.prompt[prmpt.id]){
                        val = prmpt.choices[i].name;
                    }
                }

                console.log("{0} {1} {2}".format(
                    "?"["green"],
                    "Select {0}:".format(prmpt.id)["white"].bold,
                    val["cyan"]
                ));

                return cb(history.prompt[prmpt.id]);

            }

            runPrompt({
                id : prmpt.id,
                label : prmpt.label || prmpt.id,
                callback : cb,
                choices : prmpt.choices
            });

        };

        process(prompts);

    };

    return this;

};
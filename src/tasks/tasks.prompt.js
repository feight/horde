

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
            public
    */
    /* -------------------------------------------------------------------- */


    this.get = function(types, task, callback){

        done = task.async();

        if(typeof types === "string"){
            types = [types];
        }

        var completed = 0;
        var data = {};

        var run = function(key){

            this[key](function(response){

                data[key] = response;

                completed++;

                if(completed === types.length){

                    callback(data);

                    done();

                }

            });

        };

        for(var i = 0; i < types.length; i++){
            run(types[i]);
        }

    };

    this.site = function(callback){

        var extend = require("node.extend");
        var inquirer = require("inquirer");
        var path = require("path");
        var fs = require("fs");

        if(
            grunt.config.data.prompt &&
            grunt.config.data.prompt.siteId
        ){

            callback(grunt.config.data.prompt.siteId);

        }else{

            grunt.config("prompt", {});

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

            var history = utils.getBuildHistory();

            inquirer.prompt([
                {
                    message : "Select a site",
                    name : "site",
                    type : "list",
                    choices : choices
                }
            ], function(answers){

                grunt.config("prompt.siteId", answers.site);

                history.lastSite = answers.site;

                utils.setBuildHistory(history);

                callback(answers.site);

            });

        }

    };

    return this;

};
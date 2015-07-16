

/* ------------------------------------------------------------------------ */
/*
        grunt utility functions
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            prototypes
    */
    /* -------------------------------------------------------------------- */


    String.prototype.format = function(){

        var args = arguments;

        this.unkeyed_index = 0;

        return this.replace(/\{(\w*)\}/g, function(match, key){

            if(key === ""){

                key = this.unkeyed_index;
                this.unkeyed_index++;

            }

            if(key === String(+key)){

                return args[key] !== "undefined" ? args[key] : match;

            }else{

                for(var i = 0; i < args.length; i++){
                    if(typeof args[i] === "object" && typeof args[i][key] !== "undefined"){
                        return args[i][key];
                    }
                }

                return match;

            }

        }.bind(this));

    };


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    var obj = {

        execSync : function(command){

            require("child_process").execSync(command, { stdio : [0, 1, 2] });

        },

        addChildModules : function(exports, filename, dirname, args){

            var path = require("path");
            var glob = require("glob");

            var ext = path.extname(filename);
            var base = path.basename(filename, ext);
            var search = path.join(dirname, base + ".*" + ext);

            files = glob.sync(search);

            for(var i = 0; i < files.length; i++){

                var regex = new RegExp("\\.(.*?)\\" + ext + "$", "i");
                var match = regex.exec(files[i]);
                var id = match[1];

                exports[id] = require(files[i])(args);

            }

            return exports;

        },

        getHash : function(file){

            var crypto = require("crypto");
            var fs = require("fs");

            var checksum = function(str){
                return crypto.createHash("sha1").update(str, "utf8").digest("hex");
            };

            var data = fs.readFileSync(file);

            return checksum(data);

        },

        getBuildHistory : function(){

            if(grunt.config("cacheHistory")){

                return grunt.config("cacheHistory");

            }

            var fs = require("fs");
            var history = {};
            var data = "{}";

            try{
                data = fs.readFileSync("grunt/temp/history.json", "utf8");
            }catch(e){}

            try{
                history = JSON.parse(data);
            }catch(e){}

            grunt.config("cacheHistory", history);

            return history;

        },

        setBuildHistory : function(history){

            var jsonfile = require("jsonfile");
            var path = require("path");
            var file = "grunt/temp/history.json";

            grunt.file.mkdir(path.dirname(file));

            grunt.config("cacheHistory", history);

            jsonfile.writeFileSync(file, history);

        },

        process : function(str, data){

            if(typeof str === "object"){

                for(var key in str){
                    str[key] = this.process(str[key], data);
                }

                console.log(str);

                return str;

            }else if(typeof str === "string"){

                return grunt.template.process(str, { data : data });

            }else{

                return str;

            }

        },

        expand : function(paths, data){

            for(var i = 0; i < paths.length; i++){
                paths[i] = this.process(paths[i], data);
            }

            return grunt.file.expand(paths);

        },

        toTitleCase : function(str){

            return str.replace(/\w\S*/g, function(txt){
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });

        },

        getSiteBuildConfig : function(site){

            var path = require("path");
            var fs = require("fs");

            var configPath = path.join("src/sites/", site, "build.json");
            var config = {};

            if(fs.existsSync(configPath)){
                config = grunt.file.readJSON(configPath);
            }

            config.name = config.name || this.toTitleCase(site.replace("-", " "));

            return config;

        },

        humanTime : function(t){

            t = Math.round((t / 1000) * 10) / 10;

            return (t === 1 ? "{0} second" : "{0} seconds").format(t);

        },

        runHistoryFunction : function(paths, key, engine, id, func){

            id = id || "all";

            var history = this.getBuildHistory();

            var tag = (engine + ":" + id)["cyan"];
            var selects = [];
            var self = this;

            history[key] = history[key] || {};
            history[key][engine] = history[key][engine] || {};

            for(var i = 0; i < paths.length; i++){

                if(history[key][engine][paths[i]] !== self.getHash(paths[i])){
                    selects.push(paths[i]);
                }

            }

            grunt.log.ok(tag + " : " + (String(paths.length) + " files")["green"] + " found");

            if(selects.length !== paths.length){

                grunt.log.ok(tag + " : " + (String(paths.length - selects.length) + " files")["green"] + " skipped");

            }

            if(selects.length > 0){

                func(selects, function(){

                    for(var j = 0; j < selects.length; j++){

                        history[key][engine][selects[j]] = self.getHash(selects[j]);

                        self.setBuildHistory(history);

                    }

                });

            }

        }

    };

    return obj;

};


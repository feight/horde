

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

        extend : require("node.extend"),

        execSync : function(command){

            require("child_process").execSync(command, { stdio : [0, 1, 2] });

        },

        rsync : function(source, destination, excludes){

            var path = require("path");
            var fs = require("fs");

            if(!fs.existsSync(source)){
                return;
            }

            grunt.file.mkdir(destination);

            if(
                excludes &&
                excludes instanceof Array &&
                excludes.length > 0
            ){
                excludes = " --exclude=" + excludes.join(" --exclude=");
            }else{
                excludes = "";
            }

            this.execSync("rsync -avz --ignore-times --checksum {2} {0} {1}".format(source, destination, excludes));

        },

        formatDate : function(time, format){

            var dateFormat = require("dateformat");

            return dateFormat(time, format || "h:MM:ss TT");

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
                data = fs.readFileSync("horde/temp/history.json", "utf8");
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
            var file = "horde/temp/history.json";

            grunt.file.mkdir(path.dirname(file));

            grunt.config("cacheHistory", history);

            jsonfile.writeFileSync(file, history);

        },

        writeJSON : function(file, json, options){

            var jsonfile = require("jsonfile");
            var path = require("path");

            options = options || { spaces : 2 };

            grunt.file.mkdir(path.dirname(file));

            jsonfile.writeFileSync(file, json, options);

        },

        process : function(str, data){

            if(typeof str === "object"){

                for(var key in str){
                    str[key] = this.process(str[key], data);
                }

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

        getCacheSelects : function(paths, key, engine){

            var history = this.getBuildHistory();

            var tag = (engine)["cyan"];
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

            selects = selects.length === 0 ? null : selects;

            return selects;

        },

        setCacheSelects : function(selects, key, engine){

            if(selects){

                var history = this.getBuildHistory();

                history[key] = history[key] || {};
                history[key][engine] = history[key][engine] || {};

                for(var i = 0; i < selects.length; i++){

                    history[key][engine][selects[i]] = this.getHash(selects[i]);

                    this.setBuildHistory(history);

                }

            }

        }

    };

    obj.deasync = require("deasync");

    return obj;

};


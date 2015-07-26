

/* ------------------------------------------------------------------------ */
/*
        compress code bundles
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
    var path = require("path");
    var fs = require("fs");


    /* -------------------------------------------------------------------- */
    /*
            private
    */
    /* -------------------------------------------------------------------- */


    var getCompressions = function(files){

        var compressions = [];

        for(var i = 0; i < files.length; i++){

            var tagsRE = /{%[ \t]*compress[^\}]*?%}[\s\S]*?{%[ \t]*endcompress[ \t]*%}/g;
            var data = fs.readFileSync(files[i], "utf8");
            var tags = data.match(tagsRE);

            if(tags){

                for(var j = 0; j < tags.length; j++){

                    var tagPartsRE = /{%[ \t]*compress[^\}][ \t]*['"]([\s\S]*?)['"][ \t]*?%}([\s\S]*?){%[ \t]*endcompress[ \t]*%}/g;
                    var includesRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
                    var tagParts = tagPartsRE.exec(tags[j]);
                    var includes = tagParts[2].match(includesRE) || [];

                    var compression = {
                        target : tagParts[1].toLowerCase(),
                        files : []
                    };

                    for(var k = 0; k < includes.length; k++){

                        var includeRE = /<(script|link).*?(href|src)=['"](.*?)['"].*?>/g;
                        var include = includeRE.exec(includes[k]);

                        compression.files.push(include[3]);

                    }

                    compressions.push(compression);

                }

            }

        }

        return compressions;

    };

    var getGroups = function(files){

        var css = [];
        var js = [];

        for(var i = 0; i < files.length; i++){

            var file = files[i];
            var ext = path.extname(file);

            if(ext === ".js"){

                if(!file.match(/[\.\-]min\.js$/g)){
                    js.push(file.replace(/(.*?).js$/g, "$1.min.js"));
                }else{
                    js.push(file);
                }

            }else if(ext === ".css"){

                if(!file.match(/[\.\-]min\.css$/g)){
                    css.push(file.replace(/(.*?).css$/g, "$1.min.css"));
                }else{
                    css.push(file);
                }

            }else if(ext === ".less"){

                css.push(file.replace(/(.*?).less$/g, "$1.min.css"));

            }

        }

        return {
            css : css,
            js : js
        };

    };

    var combine = function(root, type, output, files, debug){

        var source = "";

        output = path.join(root, output);

        if(!files.length){
            return;
        }

        grunt.log.ok("compress:{0}".format(output)["cyan"]);

        for(var i = 0; i < files.length; i++){

            files[i] = path.join(root, files[i]);

            console.log("   {0}".format(files[i]));

            if(!fs.existsSync(files[i])){
                grunt.fail.fatal("File not found {0}".format(files[i]));
            }

            var data = fs.readFileSync(files[i], "utf8");

            if(debug){

                if(type === "css"){
                    source += "/* {1} */\n{0}\n".format(data, files[i]);
                }else if(type === "js"){
                    source += "// {1}\n{0}\n".format(data, files[i]);
                }

            }else{
                source += data;
            }

        }

        fs.writeFileSync(output, source);

    };


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    var compress = function(paths, options){

        paths = paths || [];

        paths = paths.concat(utils.expand(settings.compile.less.paths || []));

        options = extend(settings.compile.less.options || {}, options || {});

        var comps = getCompressions(paths);

        for(var i = 0; i < comps.length; i++){

            var groups = getGroups(comps[i].files);

            combine(options.root, "css", "{0}.min.css".format(comps[i].target), groups.css, options.debug);
            combine(options.root, "js", "{0}.min.js".format(comps[i].target), groups.js, options.debug);

        }

    };

    return compress;

};
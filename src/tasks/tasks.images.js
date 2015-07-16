

/* ------------------------------------------------------------------------ */
/*
        image cutting and resizing automation
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


    this.cutResponsive = function(images, settings){

        var fs = require("fs");

        var compileMatches = function(files){

            var matches = {};

            for(var i = 0; i < files.length; i++){

                var base = files[i].replace(/(.*?)@\d*\.?\dx(.*).psd/i, "$1$2");
                var format = files[i].replace(/(.*?)@\d*\.?\dx.(.*).psd/i, "$2");

                format = format === "jpg" ? "jpeg" : format;

                matches[base] = matches[base] || {
                    files : [base],
                    base : base,
                    psd : files[i],
                    format : format
                };

                matches[base].files.push(files[i].replace(/(.*?).psd/i, "$1"));

            }

            for(var match in matches){

                var last = 0;
                var largest = null;

                for(var j = 0; j < matches[match].files.length; j++){

                    var resolution = Number(matches[match].files[j].replace(/.*?@(\d*\.?\d)x.*/i, "$1"));

                    if(resolution > last){

                        largest = matches[match].files[j];
                        last = resolution;

                    }

                }

                matches[match].largest = largest;

                utils.execSync("sips -s format " + matches[match].format + " " + matches[match].psd + " --out " + matches[match].largest);

                grunt.log.ok(["File " + matches[match].largest["cyan"] + " created"]);

            }

            return matches;

        };

        var cleanMatches = function(matches){

            for(var match in matches){

                for(var i = 0; i < matches[match].files.length ; i++){

                    var file = matches[match].files[i];

                    if(file !== matches[match].largest){

                        if(fs.existsSync(file)){
                            fs.unlinkSync(file);
                        }

                    }

                }

            }

        };

        var cutResponsiveImages = function(matches, cb){

            var cuts = settings.multiples;

            var resizeImage = function(match){

                var sizeOf = require("image-size");
                var size = sizeOf(match.largest);
                var resolution = Number(match.largest.replace(/.*?@(\d*\.?\d)x.*/i, "$1"));

                for(var i = 0; i < cuts.length; i++){

                    if(cuts[i] < resolution){

                        var width = Math.ceil(size.width * (cuts[i] / resolution));
                        var height = Math.ceil(size.height * (cuts[i] / resolution));
                        var path = match.largest.replace(/(.*?)@\d*\.?\dx(.*)/i, "$1@" + String(cuts[i]) + "x$2");

                        path = cuts[i] === 1 ? match.base : path;

                        utils.execSync("gm convert -size {0}x{1} {2} -resize {3}x{4} {5}".format(
                            size.width,
                            size.height,
                            match.largest,
                            width,
                            height,
                            path
                        ));

                        grunt.log.ok(["File " + path["cyan"] + " created"]);

                    }

                }

            };

            for(var match in matches){
                resizeImage(matches[match]);
            }

        };

        var matches = compileMatches(images);

        cleanMatches(matches);

        cutResponsiveImages(matches);

    };

    this.cutSizes = function(files, settings){

        var fs = require("fs");
        var path = require("path");
        var sizeOf = require("image-size");

        var unlinks = [];

        var cutPSDs = function(){

            for(var i = 0; i < files.length; i++){

                var config = grunt.file.readJSON(files[i]);
                var dir = path.dirname(files[i]);

                for(var image in grunt.file.readJSON(files[i])){

                    if(path.extname(image) === ".psd"){

                        var sip_path = path.join(dir, image);
                        var name = image.substring(0, image.length - path.extname(image).length) + ".png";

                        utils.execSync("sips -s format png " + sip_path + " --out " + path.join(dir, name));

                        unlinks.push(path.join(dir, name));

                    }

                }

            }

        };

        var cutSizes = function(){

            for(var j = 0; j < files.length; j++){

                var config = grunt.file.readJSON(files[j]);
                var dir = path.dirname(files[j]);

                grunt.file.mkdir(path.join(dir, "resized"));

                for(var image in config){

                    var name = image;

                    if(path.extname(image) === ".psd"){
                        name = image.substring(0, image.length - path.extname(image).length) + ".png";
                    }

                    var original = path.join(dir, name);
                    var extname = path.extname(original);
                    var basename = name.substring(0, name.length - extname.length);
                    var o_size = sizeOf(original);
                    var conf = config[image].length ? config[image] : config[image].sizes;

                    for(var k = 0; k < conf.length; k++){

                        var s = conf[k];
                        var width = typeof s === "number" ? s : s[0];
                        var height = typeof s === "number" ? s : s[1];
                        var output = path.join(dir, "resized", "{0}.{1}x{2}{3}".format(basename, width, height, extname));

                        utils.execSync("gm convert -size {0}x{1} {2} -resize {3}x{4} {5}".format(
                            o_size.width,
                            o_size.height,
                            original,
                            width,
                            height,
                            output
                        ));

                        grunt.log.ok(["File " + output["cyan"] + " created"]);

                    }

                }

            }

        };

        cutPSDs();
        cutSizes();

        for(var l = 0; l < unlinks.length; l++){
            fs.unlinkSync(unlinks[l]);
        }

    };

    return this;

};
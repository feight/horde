

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

    var settings = grunt.file.readJSON(require("path").resolve("horde/settings.json"));

    var extend = require("node.extend");


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.cutResponsive = function(images, options){

        var fs = require("fs");

        options = extend(settings.images.responsive.options || {}, options || {});

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

            var cuts = options.multiples;

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

        grunt.log.ok("{0} : {1} found".format(
            "image responsives"["cyan"],
            "{0} files"["green"].format(images.length)
        ));

        var matches = compileMatches(images);

        cleanMatches(matches);

        cutResponsiveImages(matches);

    };

    this.cutSizes = function(files, complete){

        var humanize = require("humanize");
        var path = require("path");
        var PSD = require("psd");
        var fs = require("fs");
        var gm = require("gm");

        var self = this;
        var cache = {};

        var cutTargets = function(callback){

            var targets = [];

            for(var i = 0; i < files.length; i++){

                var dir = path.dirname(files[i]);
                var targetDir = path.join(dir, "resized/target");
                var json = grunt.file.readJSON(files[i]);

                cache[files[i]] = json;

                for(var image in cache[files[i]]){

                    var target = {
                        png : path.join(targetDir, image),
                        dst : path.join(targetDir, image),
                        src : path.join(dir, image)
                    };

                    if(path.extname(image) === ".psd"){

                        target.png = path.join(targetDir, image.substring(0, image.length - path.extname(image).length) + ".png");
                        target.psd = path.join(dir, image);

                    }

                    targets.push(target);

                }

            }

            var processTargetCuts = function(cuts, index){

                index = index || 0;

                if(cuts[index]){

                    var next = function(){

                        var stat = fs.statSync(cuts[index].png);

                        if(grunt.option("verbose")){

                            grunt.log.ok("Temp {0} created: {1}".format(
                                cuts[index].png["cyan"],
                                humanize.filesize(stat["size"])["green"]
                            ));

                        }

                        if(cuts[index + 1]){
                            processTargetCuts(cuts, index + 1);
                        }else{
                            callback();
                        }

                    };

                    if(
                        fs.existsSync(cuts[index].src) &&
                        fs.existsSync(cuts[index].dst) &&
                        utils.getHash(cuts[index].src) === utils.getHash(cuts[index].dst)
                    ){
                        return next();
                    }

                    grunt.file.copy(cuts[index].src, cuts[index].dst);

                    if(cuts[index].psd){

                        grunt.file.mkdir(path.dirname(cuts[index].png));

                        PSD.open(cuts[index].psd).then(function(psd){

                            return psd.image.saveAsPng(cuts[index].png);

                        }).then(next);

                    }else{

                        next();

                    }

                }

            };

            processTargetCuts(targets);

        };

        var cutSizes = function(callback){

            var sizes = [];

            for(var i = 0; i < files.length; i++){

                var config = cache[files[i]] || grunt.file.readJSON(files[i]);
                var dir = path.dirname(files[i]);

                for(var image in config){

                    var png = image;

                    if(path.extname(image) === ".psd"){
                        png = image.substring(0, image.length - path.extname(image).length) + ".png";
                    }

                    var previous = path.join(dir, "resized/original", image);
                    var original = path.join(dir, image);
                    var input = path.join(dir, "resized/target", png);
                    var extname = path.extname(input);
                    var basename = png.substring(0, png.length - extname.length);
                    var conf = config[image].length ? config[image] : config[image].sizes;

                    for(var j = 0; j < conf.length; j++){

                        var s = conf[j];
                        var width = typeof s === "number" ? s : s[0];
                        var height = typeof s === "number" ? s : s[1];
                        var output = path.join(dir, "resized", "{0}.{1}x{2}{3}".format(basename, width, height, extname));

                        if(
                            !fs.existsSync(output) ||
                            !fs.existsSync(previous) ||
                            utils.getHash(previous) !== utils.getHash(original)
                        ){

                            sizes.push({
                                input : {
                                    path : input
                                },
                                output : {
                                    path : output,
                                    width : width,
                                    height : height
                                }
                            });

                        }

                    }

                    grunt.file.copy(original, previous);

                }

            }

            var processResizes = function(resizes, index){

                index = index || 0;

                if(resizes[index]){

                    var next = function(){

                        var stat = fs.statSync(resizes[index].output.path);

                        grunt.log.ok("File {0} cut: {1}".format(
                            resizes[index].output.path["cyan"],
                            humanize.filesize(stat["size"])["green"]
                        ));

                        self.compress(resizes[index].output.path, function(){

                            if(sizes[index + 1]){
                                processResizes(resizes, index + 1);
                            }else{
                                callback();
                            }

                        });

                    };

                    gm(resizes[index].input.path).thumb(
                        resizes[index].output.width,
                        resizes[index].output.height,
                        resizes[index].output.path,
                        100,
                        next
                    );

                }

            };

            processResizes(sizes);

        };

        grunt.log.ok("{0} : {1} found".format(
            "image sizes"["cyan"],
            "{0} files"["green"].format(files.length)
        ));

        cutTargets(function(){

            cutSizes(complete);

        });

    };

    this.compress = function(files, callback){

        var Imagemin = require("imagemin");
        var humanize = require("humanize");
        var glob = require("glob");
        var path = require("path");
        var fs = require("fs");

        if(typeof files === "string"){
            files = [files];
        }

        var processCompressions = function(files, index){

            index = index || 0;

            if(files[index]){

                var stat1 = fs.statSync(files[index]);

                var next = function(){

                    var stat2 = fs.statSync(files[index]);

                    grunt.log.ok("File {0} compressed: {1} → {2}".format(
                        files[index]["cyan"],
                        humanize.filesize(stat1["size"])["green"],
                        humanize.filesize(stat2["size"])["green"]
                    ));

                    if(files[index + 1]){
                        processCompressions(files, index + 1);
                    }else{
                        callback();
                    }

                };

                var use = null;

                switch(path.extname(files[index]).toLowerCase()){

                    case ".jpeg" :
                    case ".jpg" :{

                        var jpegRecompress = require("imagemin-jpeg-recompress");

                        use = jpegRecompress({
                            loops : 3,
                            accurate : true,
                            method : "ms-ssim"
                        });

                        break;

                    }

                    case ".png" :{

                        use = Imagemin.optipng({ optimizationLevel : 7 });

                        break;

                    }

                    case ".gif" :{

                        use = Imagemin.gifsicle({ interlaced : true });

                        break;

                    }

                }

                if(use){

                    var imagemin = new Imagemin().src(files[index]).dest(path.dirname(files[index])).use(use);

                    imagemin.run(function(err, minifications){

                        if(err){
                            grunt.fail.fatal(err);
                        }

                        next();

                    });

                }else{

                    next();

                }

            }

        };

        processCompressions(files);

    };

    return this;

};
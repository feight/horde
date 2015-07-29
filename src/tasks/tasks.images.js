

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


    this.cutResponsive = function(images, options, complete){

        var humanize = require("humanize");
        var sizeOf = require("image-size");
        var path = require("path");
        var PSD = require("psd");
        var fs = require("fs");
        var gm = require("gm");

        var self = this;

        options = extend(settings.images.responsive.options || {}, options || {});

        var compileMatches = function(files, callback){

            var targets = [];

            var sizesFilter = function(value){
                return value <= this;
            };

            for(var i = 0; i < files.length; i++){

                var re = /(.*?)@(\d)x.(.*).psd/i;
                var format = files[i].replace(re, "$3");
                var size = Number(files[i].replace(re, "$2"));
                var sizes = options.multiples.filter(sizesFilter, size);

                format = format === "jpg" ? "jpeg" : format;

                targets.push({
                    target : files[i],
                    format : format,
                    size : size,
                    sizes : sizes
                });

            }

            var processMatches = function(matches, index){

                index = index || 0;

                if(matches[index]){

                    var next = function(){

                        if(matches[index + 1]){
                            processMatches(matches, index + 1);
                        }else{
                            callback(matches);
                        }

                    };

                    var target = matches[index].target;
                    var dir = path.dirname(target);
                    var name = path.basename(target);
                    var previous = path.join(dir, "resized/.info", name);
                    var dest = path.join(dir, "resized/.info/", name.replace(/.psd$/, ""));

                    if(
                        fs.existsSync(previous) &&
                        utils.getHash(previous) === utils.getHash(target)
                    ){
                        return next();
                    }

                    grunt.file.mkdir(path.dirname(dest));

                    PSD.open(target).then(function(psd){

                        return psd.image.saveAsPng(dest);

                    }).then(function(){

                        grunt.file.copy(target, previous);

                        next();

                    });

                }

            };

            processMatches(targets);

        };

        var cutResponsiveImages = function(matches, callback){

            var imageCuts = [];

            for(var i = 0; i < matches.length; i++){

                var target = matches[i].target;
                var name = path.basename(target);
                var size = matches[i].size;
                var dir = path.dirname(target);
                var sizes = matches[i].sizes;
                var input = path.join(dir, "resized/.info/", name.replace(/.psd$/, ""));
                var previous = path.join(dir, "resized/.info/previous/", name.replace(/.psd$/, ""));
                var inputSize = sizeOf(input);

                for(var j = 0; j < sizes.length; j++){

                    var dest = input.replace("/.info/", "/").replace(/(.*?)@\d*\.?\dx(.*)/i, "$1@" + String(sizes[j]) + "x$2");
                    var base = input.replace("/.info/", "/").replace(/(.*?)@\d*\.?\dx(.*)/i, "$1$2");

                    dest = sizes[j] === 1 ? base : dest;

                    if(
                        !fs.existsSync(dest) ||
                        !fs.existsSync(previous) ||
                        utils.getHash(input) !== utils.getHash(previous)
                    ){

                        imageCuts.push({
                            previous : {
                                path : previous
                            },
                            output : {
                                path : dest,
                                width : Math.ceil(inputSize.width * (sizes[j] / size)),
                                height : Math.ceil(inputSize.height * (sizes[j] / size))
                            },
                            input : {
                                path : input
                            }
                        });

                    }

                }

            }

            var cutImages = function(cuts, index){

                index = index || 0;

                if(cuts[index]){

                    var next = function(){

                        var stat = fs.statSync(cuts[index].output.path);

                        grunt.log.ok("File {0} cut: {1}".format(
                            cuts[index].output.path["cyan"],
                            humanize.filesize(stat["size"])["green"]
                        ));

                        self.compress(cuts[index].output.path, function(){

                            if(cuts[index + 1]){

                                cutImages(cuts, index + 1);

                            }else{

                                grunt.file.copy(cuts[index].input.path, cuts[index].previous.path);

                                callback();

                            }

                        });

                    };

                    gm(cuts[index].input.path).thumb(
                        cuts[index].output.width,
                        cuts[index].output.height,
                        cuts[index].output.path,
                        100,
                        next
                    );

                }

            };

            if(!imageCuts.length){
                return callback();
            }

            cutImages(imageCuts);

        };

        grunt.log.ok("{0} : {1} found".format(
            "image responsives"["cyan"],
            "{0} files"["green"].format(images.length)
        ));

        compileMatches(images, function(matches){

            cutResponsiveImages(matches, complete);

        });

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
                var targetDir = path.join(dir, "resized/.info/target");
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

                    var previous = path.join(dir, "resized/.info/original", image);
                    var original = path.join(dir, image);
                    var input = path.join(dir, "resized/.info/target", png);
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

            if(!sizes.length){
                return callback();
            }

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

                        use = Imagemin.optipng({ optimizationLevel : 3 });

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
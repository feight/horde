

/* ------------------------------------------------------------------------ */
/*
        copies build resources
*/
/* ------------------------------------------------------------------------ */


module.exports = function(grunt){


    /* -------------------------------------------------------------------- */
    /*
            requires
    */
    /* -------------------------------------------------------------------- */


    var utils = require(require("path").resolve("grunt/src/utils/utils.js"))(grunt);

    var path = require("path");


    /* -------------------------------------------------------------------- */
    /*
            private
    */
    /* -------------------------------------------------------------------- */


    var run = function(id, site, func){

        var config = utils.getSiteBuildConfig(site);
        var log = "{0} : {1} {2}";
        var tag = ("copy:" + id)["cyan"];
        var name = config.name["green"];

        grunt.log.ok(log.format(tag, name, ""));

        func();

        console.log("");

    };


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    // creates the build/base/{site} directory which is
    // the combination of the base application, the site
    // and it's extension, if one exists.

    this.base = function(site){

        run("base", site, function(){

            var base = path.join("src/base", "/");
            var dest = path.join("build/base", site, "/");
            var source = path.join("src/sites", site, "/");
            var config = utils.getSiteBuildConfig(site);

            grunt.file.mkdir(dest);

            utils.execSync("rsync -avz --ignore-times --checksum {0} {1}".format(base, dest)); // copy in the base

            if(config.extends){

                var extension = path.join("src/sites", config.extends, "/");

                utils.execSync("ditto {0} {1}".format(extension, dest)); // copy in the extension

            }

            utils.execSync("ditto {0} {1}".format(source, dest)); // copy in the site

        });

    };

    this.templates = function(site, files){

        run("templates", site, function(){

            var base = path.join("build/base", site, "/");
            var dest = path.join("build/target", site, "templates/");

            for(var i = 0; i < files.length; i++){

                var cut = path.join(dest, files[i].replace(base, ""));

                grunt.file.mkdir(path.dirname(cut));

                utils.execSync("cp -v {0} {1}".format(files[i], cut));

            }

        });

    };

    this.assets = function(site, files){

        run("assets", site, function(){

            var base = path.join("build/base", site, "/");
            var dest = path.join("build/target", site, "static/");

            for(var i = 0; i < files.length; i++){

                var cut = path.join(dest, files[i].replace(base, ""));

                grunt.file.mkdir(path.dirname(cut));

                utils.execSync("cp -v {0} {1}".format(files[i], cut));

            }

        });

    };

    this.deploy = function(site){

        run("deploy", site, function(){

            var base = path.join("build/target", site, "/");
            var dest = path.join("build/deploy", site, "/");

            grunt.file.mkdir(dest);

            utils.execSync("rsync -avz --ignore-times --checksum {0} {1}".format(base, dest));

        });

    };

    return this;

};
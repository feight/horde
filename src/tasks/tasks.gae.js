

/* ------------------------------------------------------------------------ */
/*
        Google App Engine tasks
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
            private
    */
    /* -------------------------------------------------------------------- */


    var cleanCert = function(){

        // remove this random cert file that sometimes causes trouble.
        utils.execSync("rm -rf /Applications/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine/lib/cacerts/cacerts.txt");

    };

    var interval = null;


    /* -------------------------------------------------------------------- */
    /*
            public
    */
    /* -------------------------------------------------------------------- */


    this.start = function(args){

        var extend = require("node.extend");
        var async = require("async");

        args = extend({
            host : "localhost",
            path : "",
            port : 8000,
            open : true
        }, args);

        if(!args.adminPort){
            args.adminPort = args.port + 1;
        }

        var exec = require("child_process").execSync;

        // get the pids of any currently running gae local server
        var localPorts = exec("lsof -P | grep {0} | awk '{print $2}'".format(args.port)).toString();
        var adminPorts = exec("lsof -P | grep {0} | awk '{print $2}'".format(args.adminPort)).toString();

        var ports = [].concat(localPorts.split("\n"), adminPorts.split("\n"));

        ports = ports.filter(function(n){
            return n !== "";
        });

        ports = ports.filter(function(n, pos){
            return ports.indexOf(n) === pos;
        });

        // kill them all
        if(ports.length){
            utils.execSync("kill -9 {0}".format(ports.join(" ")));
        }

        cleanCert();

        // run the server
        utils.execSync([
            "dev_appserver.py",
            "--port={0}".format(args.port),
            "--admin_port={0}".format(args.adminPort),
            "--enable_sendmail=yes",
            args.path
        ].join(" "));

    };

    this.update = function(args){

        cleanCert();

        // deploy the application
        utils.execSync([
            "appcfg.py",
            "update",
            args.path
        ].join(" "));

    };

    return this;

};
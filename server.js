var express    = require("express");
var mysql      = require("mysql");
var bodyParser = require("body-parser");
var md5        = require('md5');
var rest       = require("./REST.js");

var app = express();

function REST() {
    var self = this;
    self.connectMysql();
}

REST.prototype.connectMysql = function () {
    var self = this;
    var pool = mysql.createPool({
        connectionLimit: 100,
        host           : 'localhost',
        user           : 'root',
        password       : '',
        database       : 'restful_api_demo',
        debug          : false
    });

    pool.getConnection(function (error, connection) {
        if (error) {
            self.stop(error);
        } else {
            self.configureExpress(connection);
        }
    });
};

REST.prototype.configureExpress = function (connection) {
    var self        = this;
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    var router      = express.Router();
    app.use('/api', router);
    var rest_router = new rest(router, connection, md5);
    self.startServer();
};

REST.prototype.startServer = function () {
    app.listen(3000, function () {
        console.log("All right ! I am alive at Port 3000.");
    });
};

REST.prototype.stop = function (error) {
    console.log("ISSUE WITH MYSQL \n" + error);
    process.exit(1);
};

new REST();
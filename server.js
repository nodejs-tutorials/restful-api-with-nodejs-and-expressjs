var express      = require("express");
var mysql        = require("mysql");
var bodyParser   = require("body-parser");
var path         = require("path");
var md5          = require('md5');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var compression  = require('compression');

var rest  = require("./routes/rest.js");
var index = require("./routes/index.js");

var app = express();

function SERVER() {
    var self = this;
    self.connectMysql();
}

SERVER.prototype.connectMysql = function () {
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

SERVER.prototype.configureExpress = function (connection) {
    var self = this;

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(compression());
    app.use(logger('dev'));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    var router = express.Router();
    app.use('/api', router);

    app.use('/', index);

    var rest_router = new rest(router, connection, md5);
    self.startServer();
};

SERVER.prototype.startServer = function () {
    app.listen(3000, function () {
        console.log("All right ! I am alive at Port 3000.");
    });
};

SERVER.prototype.stop = function (error) {
    console.log("ISSUE WITH MYSQL \n" + error);
    process.exit(1);
};

new SERVER();
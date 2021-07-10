'use strict';

var path = require('path');
var MExNServer = require("@ttcorestudio/mexn-server");
var router = MExNServer.modules.express.Router();

/**
 * Adds routes to express application
 */
module.exports = function (app) {
    var routerOptions = {};

    // Use default routes for authentication/login
    MExNServer.server.routers.attachDefault(router, routerOptions);

    router.use('/ping', (req, res) => {
        return res.end();
    });

    // API subrouter
    router.use('/api', require('./api/_api'));

    // Send to index.html otherwise
    router.get('/*', function (req, res) {
        // on localhost redirect to webpack dev server
        if (req.hostname === 'localhost') {
            res.redirect(`http://localhost:${process.env.VUE_PORT}${req.path}`);
        } else {
            var publicPath = path.join(__dirname, "../../../build");
            res.sendFile(path.join(publicPath, 'index.html'));
        }
    });

    // Use default 404s
    MExNServer.server.routers.attachLast(router);

    app.use("/", router);

};

'use strict';

require('rootpath')();
var path = require('path');
const server = require('server/server');


var options = {
  rootPath: path.join(__dirname, "../"),
  staticPaths: [
    'build',
  ],
  routesPath: "server/app/routes/_routes",
  modelsPath: 'server/db/models/_models'
};


// console.log(server);

server.create(options).then(function (instance) {

  // Now we have the following:
  // instance.server
  // instance.app
  // instance.io
  //requestLog.io = instance.io;

});

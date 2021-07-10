'use strict';

const mockery = require('mockery');

if (process.env.LOCAL_MEXN_PATH) {
  mockery.registerSubstitute('@ttcorestudio/mexn-server', process.env.LOCAL_MEXN_PATH);
  mockery.enable({
    warnOnUnregistered: false,
    warnOnReplace: false,
  });
  console.log(`Using local package reference at '${process.env.LOCAL_MEXN_PATH}' for '@ttcorestudio/mexn-server'`);
}

require('rootpath')();

var MExNServer = require("@ttcorestudio/mexn-server");

module.exports = MExNServer.server;
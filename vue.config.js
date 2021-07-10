require("rootpath")();
const path = require("path");
const configureAPI = require("server/configure");

module.exports = {
  outputDir: path.resolve(__dirname, "./build"),
  devServer: {
    port: process.env.VUE_PORT,
    progress: false,
    quiet: true,
    before: configureAPI.before,
    proxy: {
      "/docs": {
        target: `http://localhost:${process.env.SERVER_PORT}/`,
        logLevel: "debug"
      },
      "/session": {
        target: `http://localhost:${process.env.SERVER_PORT}/`,
        logLevel: "debug"
      },
      "/users": {
        target: `http://localhost:${process.env.SERVER_PORT}/`,
        logLevel: "debug"
      },
      "/analytic": {
        target: `http://localhost:${process.env.SERVER_PORT}/`,
        logLevel: "debug"
      },
      "/api": {
        target: `http://localhost:${process.env.SERVER_PORT}/`,
        logLevel: "debug"
      }
    }
  },
  lintOnSave: false,
  runtimeCompiler: true,
  transpileDependencies: ["vuetify"]
};

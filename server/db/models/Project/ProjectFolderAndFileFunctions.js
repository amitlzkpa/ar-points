var MExNServer = require("@ttcorestudio/mexn-server");
var Promise = MExNServer.modules.bluebird;
var Folder = require("server/db/models/Folder/_Folder");
var File = require("server/db/models/File/_File");

module.exports = function (projectSchema) {

    /**
     * Find one folder assoicated with project
     *
     * @function getFolder
     * @memberof Project
     * @instance
     *
     * @param  {string}   folderId - mongo id of the folder we're looking for
     * @return {Promise}           - returns folder when resolved
     * @example

     project.getFolder(id).then(function(folder){
         // do something
     }).catch(function(err){
         // handle error
     });
     */
    projectSchema.methods.getFolder = function (folderId) {
        var project = this;

        return new Promise(function (resolve, reject) {
            Folder.findOne({
                _id: folderId,
                project: project._id
            }, function (err, folder) {
                if (err) return reject(err);
                return resolve(folder);
            });
        });
    };

    /**
     * Find all files assoicated with a project
     *
     * @function getFiles
     * @memberof Project
     * @instance
     *
     * @return {Promise}     - returns files when resolved
     * @example

     project.getFiles.then(function(files){
         // do something
     }).catch(function(err){
         // handle error
     });
     */

    projectSchema.methods.getFiles = function () {
        var project = this;

        return new Promise(function (resolve, reject) {
            File.find({
                project: project._id
            }, function (err, files) {
                if (err) return reject(err);
                return resolve(files);
            });
        });
    };

};

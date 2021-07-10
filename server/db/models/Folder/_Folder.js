var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;

/**
 * Folder schema
 *
 * @param {object} properties - Incoming properties to create a folder with
 *
 * @property {String} name - Name of folder
 * @property {Date} dateCreated - Date folder was created
 * @property {Date} dateModified - Date folder was last modified
 * @property {String} path - Human-readable path of the folder, which includes parent folder names and slashes
 * @property {ObjectId} project - Project a folder is related to
 * @property {ObjectId} parentFolder - Parent folder for the current folder
 *
 * @constructor Folder
 * @requires module:server/db/models/Folder/_Folder
 *
 * @example

 var Folder = require("server/db/models/Folder/_Folder");

 // You can also use:
 // var Folder = mongoose.model("Folder")
 // if you are inside of a route. However, this will not work in any part of
 // code that is read during the server creation process.

 // Create a new user with an ssoId available
 var folder = new Folder({
     name: "Blah"
     project: projectId
     parentFolder: parentFolderId
 });

 folder.save(function (err, savedFolder) {
     if (!err && savedFolder) {
         // user successfully saved to database
     }
 });

 */
 /**
 * @swagger
 *  components:
 *    schemas:
 *      Folder:
 *        type: object
 *        properties:
 *          name:
 *            type: String
 *            description: Name of folder
 *          dateCreated:
 *            type: Date
 *            description: Date folder was created
 *          dateModified:
 *            type: Date
 *            description: Date folder was last modified
 *          path:
 *            type: String
 *            description: Human-readable path of the folder, which includes parent folder names and slashes
 *          project:
 *            type: Project
 *            $ref: '#/components/schemas/Project'
 *            description: Parent Project
 *          parentFolder:
 *            type: Folder
 *            $ref: '#/components/schemas/Folder'
 *            description: Parent Folder
 *          
 */
var folderSchema = new mongoose.Schema({
	name: String,
	dateCreated: Date,
	dateModified: Date,
	path: {
		type: String
	},
	project: {
		type: mongoose.Schema.ObjectId,
		ref: "Project"
	},
	parentFolder: {
		type: mongoose.Schema.ObjectId,
		ref: "Folder"
	}
},{
	usePushEach: true
});

/**
 * Finds direct child folders
 *
 * @return Promise
 *
 * @function findChildFolders
 * @memberof Folder
 * @instance
 *
 * @example

 folder.findChildFolders().then(function(folders){
     // do something
 }).catch(function(err){
     // handle error
 });

 */
folderSchema.methods.findChildFolders = function() {
	var folder = this;
	var Folder = this.constructor;

	return new Promise(function(resolve, reject) {
		Folder.find({
			project: folder.project,
			parentFolder: folder._id
		}, function(err, folders) {
			if (err) return reject(err);
			return resolve(folders);
		});
	});
};

/**
 * Finds direct child files
 *
 * @return Promise
 *
 * @function findChildFiles
 * @memberof Folder
 * @instance
 *
 * @example

 folder.findChildFiles().then(function(files){
     // do something
 }).catch(function(err){
     // handle error
 });

 */
folderSchema.methods.findChildFiles = function() {
	var folder = this;
	var File = mongoose.model("File");

	return new Promise(function(resolve, reject) {
		File.find({
			project: folder.project,
			folder: folder._id
		}, function(err, files) {
			if (err) return reject(err);
			return resolve(files);
		});
	});
};

folderSchema.methods.getNestedFindRequirements = function() {
	var folder = this;
	var regexp = new RegExp("^" + folder.path + "/");
	return {
		path: regexp,
		project: folder.project
	};
};

/**
 * Finds all child files in tree, using the path name
 *
 * @return Promise
 *
 * @function findNestedChildFolders
 * @memberof Folder
 * @instance
 *
 * @example

 folder.findNestedChildFolders().then(function(folders){
     // do something
 }).catch(function(err){
     // handle error
 });

 */
folderSchema.methods.findNestedChildFolders = function() {
	var folder = this;
	var Folder = this.constructor;

	return new Promise(function(resolve, reject) {
		Folder.find(folder.getNestedFindRequirements(), function(err, folders) {
			if (err) return reject(err);
			else resolve(folders);
		});
	});

};

/**
 * Finds parents of the current folder. They are in "reverse" order, IE they start
 * with the immediate parent of the current folder and work their way up the tree.
 *
 * @return Promise
 *
 * @function findParents
 * @memberof Folder
 * @instance
 *
 * @example

 folder.findParents().then(function(folders){
     // do something
 }).catch(function(err){
     // handle error
 });

 */
folderSchema.methods.findParents = function() {
	var folder = this;
	var Folder = this.constructor;

	return new Promise(function(resolve, reject) {
		Folder.find({
			project: folder.project
		}, function(err, folders) {
			if (err || !folders) return reject(err);

			var folderMap = {};
			folders.forEach(function(curFolder) {
				if (curFolder && curFolder._id) folderMap[curFolder._id] = curFolder;
			});

			var parents = [];
			var curFolder = folder;
			while (curFolder && curFolder.parentFolder) {
				curFolder = curFolder === folderMap[curFolder.parentFolder] ? null : folderMap[curFolder.parentFolder];
				parents.push(curFolder);
			}
			return resolve(parents);
		});
	});
};

/**
 * Deletes all items below this folder in the tree: both folders and files
 *
 * @return Promise
 *
 * @function deleteAllChildren
 * @memberof Folder
 * @instance
 *
 * @example

 folder.deleteAllChildren().then(function(true){
     // true value indicates successful deletion
 }).catch(function(err){
     // handle error
 });

 */
folderSchema.methods.deleteAllChildren = function() {
	var folder = this;
	var Folder = this.constructor;
	var File = mongoose.model("File");

	return new Promise(function(resolve, reject) {

		var foldersToDelete = [folder._id];

		folder.findNestedChildFolders().then(function(children) {

			if (!children.length) {
				return removeFiles(foldersToDelete, deletedFiles);
			}

			var childFolderIds = children.map(function(child) {
				return child._id;
			});

			Folder.deleteMany({
				project: folder.project,
				_id: {
					$in: childFolderIds
				}
			}, function(err) {
				if (err) return reject(err);
				return removeFiles(foldersToDelete.concat(childFolderIds), deletedFiles);
			});

			function deletedFiles(err) {
				if (err) return reject(err);
				else return resolve(true);
			}
		}).catch(function(err) {
			return reject(err);
		});

		function removeFiles(folderIds, cb) {
			// do a find and then explicit deleteByIds so that they get removed from S3 bucket too
			File.deleteBySearch({
				project: folder.project,
				folder: {
					$in: folderIds
				}
			}).then(function() {
				if(cb) cb();
				return resolve(true);
			});
		}


	});

};

/**
 * Pre-save hook: calculates the folder path and all child folder paths.
 *
 * @function save
 * @memberof Folder
 * @instance
 *
 * @param {function} callback
 *
 * @example

folder.save(function(err,savedFolder){
    // all folder paths should be updated
});

 */
folderSchema.pre("save", function(next) {
	var folder = this;
	folder.findParents().then(function(parents) {
		if (parents) {
			folder.path = parents.map(function(parent) {
				return parent.name;
			}).reverse().join("/") + "/" + folder.name;
		}
		folder.findChildFolders().then(function(children) {
			if (children && children.length) {
				children.forEach(function(child) {
					child.save();
				});
			}
			next();
		});
	});
});

/**
 * @module server/db/models/Folder/_Folder
 * @see Folder
 *
 * @description Module that exports the Mongoose "Folder" model.
 */
module.exports = mongoose.model('Folder', folderSchema);

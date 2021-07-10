var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;

/**
 * File object schema
 *
 * @param {object} properties - Incoming properties to create a file with
 *
 * @property {string} name - Name of the file
 * @property {string} type - Type of the file
 * @property {number} size - File size
 * @property {user} uploadedBy - User that uploaded the file
 * @property {project} project - Project that file was uploaded to
 * @property {folder} folder - Folder that file was uploaded to. Default should be root folder
 * @property {date} dateUploaded - Date that file was uploaded
 * @property {date} dateModified - Date that the file was modified
 * @property {boolean} allowAnonymousAccess - Whether anonymous access is allowed. Default is false
 * @property {string} s3Key - Whether user is an admin
 *
 * @constructor File
 * @requires module:server/db/models/File/_File
 *
 * @example

 var File = require("server/db/models/File/_File");

 // You can also use:
 // var User = mongoose.model("File")
 // if you are inside of a route. However, this will not work in any part of
 // code that is read during the server creation process.

 // Create a temporary file
 var file = new File({
     name: 'fileName',
     type: 'fileType',
     size: 10,
     uploadedBy: ssoUser._id
     project: project._id,
     folder: folder._id,

 });

 file.save(function (err, savedFile) {
     if (!err && savedFile) {
         // file successfully saved to mongo database
     }
 });

 */

  /**
 * @swagger
 *  components:
 *    schemas:
 *      File:
 *        type: object
 *        properties:
 *          name:
 *            type: String
 *            description: Name of file
 *          type:
 *            type: String
 *            description: Type of file
 *          size:
 *            type: Number
 *            description: Size of file
 *          ext:
 *            type: String
 *            description: Extention of file
 *          uploadedBy:
 *            type: User
 *            $ref: '#/components/schemas/User'
 *            description: User that uploaded the file
 *          project:
 *            type: Project
 *            $ref: '#/components/schemas/Project'
 *            description: Project that file was uploaded to
 *          folder:
 *            type: Folder
 *            $ref: '#/components/schemas/Folder'
 *            description: Folder that file was uploaded to. Default should be root folder
 *          dateUploaded:
 *            type: Date
 *            description: Date that file was uploaded
 *          dateModified:
 *            type: Date
 *            description: Date that the file was modified
 *          allowAnonymousAccess:
 *            type: Boolean
 *            description: Whether anonymous access is allowed. Default is false
 *            default: false
 *          s3Key:
 *            type: String
 *            description: has to be unique, s3Key to get file data.
 * 				
 * 
 *          
 */
var fileSchema = new mongoose.Schema({
	name: String,
	type: String,
	size: Number,
	ext: String,
	uploadedBy: {
		type: mongoose.Schema.ObjectId,
		ref: "User"
	},
	project: {
		type: mongoose.Schema.ObjectId,
		ref: "Project"
	},
	folder: {
		type: mongoose.Schema.ObjectId,
		ref: "Folder"
	},
	dateUploaded: Date,
	dateModified: Date,
	allowAnonymousAccess: {
		type: Boolean,
		default: false
	},
	s3Key: {
		type: String,
		unique: true
	},
	sizes: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	}
},{
	usePushEach: true
});

// attach S3 default functionality to File model
MExNServer.server.db.attachFileFunctions(fileSchema);
MExNServer.server.db.attachBackupFunctions(fileSchema,'File');

require("./FileThumbnailFunctions")(fileSchema);

/**
 * Pre-save hook: TODO TODO
 *
 * @function save
 * @memberof File
 * @instance
 *
 * @param {function} callback
 *
 * @example

file.save(function(err,savedFile){
    // TODO TODO
});

 */
fileSchema.pre('save', function(next) {
	var file = this;
	if (file.isNew) file.dateUploaded = Date.now();
	next();
});

/**
 * Gets a signed URL from S3 to display or use file. It is an instance
 * method.
 * @function getSignedUrl
 * @param  {Function} callback callback to use
 * @memberof File
 * @instance
 */
fileSchema.methods.getSignedUrl = function(callback) {
	var file = this;
	if (!file.allowAnonymousAccess) {
		file.constructor.getSignedUrl("getObject", file.s3Key).then(function(response) {
			callback(null, response);
		}).catch(function(err) {
			callback(err, null);
		});
	} else {
		callback("No anonymous access allowed", null);
	}
	// can't figure out why this doesn't work with promises!!!

	/*
	return new Promise(function (resolve, reject) {
	    console.log("what?");
	    if (file.allowAnonymousAccess) {
	        file.constructor.getSignedUrl("getObject", file.s3Key).then(function (response) {
	            console.log(response);
	            resolve(response);
	        }).catch(function (err) {
	            console.log(err);
	            reject(err);
	        });
	    } else {
	        reject("No anonymous access allowed");
	    }
	});*/

};

/**
 * @module server/db/models/File/_File
 * @see File
 *
 * @description Module that exports the Mongoose "File" model.
 */
module.exports = mongoose.model('File', fileSchema);

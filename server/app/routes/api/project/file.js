'use strict';

var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;
var File = mongoose.model("File");
var router = MExNServer.modules.express.Router();

module.exports = router;

 /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/file/views?s3Key=:s3KeyValue:
 *    get:
 *      summary: View a file from a project with its s3 key
 *      tags: [File]
 *      responses:
 *        "200":
 *          description: igned_request - Redirects to signed URL
 *          content:
 *            application/json:
 *              schema:
 *                type: String
 *                description: signed_request - Redirects to signed URL
 *        "404": 
 *          description: File not found
 */
router.get("/view", function(req, res) {
	File.findOne({
		project: req.project._id,
		s3Key: req.query.key
	}, function(err, file) {
		if (err || !file) return res.status("404").send("File not found.");
		return returnSignedUrl( req.query.size ? file.getSizeKey(req.query.size) : file.s3Key);
	});

	function returnSignedUrl(key){
		File.getSignedUrl("getObject", key).then(function(response) {
			return res.redirect(response.signed_request);
		});
	}
});

 /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/file/create-temp:
 *    post:
 *      summary: Create a temporary file including the user who uploaded the file.
 *      tags: [File]
 *      parameters:
 *        - in: body
 *          name: name
 *          description: File Name
 *          schema:
 *          type: String
 *        - in: body
 *          name: folderId
 *          description: folder - ID of the folder the file belongs to
 *          schema:
 *          type: String
 *      responses:
 *        "200":
 *          description: igned_request - Redirects to signed URL
 *          content:
 *            application/json:
 *              schema:
 *                type: File
 *                $ref: '#/components/schemas/File'
 *                description: file - Temporary file object
 *        "404": 
 *          description: File not found
 */
router.post("/create-temp", function(req, res) {
	var file = new File(req.body);
	file.uploadedBy = req.user._id;
	if (file) return res.json(file);
	else return res.status("500").send("Could not create a temp file");
});

 /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/file/save:
 *    post:
 *      summary: Save a file by finding by the name, then creating and saving a new file with that name.
 *      tags: [File]
 *      parameters:
 *        - in: body
 *          name: name
 *          description: File Name
 *          schema:
 *          type: String
 *        - in: body
 *          name: folderId
 *          description: folder - ID of the folder the file belongs to
 *          schema:
 *          type: String
 *      responses:
 *        "200":
 *          description: newFile - New saved file.
 *          content:
 *            application/json:
 *              schema:
 *                type: File
 *                $ref: '#/components/schemas/File'
 *                description: newFile - New saved file.
 *        "404": 
 *          description: File not found
 */
router.post("/save", function(req, res) {

	var fileNameSplit = req.body.name.split(".");
	var ext = fileNameSplit.pop();
	var name = fileNameSplit.join(".");

	// Look for duplicate name
	File.findOne({
		project: req.project._id,
		folder: req.body.folder,
		name: req.body.name
	}, function(err, file) {
		if (err) return res.status("500").send("Could not check for duplicates");
		if (file) {
			req.body.name = name + " (duplicate: " + new Date().getTime() + ")." + ext;
		}
		var newFile = new File(req.body);
		newFile.createThumbnailsIfNeeded();
		saveFile(newFile);
	});

	function saveFile(file) {
		file.save(function(err, savedFile) {
			if (err) return res.status("500").send("Could not save your file");
			return res.json(savedFile);
		});
	}

});

  /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/file/update:
 *    post:
 *      summary: Update a file name or folder. Rejects the update if there is a name conflict in the folder requested.
 *      tags: [File]
 *      parameters:
 *        - in: body
 *          name: _id
 *          description: File Id
 *          schema:
 *          type: String
 *        - in: body
 *          name: name
 *          description: name - File name
 *          schema:
 *          type: String
 *        - in: body
 *          name: folder
 *          description: folder - Folder mongo Id
 *          schema:
 *          type: String
 *      responses:
 *        "200":
 *          description: savedFile - New saved file.
 *          content:
 *            application/json:
 *              schema:
 *                type: File
 *                $ref: '#/components/schemas/File'
 *                description: newFile - New saved file.
 *        "404": 
 *          description: File not found
 *        "500": 
 *          description: Could not search in database
 *        "400": 
 *          description: Renamed failed
 */
router.post("/update", function(req, res) {

	File.findById(req.body._id, function(err, file) {
		if (err) return res.status(500).send("Could not search in database");
		if (!file) return res.status(404).send("File not found");

		searchForDups(function(dupFile){
			if(dupFile) return res.status(400).send({
				"code": "DUPLICATE",
				"message": "A file with this name already exists in this location"
			});
			file.folder = req.body.folder || file.folder;
			file.name = req.body.name || file.name;
			return saveAndReturn(file);
		});
	});

	function saveAndReturn(file){
		return file.save(function(err, savedFile) {
			if (err) return res.status(500).send("Could not perform save");
			return res.json(savedFile);
		});
	}

	function searchForDups(cb) {
		var fileObj = {
			project: req.project._id
		};

		var changeableKeys = ["folder", "name"],
			wasChanged = false;

		changeableKeys.forEach(function(key) {
			if (req.body[key]) {
				fileObj[key] = req.body[key];
				wasChanged = true;
			}
		});

		if(!wasChanged) return cb();

		File.findOne(fileObj, function(err, file) {
			if (err) return cb();
			return cb(file);
		});
	}
});

  /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/file/delete?ids=:ids:
 *    delete:
 *      summary: Delete an array of files by splitting into each file and
 *      tags: [File]
 *      produces:
 *       - application/string
 *      responses:
 *        200:
 *          description: Files deleted successfully.
 *        500:
 *          description: Failed to delete
 */
router.delete("/delete-by-ids", function(req, res) {
	File.deleteByIds(req.query.ids.split(",")).then(function(response) {
		if (response) return res.send({
			success: true,
			ids: req.body.ids
		});
		else return res.status("500").send("Failed to delete");
	});
});

  /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/file/s3/put:
 *    post:
 *      summary: Put in S3
 *      tags: [File]
 *      parameters:
 *        - in: body
 *          name: key
 *          description: s3 Key "..../file._id"
 *          schema:
 *          type: String
 *        - in: body
 *          name: fileType
 *          description: File Type
 *          schema:
 *          type: String
 *        - in: body
 *          name: acl
 *          description: file info
 *          schema:
 *          type: String
 *      responses:
 *        "200":
 *          description: response.ids - array of ids.
 *          content:
 *            application/json:
 *              schema:
 *                type: String
 *                description: response.ids - array of ids.
 *        "500": 
 *          description: Failed to put to s3
 */
router.post('/s3/put', function(req, res) {
	var key = req.body.key;
	var fileType = req.body.fileType;
	var acl = req.body.acl;
	File.getSignedUrl("putObject", key, fileType, acl).then(function(response) {
		res.send(response.signed_request);
	});
});

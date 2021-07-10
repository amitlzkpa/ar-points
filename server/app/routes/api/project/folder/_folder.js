'use strict';
var MExNServer = require("@ttcorestudio/mexn-server");
var middlewareRouter = MExNServer.modules.express.Router();
var router = MExNServer.modules.express.Router();
module.exports = middlewareRouter;

// var Project = require("server/db/models/Project/_Project");
var Folder = require("server/db/models/Folder/_Folder");
// var File = require("server/db/models/File/_File");

// All calls with this url pattern will pass through this middleware.
// It will attach the found folder as req.folder, or reject the API call
// outright with a 404 if folder is not found.
middlewareRouter.use("/:folderId", function(req, res, next) {
	req.project.getFolder(req.params.folderId).then(function(folder) {
		if (folder) {
			req.folder = folder;
			return next();
		} else {
			return reject();
		}
	}).catch(reject);

	function reject() {
		return res.status("404").send("Folder not found.");
	}
}, router);

/*
███████ ██ ███    ██  ██████  ██      ███████
██      ██ ████   ██ ██       ██      ██
███████ ██ ██ ██  ██ ██   ███ ██      █████
     ██ ██ ██  ██ ██ ██    ██ ██      ██
███████ ██ ██   ████  ██████  ███████ ███████
*/

// -----------------------------------------------------------------------------
// PROJECT VIEW PRIVILEGES
// -----------------------------------------------------------------------------

  /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/folder/{folderId}/info:
 *    get:
 *      summary: Get the information about a folder
 *      tags: [Folder]
 *      responses:
 *        "200":
 *          description: folder - Folder info
 *          content:
 *            application/json:
 *              schema:
 *                type: Folder
 *                $ref: '#/components/schemas/Folder'
 *                description: folder - Folder info
 *        "404": 
 *          description: File not found
 */
router.get("/info", function(req, res) {
	return res.send(req.folder);
});

   /**
 * @swagger
 * paths:
 *  /api/project/{projectId}/folder/{folderId}/child-folders:
 *    get:
 *      summary: Get the direct child folders of a folder
 *      tags: [Folder]
 *      responses:
 *        "200":
 *          description: folders - Array of child folders
 *          content:
 *            application/json:
 *              schema:
 *                type: [Folder]
 *                $ref: '#/components/schemas/Folder'
 *                description: folders - Array of child folders
 */
router.get("/child-folders", function(req, res) {
	req.folder.findChildFolders().then(function(folders) {
		return res.send(folders);
	});
});

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/folder/{folderId}/child-files:
 *    get:
 *      summary: Get the direct child files of a folder
 *      tags: [Folder]
 *      responses:
 *        "200":
 *          description: files - Array of child folders
 *          content:
 *            application/json:
 *              schema:
 *                type: [File]
 *                $ref: '#/components/schemas/File'
 *                description: files - Array of child folders
 */
router.get("/child-files", function(req, res) {
	req.folder.findChildFiles().then(function(files) {
		return res.send(files);
	});
});

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/folder/{folderId}/parent-folders:
 *    get:
 *      summary: Get parents of a folder
 *      tags: [Folder]
 *      responses:
 *        "200":
 *          description: folders - Array of parent folders
 *          content:
 *            application/json:
 *              schema:
 *                type: [Folder]
 *                $ref: '#/components/schemas/Folder'
 *                description: folders - Array of parent folders
 */
router.get("/parent-folders", function(req, res) {
	req.folder.findParents().then(function(folders) {
		return res.send(folders);
	});
});

// -----------------------------------------------------------------------------
// PROJECT EDIT PRIVILEGES
// -----------------------------------------------------------------------------

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/folder/{folderId}/add-new-folder:
 *    post:
 *      summary: Add a new child folder to folder called in URL
 *      tags: [Folder]
 *      parameters:
 *        - in: body
 *          name: name
 *          description: Folder Name
 *          schema:
 *          type: String
 *      responses:
 *        "200":
 *          description: new Folder - New Folder
 *          content:
 *            application/json:
 *              schema:
 *                type: Folder
 *                $ref: '#/components/schemas/Folder'
 *                description: new Folder - New Folder
 *        "500": 
 *          description: Error communicating with database
 */
router.post("/add-new-folder", function(req, res) {

	// check for duplicates
	var folderObj = {
		name: req.body.name,
		project: req.project._id,
		parentFolder: req.folder._id
	};

	Folder.findOne(folderObj, function(err, exstFolder) {

		if(err) return res.staus(500).send("Error communicating with database");

		if (exstFolder) {
			folderObj.name = folderObj.name + " (duplicate: " + new Date().getTime() + ")";
		}

		var folder = new Folder(folderObj);

		folder.save(function(saveErr, savedFolder) {
			if (saveErr) return res.status("500").send("Could not save your new folder");
			return res.send(savedFolder);
		});

	});
});

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/folder/{folderId}/update:
 *    post:
 *      summary: Update a folder's information. Also used to change a folder's location in the folder hierarchy.
 *      tags: [Folder]
 *      parameters:
 *       - in: body
 *         name: name
 *         description: Folder Name
 *         schema:
 *         type: String
 *       - in: body
 *         name: parentFolder
 *         description: Parent folder Id
 *         schema:
 *         type: String
 *      responses:
 *        "200":
 *          description: new Folder - New Folder
 *          content:
 *            application/json:
 *              schema:
 *                type: Folder
 *                $ref: '#/components/schemas/Folder'
 *                description: new Folder - New Folder
 *        "500": 
 *          description: Error communicating with database
 */
router.post("/update", function(req, res) {

	// Test for dups
	var folderObj = {
		name: req.folder.name,
		project: req.project._id,
		parentFolder: req.folder.parentFolder
	};

	var wasChanged = false;

	var changeableKeys = ["name", "parentFolder"];

	changeableKeys.forEach(function(key) {
		if (req.body[key]) {
			folderObj[key] = req.body[key];
			wasChanged = true;
		}
	});

	// Let's just pretend we saved it, but nothing is different
	if (!wasChanged) return res.status(200).send(req.folder);

	Folder.findOne(folderObj, function(err, exstFolder) {

		if(err) return res.status(500).send("Could not communicate with database");

		if (exstFolder) {
			return res.status(400).send({
				"code": "DUPLICATE",
				"message": "A folder already exists in this location with this name"
			});
		}
		changeableKeys.forEach(function(key) {
			req.folder[key] = folderObj[key];
		});

		req.folder.save(function(saveErr, savedFolder) {
			if (saveErr) return res.status("500").send("Could not save your new folder");
			return res.send(savedFolder);
		});
	});
});

// -----------------------------------------------------------------------------
// PROJECT DELETE PRIVILEGES
// -----------------------------------------------------------------------------

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/folder/{folderId}/delete:
 *    delete:
 *      summary: Deletes a folder. Will also remove sub-folders and sub-files.
 *      tags: [Folder]
 *      produces:
 *       - application/string
 *      responses:
 *        200:
 *          description: Folders and files deleted successfully.
 *        500:
 *          description: Failed to delete
 */
router.delete("/delete", function(req, res) {
	var folderId = req.folder._id;

	req.folder.deleteAllChildren().then(function( /*success*/ ) {
		Folder.deleteOne({
			_id: folderId
		}, function(err) {
			if (err) return res.status("500").send("Error deleting folder");
			else return res.send({
				success: true,
				id: folderId
			});
		});
	}).catch(function() {
		return res.status("500").send("Error deleting sub-folders and children.");
	});
});

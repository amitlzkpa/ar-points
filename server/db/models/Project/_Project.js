var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;


/**
 * Private schema for permissions
 *
 * @property {boolean} view - boolean of view permission
 * @property {boolean} delete - boolean of delete permission
 * @property {boolean} edit - boolean of edit permission
 *
 * @constructor
 * @private
 * @memberof module:server/db/models/Project/_Project
 */
 /**
 * @swagger
 *  components:
 *    schemas:
 *      permissionSchema:
 *        type: object
 *        properties:
 *          view:
 *            type: Boolean
 *            description: View permission
 *            default: true
 *          delete:
 *            type: Boolean
 *            description: Delete permission  
 *            default: false
 *          edit:
 *            type: Boolean
 *            description: Edit permission
 *            default: false 
 *        example:
 *           permissions: {view: true, delete:false, edit: false}
 */
var permissionSchema = new mongoose.Schema({
    view: {
        type: Boolean,
        default: true
    },
    delete: {
        type: Boolean,
        default: false
    },
    edit: {
        type: Boolean,
        default: false
    }
}, {
    _id: false
});

/**
 * Private schema for permissions of shared User
 *
 * should search/match by either email or user
 *
 * @property {string} email - email of the user
 * @property {ObjectId} user - the obejct id of the user, see User schema
 * @property {permissionSchema} permissionSchema - the permission schema. See permissionSchema, required
 *
 * @constructor
 * @private
 * @memberof module:server/db/models/Project/_Project
 */

 /**
 * @swagger
 *  components:
 *    schemas:
 *      sharedUserSchema:
 *        type: object
 *        required:
 *          - permissions
 *        properties:
 *          email:
 *            type: String
 *            description: email address, once the user sign in it will replace with database user object
 *            example: joe@gmail.com
 *          user:
 *            type: User
 *            description: User object 
 *          permissions:
 *            type: permissionSchema
 *            description: permissionSchema object 
 *            default: {}  
 *        example:
 *           user: {ssoid:1234, sso: {} , permissions : { admin: false}}
 *           permissions: {view: true, delete:false, edit: false}
 */
var sharedUserSchema = new mongoose.Schema({
    email: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    permissions: {
        type: permissionSchema,
        required: true,
        default: {}
    }
});

/**
 * Project schema
 *
 * @param {object} properties - Incoming properties to create a project with
 *
 * @property {string} name - Project name. Must be unique
 * @property {string} description -
 * @property {sharedUserSchema[]} users - shared users with different access permissions, sharedUserSchema
 * @property {ObjectId} rootFolder - root folder of the project. main parent of the folders. See Folder schema
 * @property {permissionsSchema} curPermissions -  current permissions
 * @property {Date} dateCreated -  the date of the project was created
 * @property {Date} dateModified -  the date of the project is last modified
 * @property {modificationSchema[]} modifications - array that holds the modifications. See ModificationSchema
 *
 * @constructor Project
 * @requires module:server/db/models/Project/_Project
 *
 * @example

var Project = require("server/db/models/Project/_Project");

// Create a new project
var project = new Project({
    name: < projectName >
        description: < projectDescription >
});

project.save(function (err, savedProject) {
    if (!err && savedProject) {
        // project successfully saved to database
    }
});

 */

 /**
 * @swagger
 *  components:
 *    schemas:
 *      Project:
 *        type: object
 *        required:
 *          - name
 *        properties:
 *          _id:
 *            type: ObjectId
 *            description: Unique identifier automatically added to the project.
 *          name:
 *            type: String
 *            description: Name of the project.
 *          descripton:
 *            type: String
 *            description: Description of the project
 *          curPermission:
 *            type: permissionSchema
 *            $ref: '#/components/schemas/permissionSchema'
 *            default: { "view": true, "delete": false, "edit": false }
 *            description: An object representing the true/false permission values for keys.
 *                         By default contains a permission set for 'view' set to true.
 *                         curPermision will populate when user login the app, not stored at database. 
 *          users:
 *            type: [sharedUserSchema]
 *            $ref: '#/components/schemas/sharedUserSchema'
 *            description: Array of shared user schema
 *          rootFolder:
 *            type: Folder
 *            $ref: '#/components/schemas/Folder'
 *            description: Root folder of the project
 *          created:
 *            type: Date
 *            description: The date when the project created.
 *          modified:
 *            type: Date
 *            description: The date when the project last modified.
 *        example:
 *           name: My project
 *           description: my project description
 *           rootFolder: Object
 *           created: { date: "2020-05-13T19:52:51.297Z", user: Object }
 *           modidified: { date: "2020-05-13T19:52:51.297Z", user: Object }
 *           curPermissions: { "view": true, "delete": false, "edit": false }
 */
var projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    users: {
        type: [sharedUserSchema],
        default: []
    },
    rootFolder: {
        type: mongoose.Schema.ObjectId,
        ref: "Folder"
    },
    curPermissions: permissionSchema,
    created: {
        date: Date,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    },
    modified: {
        date: Date,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    }
},{
	usePushEach: true
});

require("./ProjectFolderAndFileFunctions")(projectSchema);

/**
 * Pre-save hook:
 * if it is new, pre-save sets the dateCreated, dateModified, the modofications, and creates rootFolder
 * it is is existing, pre-save sets the dateModified and sets the modifications
 *
 * @function save
 * @memberof Project
 * @instance
 *
 * @param {function} callback
 *
 * @example

project.save(function(err,savedFolder){
    it clears the curPermissions
    it sets the dateModified
    if project is new, it sets the dateCreated and creates new rootFolder
    it revises and pushes the project modifications
});

 */
projectSchema.pre("save", function(next, user) {
    var project = this;
    var date = new Date();
    var Folder = mongoose.model("Folder");
    var rootFolder;

    project.curPermissions = undefined;

    project.modified.date = date;

    setUserIfApplicable(project.modified);

    if (project.isNew) {
        project.created.date = date;

        setUserIfApplicable(project.created);

        rootFolder = new Folder({
            name: "Project Root Folder",
            project: project._id
        });

        rootFolder.save();
        project.rootFolder = rootFolder;
    }

    function setUserIfApplicable(obj){
        if(user){
            obj.user = user;
        }
    }

    next();
});

/**
 * @module server/db/models/Project/_Project
 * @see Project
 *
 * @description Module that exports the Mongoose "Project" model.
 */
module.exports = mongoose.model('Project', projectSchema);

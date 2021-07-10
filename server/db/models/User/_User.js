var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;
var _ = require("lodash");

/**
 * Local user schema
 *
 * @param {object} properties - Incoming properties to create a user with
 *
 * @property {string} ssoId - Object ID of linked SSO. Must be unique
 * @property {ssoUser} sso - Stores SSO data from server. Is populated from data from SSO server
 * @property {array} tokens - Array of active API session tokens
 * @property {object} [permissions] - Keyed object of permissions and whether the user has access
 * @property {boolean} [permissions.admin] - Whether user is an admin
 *
 * @constructor User
 * @requires module:server/db/models/User/_User
 *
 * @example

 var User = require("server/db/models/User/_User");

 // You can also use:
 // var User = mongoose.model("User")
 // if you are inside of a route. However, this will not work in any part of
 // code that is read during the server creation process.

 // Create a new user with an ssoId available
 var user = new User({
     ssoId: ssoUser._id,
     permissions: {
         admin: false
     }
 });

 user.save(function (err, savedUser) {
     if (!err && savedUser) {
         // user successfully saved to database
     }
 });

 */

 /**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - ssoId
 *        properties:
 *          ssoId:
 *            type: String
 *            description: Object ID of linked SSO. Must be unique
 *          sso:
 *            type: Mixed
 *            description: Stores SSO data from server. Is populated from data from SSO server
 *          ssoToken:
 *            type: String
 *            description: ssp Token
 *          apiTokens:
 *            type: []
 *            description: Array of active API session tokens
 *          permissions:
 *            type: {}
 *            description: App level permissions
 *            example: { admin: false}
 *        example:
 *          
 */
var userSchema = new mongoose.Schema({
    // Required
    ssoId: {
        type: String,
        unique: true
    },
    // sso required for SSO integration
    sso: mongoose.Schema.Types.Mixed,
    ssoToken: String,
    // required for API functions from outside of a web session
    apiTokens: [],
    // everything after this is optional
    permissions: {
        admin: {
            type: Boolean,
            default: false
        }
    }
},{
    usePushEach: true,
    timestamps: true
});

// bring in the default functions
MExNServer.server.db.attachUserFunctions(userSchema);

// bring in the project-related functions
require("./UserProjectFunctions")(userSchema);



/**
 * Sanitizes a user to remove sensitive information. We use this to return information
 * to Angular without sensitive info. Function must exist, but if no sensitive
 * info exists feel free to just return the JSON version of the object.
 *
 * @function sanitize
 * @memberof User
 * @instance
 *
 * @example
 * var jsonUser = req.user.sanitize();
 */
userSchema.methods.sanitize = function () {
    return _.omit(this.toJSON(), ['apiTokens','ssoToken']);
};

/**
 * @module server/db/models/User/_User
 * @see User
 *
 * @description Module that exports the Mongoose "User" model.
 */
module.exports = mongoose.model('User', userSchema);

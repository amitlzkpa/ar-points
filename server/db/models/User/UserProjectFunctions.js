var MExNServer = require("@ttcorestudio/mexn-server");
var Promise = MExNServer.modules.bluebird;
var Project = require("server/db/models/Project/_Project");

module.exports = function (userSchema) {

    /**
     * Adds "users" search criteria to a project to check whether it is one of
     * this user's projects
     *
     * @function addMyCriteria
     * @memberof User
     * @instance

     * @param {object} criteria - Other criteria we're searching by, such as project id
     */
    userSchema.methods.addMyCriteria = function (criteria) {
        var user = this;
        criteria.users = {
            $elemMatch: {
                $or: [{
                    "user": user._id
                }]
            }
        };

        if (user.sso && user.sso.email) {
            criteria.users.$elemMatch.$or.push({
                "email": user.sso.email
            });
        }

        return criteria;
    };

    /**
     * Set a list of projects' "curPermissions" attribute to be the permissions
     * given to this specific user. Already called by findAllProjects or findOneProject
     *
     * @function processUsers
     * @memberof User
     * @instance
     *
     * @param  {any}   err      - incoming search error, if any
     * @param  {Project[]}   projects - List of projects
     * @param  {Function} callback - Callback when done
     * @return {Promise}            - Can also use as promise instead of callback
     */
     userSchema.methods.processUsers = function(err, projects, callback) {
             var user = this;

             return new Promise(function(resolve, reject) {
                 processUsers().then(function(projectsMod) {
                     callback(err, projectsMod);
                     resolve(projectsMod);
                 }).catch(function(setErr) {
                     callback(setErr, null);
                     reject(setErr);
                 });
             });

             function processUsers() {
                 return new Promise(function(resolve, reject) {
                     if (projects === null) return reject("No projects");

                     var processed = 0;
                     var length = 0;

                     if (Array.isArray(projects)) {
                         // is array of projects
                         length = projects.length;
                         length > 0 ? projects.map(process) : resolve(projects);
                     } else {
                         // is single project
                         length = 1;
                         process(projects);
                     }

                     function process(project) {
                         if (project.curPermissions) return finishOne();

                         var matchedId = project.users.filter(function(curUser) {
                             return String(curUser.user) === String(user._id);
                         });

                         var matchedEmail = project.users.filter(function(curUser) {
                             return curUser.email && (curUser.email === user.sso.email);
                         });

                         if (matchedId && matchedId.length) {
                             project.curPermissions = matchedId[0].permissions;
                             return finishOne();
                         } else if (matchedEmail && matchedEmail.length) {
                             return replaceEmailWithId(matchedEmail[0]);
                         } else {
                             // User not found
                         }

                         function replaceEmailWithId(curUser) {
                             curUser.user = user;
                             curUser.email = undefined;
                             user.saveProject(project, function(saveErr, savedProject) {
                                 if (!saveErr) {
                                     project = savedProject;
                                     project.curPermissions = curUser.permissions;
                                 } else {
                                     // handle error?
                                 }
                                 return finishOne();
                             });
                         }
                     }

                     function finishOne() {
                         processed++;
                         if (processed === length) {
                             Project.populate(projects,[
                                {
                                    "path": "created.user",
                                    "select": "sso.email sso.profile.name"
                                },{
                                    "path": "users.user",
                                    "select": "sso.email sso.profile.name"
                                }
                             ] ).then(function(populatedProjects) {
                                 return resolve(populatedProjects);
                             });
                         }
                     }

                 });
             }
         };


    /**
     * Find all projects associated with a user
     *
     * @function findAllProjects
     * @memberof User
     * @instance
     *
     * @param  {Function} callback - Post find projects
     */
    userSchema.methods.findAllProjects = function (callback) {
        var user = this;
        var sortby = {
            'created.date': -1
          }
        Project.find(user.addMyCriteria({})).sort(sortby).exec(function (err, projects) {
            user.processUsers(err, projects, callback);
        });
    };

    /**
     * Find one project associated with a user
     *
     * @function findOneProject
     * @memberof User
     * @instance
     *
     * @param  {String}   id       - mongo id of the project we're looking for
     * @param  {Function} callback - Post find one project
     */
    userSchema.methods.findOneProject = function (id, callback) {
        var user = this;
        return new Promise(function (resolve, reject) {
            Project.findOne(
                user.addMyCriteria({
                    "_id": id
                })
            ).populate({
                path: "files",
                populate: {
                    path: "uploadedBy"
                }
            }).exec(function (err, project) {
                if(err) reject(err);
                else resolve(project);
                user.processUsers(err, project, callback);
            });
        });
    };

    /**
     * Save one project, keeping the history that this user modified it last.
     *
     * @function saveProject
     * @memberof User
     * @instance
     *
     * @param  {String}   id       - mongo id of the project we're looking for
     * @param  {Function} cb - Post find one project
     */
    userSchema.methods.saveProject = function (project, cb) {
        var user = this;
        var curPermissions = project.curPermissions;
        project.save(user, function (err, savedProject) {
            if(err) return cb(err);
            if (!curPermissions) {
                return user.processUsers(err, savedProject, cb);
            } else {
                savedProject.curPermissions = curPermissions;
                return cb(err, savedProject);
            }
        });
    };
};

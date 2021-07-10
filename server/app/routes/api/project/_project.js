"use strict";
var MExNServer = require("@ttcorestudio/mexn-server");
var middlewareRouter = MExNServer.modules.express.Router();
var router = MExNServer.modules.express.Router();
module.exports = middlewareRouter;

const sgClient = require("server/lib/sgClient");
const fs = require("fs");
var content = fs
  .readFileSync("./server/assets/email_templates/projectShared.html")
  .toString("utf-8");

var Project = require("server/db/models/Project/_Project");
var Folder = require("server/db/models/Folder/_Folder");
var File = require("server/db/models/File/_File");

// All calls with this url pattern will pass through this middleware.
// It will attach the found project as req.project, or reject the API call
// outright with a 404 if project is not found. If a project is found,
// all GET requests will pass on through. If the current user does not have
// edit permissions, any POST request is rejected by this middleware. If the
// current user does not have delete permissions, all DELETE requests will be
// rejected by this middleware. Currently there are no additional request types
// accepted.
middlewareRouter.use(
  "/:projectId",
  function (req, res, next) {
    req.user.findOneProject(req.params.projectId, function (err, project) {
      if (!err) {
        req.project = project;

        if (!project) return res.status("404").send("Project not found.");
        if (req.method === "GET") return next();
        if (req.method === "POST")
          return req.project.curPermissions.edit
            ? next()
            : res
                .status("403")
                .send("You do not have permissions to modify this project");
        if (req.method === "DELETE")
          return req.project.curPermissions.delete
            ? next()
            : res
                .status("403")
                .send(
                  "You do not have permissions to delete items in this project"
                );
        else return res.status("400").send("Unrecognized request type");
      } else {
        return res.status("404").send("Project not found");
      }
    });
  },
  router
);

/*
███████ ██ ███    ██  ██████  ██      ███████
██      ██ ████   ██ ██       ██      ██
███████ ██ ██ ██  ██ ██   ███ ██      █████
     ██ ██ ██  ██ ██ ██    ██ ██      ██
███████ ██ ██   ████  ██████  ███████ ███████
*/

router.use("/folder", require("./folder/_folder"));
router.use("/file", require("./file"));

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/info:
 *    get:
 *      summary: Get the information about a project
 *      tags: [Project]
 *      responses:
 *        "200":
 *          description: project - project info
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Project'
 */
router.get("/info", function (req, res) {
  return res.send(req.project);
});

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/edit-info:
 *    post:
 *      summary: Edit existing project
 *      tags: [Project]
 *      parameters:
 *        - in: body
 *          name: name
 *          description: Project name
 *          schema:
 *          type: string
 *        - in: body
 *          name: description
 *          description: Project description
 *          schema:
 *          type: string
 *      responses:
 *        "200":
 *          description: Existing project modified
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Project'
 *        "500":
 *          description: Could not save project
 */
router.post("/edit-info", function (req, res) {
  req.project.name = req.body.name;
  req.project.description = req.body.description;
  req.user.saveProject(req.project, function (err) {
    if (err) return res.status("500").send("Could not save project");
    return res.send(req.project);
  });
});

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/add-user:
 *    post:
 *      summary: Add user to a project
 *      tags: [Project]
 *      parameters:
 *        - in: body
 *          name: email
 *          description: email of user to add
 *          type: string
 *      responses:
 *        "200":
 *          description: Returns shared user schema object
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/sharedUserSchema'
 */
router.post("/add-user", function (req, res) {
  req.project.users.push({
    email: req.body.email,
  });
  return res.json(req.project.users.pop());
});

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/save-user:
 *    post:
 *      summary: Add user to a project
 *      tags: [Project]
 *      parameters:
 *        - in: body
 *          name: users
 *          description: users - bunch of users to update permissions with
 *                      A user can have either an "add" or "delete" flag on them, which will perform
 *                      the appropriate reaction as all users update. Without an add or delete flag,
 *                      a found user's permissions will be overwritten by what is given to us.
 *          type: []
 *          example:
 *                  {
 *                      users: [{
 *                               _id: SampleUserId1,
 *                              permissions: {...updatedPermissionsObject},
 *                          },{
 *                              _id: SampleUserId2,
 *                              permissions: {...updatedPermissionsObject},
 *                              delete: true // this user will be deleted from the project
 *                          },{
 *                              _id: SampleUserId1,
 *                              permissions: {...updatedPermissionsObject},
 *                              add: true // this user will be added to the project
 *                          }]
 *                  }
 *      responses:
 *        "200":
 *          description: Returns saved Project
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Project'
 */
router.post("/save-users", function (req, res) {
  if (
    req.project.curPermissions.delete &&
    req.body.users &&
    req.body.users.length
  ) {
    req.body.users.forEach(function (postUser) {
      if (postUser.add && !postUser.delete) {
        postUser.add = undefined;
        Project.findOne({ _id: req.project._id }, function (err, proj) {
          if (err) console.log(err);
          else {
            proj.users.push(postUser);
            proj.save();
          }
        });

        // Send an email notification here if you would like!
        let email_content = content
          .replace("<USER_NAME>", req.user.sso.profile.name)
          .replace("<PROJECT_NAME>", req.project.name);
        sendEmail(
          "An AR Points project has been shared with you",
          [postUser.email],
          email_content,
          null,
          null
        );
      }
      req.project.users.forEach(function (projUser, i) {
        if (projUser._id == postUser._id) {
          // found match
          if (postUser.delete && !postUser.add) {
            //delete
            Project.findOne({ _id: req.project._id }, function (err, proj) {
              if (err) console.log(err);
              else {
                proj.users.pull(postUser);
                proj.save();
              }
            });
          } else {
            //update
            req.project.users[i] = postUser;
          }
        }
      });
    });

    var admins = req.project.users.filter(function (user) {
      return user.permissions.delete && user.permissions.edit;
    });
    var newAdmin;

    if (admins.length === 0) {
      // add user who is doing this back as admin
      req.project.users.push({
        user: req.user._id,
      });
      newAdmin = req.project.users[req.project.users.length - 1];
      newAdmin.permissions.delete = true;
      newAdmin.permissions.edit = true;
    }

    req.user.saveProject(req.project, function (error) {
      if (error) return res.status("500").send(error);
      else return res.json(req.project);
    });
  }

  function sendEmail(subject, toEmails, content, attachment, filename) {
    const mailOptions = {
      to: toEmails,
      from: process.env.SENDGRID_EMAIL,
      subject: subject || "TESTING",
      text: " ",
      html: content,
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          content: attachment,
          filename: filename,
          type: "text/csv",
        },
      ];
    }

    // https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
    // the recepients not able to see each other
    sgClient.sendMultiple(mailOptions, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
});

/**
 * @swagger
 * paths:
 *  /api/project/{projectId}/delete:
 *    delete:
 *      summary: Deletes a project. Will also remove sub-folders and sub-files (all sub objects)
 *      tags: [Project]
 *      produces:
 *       - application/string
 *      responses:
 *        200:
 *          description: Project deleted successfully.
 *        500:
 *          description: Server error.
 */
router.delete("/delete", function (req, res) {
  var deleteId = req.project._id;

  removeFolders();

  function removeFolders() {
    Folder.deleteMany(
      {
        project: deleteId,
      },
      removeFiles
    );
  }

  function removeFiles(err) {
    if (err) return res.status("500").send(err);
    req.project.getFiles().then(function (files) {
      if (files.length) {
        File.deleteByIds(
          files.map(function (file) {
            return file._id;
          })
        ).then(removeProject);
      } else {
        removeProject();
      }
    });
  }

  function removeProject() {
    Project.deleteOne(
      {
        _id: deleteId,
      },
      finishDeletion
    );
  }

  function finishDeletion(err) {
    if (err) return res.status("500").send(err);
    return res.json({
      success: true,
      id: deleteId,
    });
  }
});

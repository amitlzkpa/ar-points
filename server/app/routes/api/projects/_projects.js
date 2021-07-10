"use strict";
var MExNServer = require("@ttcorestudio/mexn-server");
var router = MExNServer.modules.express.Router();
module.exports = router;

var Project = require("server/db/models/Project/_Project");

/*
███    ███ ██    ██ ██   ████████ ██ ██████  ██      ███████
████  ████ ██    ██ ██      ██    ██ ██   ██ ██      ██
██ ████ ██ ██    ██ ██      ██    ██ ██████  ██      █████
██  ██  ██ ██    ██ ██      ██    ██ ██      ██      ██
██      ██  ██████  ███████ ██    ██ ██      ███████ ███████
*/

/**
 * @swagger
 * paths:
 *  /api/projects/new:
 *    post:
 *      summary: Create a new project. Returns a new project
 *      tags: [Projects]
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
 *          description: New Project created
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Project'
 *        "500":
 *          description: Server error.
 */
router.post("/new", function (req, res) {
  var project = new Project({
    name: req.body.name,
    description: req.body.description,
    users: [
      {
        user: req.user._id,
        permissions: {
          edit: true,
          delete: true,
        },
      },
    ],
  });
  req.user.saveProject(project, function (err) {
    if (!err) return res.json(project);
    else return res.status("500").send(err);
  });
});

router.get("/get-all", function (req, res) {
  req.user.findAllProjects(function (err, projects) {
    if (!err) return res.json(projects);
    else return res.status("500").send("Unable to perform find");
  });
});

router.get("/test", function (req, res) {
  let testResponse = {
    message: "here's a message",
    title: "vue test",
  };
  return res.json(testResponse);
});

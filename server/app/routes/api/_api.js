var MExNServer = require("@ttcorestudio/mexn-server");
var router = MExNServer.modules.express.Router();
var swaggerAPIDocSetup = require('server/swagger');
var passportConf = MExNServer.server.config.passport();

/*
 █████  ██████  ██      █████  ██    ██ ████████ ██   ██
██   ██ ██   ██ ██     ██   ██ ██    ██    ██    ██   ██
███████ ██████  ██     ███████ ██    ██    ██    ███████
██   ██ ██      ██     ██   ██ ██    ██    ██    ██   ██
██   ██ ██      ██     ██   ██  ██████     ██    ██   ██
*/

router.post(
  "/authenticate/ssotoken",
  passportConf.validateApplicationRequest,
  function(req, res) {
    passportConf
      .ssoLogin(req, req.body.token)
      .then(function(user) {
        user
          .grantApiToken()
          .then(function(token) {
            return res.status(200).json({
              success: true,
              token: token
            });
          })
          .catch(failToLogin);
      })
      .catch(failToLogin);

    function failToLogin() {
      passportConf.thouShallNotPass(res, "Login failed");
    }
  }
);

router.post("/authenticate/end", function(req, res) {
  passportConf.endApiSession(req.body.token).then(function(response) {
    return res.send(response);
  });
});

var allowAnonymousAccess = function (req, res, next){
  //TODO: implement logic to validate that the server is the server and no one else..
  return next();
}

/*
 ██████  ████████ ██   ██ ███████ ██████  ███████
██    ██    ██    ██   ██ ██      ██   ██ ██
██    ██    ██    ███████ █████   ██████  ███████
██    ██    ██    ██   ██ ██      ██   ██      ██
 ██████     ██    ██   ██ ███████ ██   ██ ███████
*/

router.use(
  "/projects",
  passportConf.validateApiRequest,
  require("./projects/_projects")
);

router.use(
  "/project",
  passportConf.validateApiRequest,
  require("./project/_project")
);

// router.use('/db', passportConf.validateApiRequest, require('./db/_db'));

router.use('/note', require('./note/_note'));

swaggerAPIDocSetup.setup(router);

module.exports = router;

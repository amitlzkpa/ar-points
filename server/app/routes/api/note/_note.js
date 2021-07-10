'use strict';

var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;
var File = mongoose.model("Note");
var router = MExNServer.modules.express.Router();

module.exports = router;

router.get("/test", function (req, res) {
  let testResponse = {
    message: "here's a message",
    title: "vue test",
  };
  return res.json(testResponse);
});


// router.post("/new", function (req, res) {
//   var project = new Note({
//     name: req.body.name,
    
//   });


// });
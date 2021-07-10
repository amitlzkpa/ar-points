'use strict';

var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;
var Note = mongoose.model("Note");
var router = MExNServer.modules.express.Router();

module.exports = router;

router.get("/test", function (req, res) {
  let testResponse = {
    message: "here's a message",
    title: "vue test",
  };
  return res.json(testResponse);
});

// Routes we need 
// create note
// edit note
// delete note
// get all notes by userId/spaceId

router.post("/new", function(req, res){
  var note = new Note({
    nodeType: req.body.nodeType,
    identifier: req.body.identifier,
    lastMaintained: Date.now(), // ? want to send from place note 
    maintainceFrequency: req.body.frequency,
    roomId: req.body.roomId,
    userId: req.body.userId,
    notes: req.body.notes
  });

  note.save(function(err, savedNote){
      if (err) return res.status(500).send("Could not create a spatial note");
      return res.send(savedNote);
  })

});

router.post("/get-my-notes", function(req, res){
  App.find({
    userId: req.body.userId,
    roomId: req.body.roomId,
  })
  .exec(function(err, notes){
    return res.json(notes);
  });
});
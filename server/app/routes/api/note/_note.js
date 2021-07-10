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
    noteId: req.body.noteId,
    mapId: req.body.mapId,
    authorId: req.body.authorId,
    nodeType: req.body.nodeType,
    identifier: req.body.identifier,
    lastMaintained: req.body.lastMaintained,
    dateCreated: Date.now(),
    maintainceFrequency: req.body.maintainceFrequency,
    notes:req.body.notes
  });

  note.save(function(err, savedNote){
      if (err) return res.status(500).send("Could not create a spatial note");
      return res.send(savedNote);
  })

});

router.post("/update", async function(req, res) {
  let note = await Note.find({ noteId: req.body.noteId });
  note.noteId = req.body.noteId;
  note.mapId = req.body.mapId;
  note.authorId = req.body.authorId;
  note.nodeType = req.body.nodeType;
  note.identifier = req.body.identifier;
  note.lastMaintained = req.body.lastMaintained;
  note.dateCreated = Date.now();
  note.maintainceFrequency = req.body.maintainceFrequency;
  note.notes = req.body.notes;

  note.save(function(err, savedNote) {
    if (err) return res.status(500).send("Could not update the spatial note");
    return res.send(savedNote);
  });
});

router.post("/get-my-notes", function(req, res){
  Note.find({
    authorId: req.body.authorId,
    mapId: req.body.mapId,
  })
  .exec(function(err, notes){
    if(err) res.json(false);
    return res.json(notes);
  });
});

router.post("/delete-by-noteId", function(req, res){
  Note.remove({
    noteId: req.body.noteId,
  })
  .exec(function(err, deleted){
    if(err) res.json(false);
    return res.json(deleted);
  });
});


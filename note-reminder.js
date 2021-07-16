// heroku scheduler script for email author of the note to reminder 
// heroku scheduler runs every day 9 am 

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

const sgClient = require('@sendgrid/mail');
sgClient.setApiKey(process.env.SENDGRID_API_KEY); 
var sender = process.env.SENDGRID_EMAIL 

const fs = require('fs');
var reminderTemplate = fs.readFileSync("./server/assets/email_templates/reminder.html").toString("utf-8");
let reminderContent = "";



MongoClient.connect(process.env.DATABASE_URI,{useUnifiedTopology: true}).then(function (db) {
    console.log("CONNECTED TO DB");
    checkNotesStatus(db);

}).catch(err => {
    console.error("An error occurred reading the database.");
    console.error(err);
});

function checkNotesStatus(client_db) {
  console.log('check for collection')
    let db = client_db.db();
    // get all notes
    // for each notes check frequency and date , find out the ones needs attention
    let counter = 0;

    var checkDate = new Date();
    var pastDate = checkDate.getDate() - 7; // fredquency and last maintained
    checkDate.setDate(pastDate);

    let collection = db.collection('notes');
    let notes = [];

    collection.find().toArray(function (err, notes) {
      console.log('find the collection', notes)
      console.log('find the collection', err)
     
        // reminderContent = reminderTemplate
        // .replace("<NOTE_TITLE>", "Couch")
        // .replace("<MAP_NAME>", "Adam's apartment")
        // .replace("<LAST_MAINTAINED>", "6/11/2021")
        // .replace("<NOTE_NOTES>", "Needs to be cleaned");
        // sendEmail(['elcinertugrul@gmail.com']);

      var counter = 0;
      for (let note of notes) {

        let reminderContent = reminderTemplate
        .replace("<NOTE_TITLE>", note.noteTitle)
        .replace("<MAP_NAME>", note.mapId)
        .replace("<LAST-MAINTAINED>", note.lastMaintained)
        .replace("<NOTE_NOTES>", note.notes);

        sendEmail([note.authorId]);

        isDone();
        console.log(u);

      }



      function isDone() {
          counter += 1;
          if (users.length === counter) {
              resolve(true);
          }
      }


  });


}

sendEmail = (toEmails) => {
    //console.log("emails", toEmails)
    if(toEmails.length === 0) return;
    const mailOptions = {
        to: toEmails,
        from: sender,
        subject: "Spatial Sheduler Reminders",
        html: reminderContent
        // text: "This is a friendly reminder that you haven't reported your status last 7 days, please sign in the Healthy Reentry app and submit your status."
    };

    sgClient.sendMultiple(mailOptions, function (err) {
        console.log("err?", err)
        if (err)
            return;
        else
            console.log('sent');


    });

}

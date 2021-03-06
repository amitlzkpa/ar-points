var MExNServer = require("@ttcorestudio/mexn-server");
var mongoose = MExNServer.modules.mongoose;


 /**
 * @swagger
 *  components:
 *    schemas:
 *      Note:
 *        type: object
 *        properties:
 *          identifier:
 *            type: Number
 *            description: identifier
 *          nodetype:
 *            type: String
 *            description: Type of node
 *          room:
 *            type: String
 *            description: Name of the Space
 *          lastMaintained:
 *            type: Date
 *            description: Date that node was maintained
 * 				
 * 
 *          
 */
var noteSchema = new mongoose.Schema({
  noteData:String,
  noteTitle:String,
  noteId:String,
  mapId: String,
  authorId: String,
  nodeType: String,
  identifier: String,
	lastMaintained: Date,
  dateCreated: Date,
	maintainceFrequency: Object,  // { recurrence: "Daily" } //  { recurrence: "Weekly"  day: 2}  //  { recurrence: "Monthly"  day: 15 } etc... 
  notes: String
},{
	usePushEach: true
});


/**
 * @module server/db/models/Note/_Note
 * @see Note
 *
 * @description Module that exports the Mongoose "Note" model.
 */
 module.exports = mongoose.model('Note', noteSchema);
// Require our models -- these should register the model into mongoose
// so the rest of the application can simply call mongoose.model('User')
// anywhere the User model needs to be used.
require('./User/_User');
require('./File/_File');
require('./Folder/_Folder');
require('./Project/_Project');
require('./Note/_Note');

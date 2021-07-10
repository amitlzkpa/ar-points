//Send for email notifications
const sgClient = require('@sendgrid/mail');
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = sgClient;
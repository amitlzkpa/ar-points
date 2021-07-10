require('rootpath')();
const mserver = require('server/server');



//-----------------------------------------------



function before(app, server, compiler) {

  app.get("/test", (req, res) => {
    return res.send('success!')
  });

}



//-----------------------------------------------



module.exports = {
  before
}
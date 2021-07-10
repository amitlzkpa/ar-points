require('dotenv').config({ path: '.env-dev' });
const concurrently = require('concurrently');

const SERVER_PORT = process.env.PORT || 8080;
const VUE_PORT = parseInt(SERVER_PORT) + 1;

process.env.SERVER_PORT = SERVER_PORT;
process.env.VUE_PORT = VUE_PORT;

async function main() {
  concurrently([
    {
      command: "nodemon --inspect server/main.js",
      name: "backend"
    },
    {
      command: `wait-on http://localhost:${SERVER_PORT}/ping && npm run serve`,
      name: "frontend"
    }
  ]);
}

main();
const inquirer = require("inquirer");
const figlet = require("figlet");
const shell = require("shelljs");
const fs = require("fs");
const path = require("path");
const projectName = require("project-name");

async function readARandomFact() {
  let factsPath = path.join(
    process.cwd(),
    "_webstarter",
    "resources",
    "read-a-fact",
    "facts.txt"
  );
  let factsTxt = fs.readFileSync(factsPath, "utf-8");
  let factsList = factsTxt.split("\n");

  let randomFact = factsList[Math.floor(Math.random() * factsList.length)];
  console.log(randomFact);
}

/*
 
   ______        ___    ____  ____ _____ ____  
  / ___\ \      / / \  / ___|/ ___| ____|  _ \ 
  \___ \\ \ /\ / / _ \| |  _| |  _|  _| | |_) |
   ___) |\ V  V / ___ \ |_| | |_| | |___|  _ < 
  |____/  \_/\_/_/   \_\____|\____|_____|_| \_\
                                               
 
*/

let devMode = false;

let askConfirmation = () => {
  let questions = [
    {
      name: "confirm",
      type: "confirm",
      default: false,
      message: `Are you sure you want to continue?`,
    },
  ];
  return inquirer.prompt(questions);
};

let askProjectName = (defaults) => {
  let questions = [
    {
      name: "projectName",
      type: "input",
      default: defaults.name,
      message: `Project name to use for API documentation:`,
    },
  ];
  return inquirer.prompt(questions);
};

async function addSwagger() {
  // show pre-install message
  let preInstallMsgPath = path.join(
    process.cwd(),
    "_webstarter",
    "resources",
    "add-swagger",
    "msg-pre-install.txt"
  );
  let preInstallMsg = fs.readFileSync(preInstallMsgPath, "utf-8");
  console.log(preInstallMsg);

  // ask for confirmation
  let confInput = await askConfirmation();
  let conf = confInput.confirm;
  if (!conf) return;

  // ask name for API docs
  let defaultName = projectName();
  let defaults = {
    name: defaultName,
  };

  let projectNameInput = await askProjectName(defaults);
  let name = projectNameInput.projectName || defaultName;

  // install swagger npm packages
  if (!devMode) {
    console.log("Installing packages for swagger...");
    if (
      shell.exec(
        "npm --silent --no-fund --no-audit i swagger-jsdoc@^4.3.x swagger-ui-express@^4.1.x -S"
      ).code !== 0
    ) {
      shell.echo("Error installing swagger packages. Aborted.");
      shell.exit(1);
    }
  } else {
    console.log("Skipping installing packages in dev mode.");
  }

  // setup backend config
  console.log("Updating server side files to setup swagger...");
  let swaggerServerTemplateFilePath = path.join(
    process.cwd(),
    "_webstarter",
    "resources",
    "add-swagger",
    "swagger-server.js.txt"
  );
  let serverSwaggerFileTemplate = fs.readFileSync(
    swaggerServerTemplateFilePath,
    "utf-8"
  );
  let finalServerFile = serverSwaggerFileTemplate.replace(
    "<projectName>",
    name
  );

  let serverSwaggerWriteFolder = path.join(process.cwd(), "server");
  if (!fs.existsSync(serverSwaggerWriteFolder))
    fs.mkdirSync(serverSwaggerWriteFolder);
  fs.writeFileSync(
    path.join(serverSwaggerWriteFolder, "swagger.js"),
    finalServerFile
  ); // create /server/swagger.js

  let apiFilePath = path.join(
    process.cwd(),
    "server",
    "app",
    "routes",
    "api",
    "_api.js"
  );
  let apiFileContent = fs.readFileSync(apiFilePath, "utf-8");

  let serverFileLines = apiFileContent.split("\n");
  let routerLineNo = serverFileLines.findIndex((l) =>
    l.includes("router = MExNServer.modules.express.Router()")
  );
  let swaggerImportLine = `var swaggerAPIDocSetup = require('server/swagger');`;
  serverFileLines.splice(routerLineNo + 1, 0, swaggerImportLine);

  let exportLineNo = serverFileLines.findIndex((l) =>
    l.includes("module.exports = router")
  );
  let swaggerSetupLine = `swaggerAPIDocSetup.setup(router);`;
  serverFileLines.splice(exportLineNo, 0, "");
  serverFileLines.splice(exportLineNo, 0, swaggerSetupLine);
  serverFileLines.splice(exportLineNo, 0, "");

  let newApiFileContent = serverFileLines.join("\n");
  fs.writeFileSync(apiFilePath, newApiFileContent); // update 'api' path in routes to setup swagger with server

  // setup frontend shimmy
  console.log("Updating client side files to setup swagger...");
  let swaggerClientTemplateFilePath = path.join(
    process.cwd(),
    "_webstarter",
    "resources",
    "add-swagger",
    "swagger-client.js.txt"
  );
  let clientSwaggerFileTemplate = fs.readFileSync(
    swaggerClientTemplateFilePath,
    "utf-8"
  );
  let finalClientFile = clientSwaggerFileTemplate.replace(
    "<projectName>",
    name
  );

  let clientSwaggerWriteFolder = path.join(process.cwd(), "public", "swagger");
  if (!fs.existsSync(clientSwaggerWriteFolder))
    fs.mkdirSync(clientSwaggerWriteFolder);
  fs.writeFileSync(
    path.join(clientSwaggerWriteFolder, "customization.js"),
    finalClientFile
  );

  // setup proxy for dev access to API docs
  console.log("Setting up proxy for vue...");

  let vueConfigFilePath = path.join(process.cwd(), "vue.config.js");
  let vueConfigFileContent = fs.readFileSync(vueConfigFilePath, "utf-8");

  let vueConfigFileLines = vueConfigFileContent.split("\n");
  let proxyLineNo = vueConfigFileLines.findIndex((l) => l.includes("proxy"));
  let proxySetupLines = [
    '      "/docs": {',
    "        target: `http://localhost:${process.env.SERVER_PORT}/`,",
    '        logLevel: "debug"',
    "      },",
  ];
  proxySetupLines.reverse().forEach((l) => {
    vueConfigFileLines.splice(proxyLineNo + 1, 0, l);
  });

  let newVueConfigFileContent = vueConfigFileLines.join("\n");
  fs.writeFileSync(vueConfigFilePath, newVueConfigFileContent);

  // show post install msg
  let postInstallMsgPath = path.join(
    process.cwd(),
    "_webstarter",
    "resources",
    "add-swagger",
    "msg-post-install.txt"
  );
  console.log("");
  let postInstallMsg = fs.readFileSync(postInstallMsgPath, "utf-8");
  console.log(postInstallMsg);
}

// -------------------------

/*
 
   _____ _   _ _____ ______   __
  | ____| \ | |_   _|  _ \ \ / /
  |  _| |  \| | | | | |_) \ V / 
  | |___| |\  | | | |  _ < | |  
  |_____|_| \_| |_| |_| \_\|_|  
                                
 
*/

let askCommand = () => {
  let questions = [
    {
      name: "command",
      type: "rawlist",
      default: "read-help",
      choices: ["add-swagger", "read-a-fact", "read-help"],
      message: `What would you like to do?`,
    },
  ];
  return inquirer.prompt(questions);
};

// -------------------------

async function main() {
  let msg;
  console.log("You have invoked!");
  msg = figlet.textSync("CORE WebStarter", {
    horizontalLayout: "default",
    verticalLayout: "default",
  });
  console.log(msg);

  console.log(`This a utility tool to work with WebStarter projects.`);
  console.log(
    `There is a limited set of things we can do to help with your projects.`
  );
  console.log(``);

  let command = await askCommand();
  console.log(`Your choice: ${command.command}`);
  console.log("");

  switch (command.command) {
    case "add-swagger": {
      await addSwagger();
      break;
    }
    case "read-a-fact": {
      await readARandomFact();
      break;
    }
    case "read-help": {
      console.log("Sorry. There is no help yet.");
      console.log(":(");
      break;
    }
    default: {
      console.log("Unknown command");
    }
  }
}

main();

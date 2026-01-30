const os = require('os');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mustacheExpress = require("mustache-express");
const favicon = require("serve-favicon");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const mysql = require("mysql2");

function getServerIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const details of iface) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address;
            }
        }
    }
    return 'Unknown';
}

async function startServer() {

    // Step 1: Fetch DB secrets from AWS Secrets Manager
    const secretName = "Mydbsecret";
    const secretsClient = new SecretsManagerClient({ region: "us-east-1" });

    let dbConfig;
    try {
        const response = await secretsClient.send(
            new GetSecretValueCommand({ SecretId: secretName })
        );
        const secret = JSON.parse(response.SecretString);

        dbConfig = {
            host: secret.host,
            user: secret.user,
            password: secret.password,
            database: secret.db,
        };

        console.log("✅ Secrets loaded.");
    } catch (err) {
        console.error("❌ Failed to load secrets:", err);
        process.exit(1);
    }

    // Step 2: Create DB connection and inject into models/controllers
    const SupplierModel = require("./app/models/supplier.model")(dbConfig);
    const supplier = require("./app/controller/supplier.controller")(SupplierModel);

    // Step 3: Setup Express app
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
    app.options("*", cors());

    app.engine("html", mustacheExpress());
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");

    app.use(express.static("public"));
    app.use(favicon(__dirname + "/public/img/favicon.ico"));

    // Step 4: Routes
    app.get("/", (req, res) => {
        res.render("home", {
            serverIp: getServerIP()
        });
    });

    app.get("/students/", supplier.findAll);
    app.get("/supplier-add", (req, res) => res.render("supplier-add", {}));
    app.post("/supplier-add", supplier.create);
    app.get("/supplier-update/:id", supplier.findOne);
    app.post("/supplier-update", supplier.update);
    app.post("/supplier-remove/:id", supplier.remove);

    // Step 5: 404 Handler
    app.use((req, res) => {
        res.status(404).render("404", {});
    });

    // Step 6: Start Server
    const port = process.env.APP_PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

startServer();

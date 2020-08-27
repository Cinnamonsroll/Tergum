import { config } from "dotenv";
config();

import("./database/database");
import { Constants } from "discord.js";
Constants.DefaultOptions.ws.properties.$browser = "Discord iOS";

import BackupClient from "./util/structures/BackupClient";
const Client = new BackupClient("?", ["408080307603111936"]);

import("./handlers/CommandHandler").then(cmd => cmd.default.load("./src/commands", ["backup", "general", "owner"], Client));
import("./handlers/EventHandler").then(event => event.default.load("./src/events", Client));

Client.login(process.env.BOT_TOKEN);
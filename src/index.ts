import { config } from "dotenv";
config();

import("./database/database");

import BackupClient from "./util/structures/BackupClient";
import CommandHandler from "./handlers/CommandHandler";
import EventHandler from "./handlers/EventHandler";
const Client = new BackupClient({ defaultPrefix: "?", owners: ["408080307603111936"] });

CommandHandler.load("./src/commands", ["backup", "general"], Client);
EventHandler.load("./src/events", Client);

Client.login(process.env.BOT_TOKEN);
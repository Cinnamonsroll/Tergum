import { Schema, model } from "mongoose";
import GuildType from "../DocTypes/GuildType";

const Guild = new Schema({
    id: { type: String, required: true },
    prefix: { type: String, default: null },
});

export default model<GuildType>("guilds", Guild);
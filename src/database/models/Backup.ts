import { Schema, model } from "mongoose";
import BackupType from "../DocTypes/BackupType";

const Backups = new Schema({
    code: { type: String, required: true },
    originalServer: { type: String, required: true },
    private: { type: Boolean, required: true },
    data: { type: Object, default: { channels: [], roles: [], emojis: [] } },
    name: { type: String, required: true },
    icon: { type: String, required: false },
    settings: { type: Object, required: true },
    owner: { type: String, required: true },
    previousStates: { type: Array, default: [] },
    parent: { type: Boolean, default: true },
    date: { type: Date, required: true },
});

export default model<BackupType>("backups", Backups);
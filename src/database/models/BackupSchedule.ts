import { Schema, model } from "mongoose";
import ScheduleType from "../DocTypes/ScheduleType";

const BackupSchedule = new Schema({
    backupId: { type: String, required: true },
    schedule: { type: String, required: true },
    ownerId: { type: String, required: true }
});

export default model<ScheduleType>("schedules", BackupSchedule);
import { Document } from "mongoose";

export default interface ScheduleType extends Document {
    backupId: string;
    schedule: string;
    ownerId: string;
}
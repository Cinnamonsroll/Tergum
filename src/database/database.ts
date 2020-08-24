import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) throw err;
    console.log("Successfully logged into the MongoDB Database");
});
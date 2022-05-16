const express = require("express");
require("dotenv").config();
const { getDbInstance } = require("./db");
const { transporter } = require("./transporter");
const userRouter = require("./routes/user");
const uploadRouter = require("./routes/upload");
const downloadRouter = require("./routes/download");
const port = process.env.PORT;
const cron = require("node-cron");
var moment = require("moment-timezone");
// var a = moment.tz("2013-11-18 11:55", "VietNam/HaNoi");
// console.log(a)
cron.schedule(
    "0 49 16 * * *",
    () => {
        console.log("running a task every minute");
    }
);

const main = async() => {
    await getDbInstance();
    const app = express();
    app.use(express.json());
    app.use("/users", userRouter);
    app.use("/download", downloadRouter);
    app.use("/upload", uploadRouter);
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};

main();
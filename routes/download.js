const express = require("express");
const downloadRouter = express.Router();
const fs = require("fs");
const { getDbInstance } = require("../db");
const { ObjectId } = require("mongodb");
const sharp = require("sharp");
const contentDisposition = require('content-disposition')

downloadRouter.get("/ori/:id", async(req, res) => {
    try {
        //step 1: lay param id
        const id = req.params.id;
        //step 2: lay metadata cua file tu database bang id
        let meta = await (await getDbInstance())
            .collection("uploads")
            .findOne({ _id: ObjectId(id) });
        //step 3: doc file va gui ve client
        const dir = `./uploads/${meta.filename}`;
        res.download(dir, meta.originalname);
    } catch (error) {
        res.json({ error: error.message });
    }
});
downloadRouter.get("/resize/:id", async(req, res) => {
    try {
        //step 1: lay param id
        const id = req.params.id;
        //step 2: lay metadata cua file tu database bang id
        let meta = await (await getDbInstance())
            .collection("uploads")
            .findOne({ _id: ObjectId(id) });
        //step 3: doc file va gui ve client
        const dir = `./uploads/${meta.filename}`;
        //step 4:
        res.header('Content-Disposition', 'attachment; filename="' + meta.filename + '"');
        sharp(dir).resize(100, 100).pipe(res);
    } catch (error) {
        res.json({ error: error.message });
    }
});
module.exports = downloadRouter;
const express = require("express");
const uploadRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const { getDbInstance } = require("../db");
const { ObjectId } = require("mongodb");
const res = require("express/lib/response");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads");
    },
    filename: function(req, file, cb) {
        console.log(file.originalname);
        let error = null;
        if (!file.originalname.startsWith("NAPA")) error = "Name invalid";
        const fileType = file.originalname.split(".").pop();
        cb(
            error ? new Error(error) : null,
            `${file.fieldname}-${Date.now()}.${fileType}`
        );
    },
});
const maxSize = 1 * 1024 * 1024;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
});

const uploadMiddlewareMutiple = (req, res, next) => {
    upload.array("multi-files")(req, res, function(err) {
        if (err) {
            return res.json({ error: err.message });
        }
        next();
    });
};
const uploadMiddlewareSingle = (req, res, next) => {
    upload.single("single-file")(req, res, function(err) {
        if (err) {
            return res.json({ error: err.message });
        }
        next();
    });
};

uploadRouter.post("/multiple", uploadMiddlewareMutiple, async(req, res) => {
    try {
        console.log(req.files);
        let result = await (await getDbInstance())
            .collection("uploads")
            .insertMany(req.files);
        res.send({ fileId: result.insertedIds });
    } catch (error) {
        res.json({ error: error.message });
    }
});

uploadRouter.post("/", uploadMiddlewareSingle, async(req, res) => {
    try {
        const file = req.file;
        if (!file) {
            const error = new Error("Please upload a file");
            error.httpStatusCode = 400;
            throw error;
        }
        const result = await (await getDbInstance())
            .collection("uploads")
            .insertOne(file);
        res.send({ fileId: result.insertedId });
    } catch (error) {
        res.json({ error: error.message });
    }
});
uploadRouter.get("/:id", async(req, res) => {
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

module.exports = uploadRouter;
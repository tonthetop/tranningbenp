const express = require("express");
const uploadRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const { getDbInstance } = require("../db");
const { ObjectId } = require("mongodb");

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
        console.log(result.insertedIds);
        let values = Object.values(result.insertedIds);
        values = values.map((value) => {
            return {
                "url-ori": `http://localhost:3000/download/ori/${value}`,
                "url-resize": `http://localhost:3000/download/resize/${value}`,
            };
        });
        res.send(values);
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

        const value = result.insertedId
        res.send({
            "url-ori": `http://localhost:3000/download/ori/${value}`,
            "url-resize": `http://localhost:3000/download/resize/${value}`,
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

module.exports = uploadRouter;
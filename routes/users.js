const express = require('express')
const userRoutes = express.Router()
const { getDBInstance } = require('./db')
const db = getDBInstance()
userRoutes.get("/", (req, res) => {
    db.colection("user")
    res.status(200).json(JSON.parse(data)).end();

});

userRoutes.get("/:id", (req, res) => {
    let users;
    fs.readFile("users.json", "utf8", function(err, data) {
        users = JSON.parse(data);
        const user = users.find((user) => user.id === req.params.id);
        if (!user) {
            return res.status(400).json({ message: "user not found!" }).end();
        }
        res.status(200).json(user).end();
    });
});

userRoutes.post("/", (req, res) => {

    const user = {
        id: uuidv4(),
        username: req.body.username,
        password: md5(req.body.password),
    };
    let users;
    db.collection("users").insert(user, function(
        err,
        r
    ) {
        console.log("Added a user");

    });

})
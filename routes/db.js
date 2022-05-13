const { MongoClient } = require('mongodb');
require('dotenv').config()
    // or as an es module:
    // import { MongoClient } from 'mongodb'

// Connection URL
const url = process.env.URL;
const client = new MongoClient(url);
console.log(url)
    // Database
let db;
const getDBInstance = () => {
    try {
        if (!db) {
            db = MongoClient.connect(url)
        }
        return db;
    } catch (error) {
        throw new Error("Can't connect to MongoDB")
    }

}
module.exports = { getDBInstance }
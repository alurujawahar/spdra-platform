const config = require('./cred')
const mongoose = require('mongoose');

const connectionString = config.DB_CONNECTION_STRING;

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

function dbconnect() {
    mongoose.connect(connectionString, options)
        .then((db) => {
            console.log("MongoDB is connected");
            return db;
        })
        .catch((err) => {
            console.error("MongoDB connection unsuccessful");
            throw err;
        });

}

exports.dbconnect = dbconnect;

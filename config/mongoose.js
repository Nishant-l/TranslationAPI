// Require Liberary
const mongoose = require('mongoose');

// Connect to dataBase
mongoose.connect('mongodb://localhost/translator_db');

// accquare the connection (To check if it is successfull)
const db = mongoose.connection;

// on error event occurence
db.on('error',console.error.bind(console, 'Error connecting to database'));

// if up and running print the message
db.once('open', () => {
    console.log('Successfully connected to database');
})

module.exports = db;
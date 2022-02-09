const mongoose = require('mongoose');

const translationDatabaseSchama = new mongoose.Schema({
    englishText: {
        type: String,
        required: true
    },
    translations:{
        type:Map,
        of: String
    }
});

const TranslationDatabase = mongoose.model('TranslationDatabase',translationDatabaseSchama);

module.exports = TranslationDatabase;
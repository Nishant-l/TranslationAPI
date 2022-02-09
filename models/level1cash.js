const mongoose = require('mongoose');

const level1CashSchama = new mongoose.Schema({
    text:{
        type: String,
        required: true
    },
    storedAt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TranslationDatabase'
    }
})

const Level1Cash = mongoose.model('Level1Cash',level1CashSchama);

module.exports = Level1Cash;
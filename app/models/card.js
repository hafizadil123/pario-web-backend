
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id : {
        type : String,
        required: true
    },
    wbs : {
        type:String,
        required: true,
    },
    cardName : {
        type: String,
        required: true,
    },
    parentCard : {
        type: String,
        default: null,
    },
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }
})

const cards = mongoose.model('cards', schema);

module.exports = cards;
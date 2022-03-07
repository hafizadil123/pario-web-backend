
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id : {
        type : Number,
        default: 1
    },
    wbs : {
        type:String
    },
    cardName : {
        type: String,
        required: true,
    },
    parentCard : {
        type: String,
        default: null,
    },
    estDuration : {
        type: String,

    },
    predecessor : {
        type: String,

    },
    successor : {
        type: String,
   
    },
    resource : {
        type: String,
       
    },
    effort : {
        type: String,
   
    },
    parentId: {
        type: Number,
        default: 0
     },
    childrenCount: {
       type: Number,
       default: 0
    },
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    }
})




schema.pre('save', function(next) {
    var doc = this;
    cards.find({}).select('id').sort({id: 'desc'}).then(res => {
     console.log(res[0])
     doc.id = res[0].id + 1
     cards.findOneAndUpdate({_id: doc._id}, doc).then(s => {
         next();
     })
    })
   
 next();
});
const cards = mongoose.model('cards', schema);
module.exports = cards;
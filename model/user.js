const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true, index: true},
    username: {type: String , required: true},
    room: {type: Number, required: true },
    password: {type: String , required: true},
    attendance:[{

        date: {
             type: String
             
         },
         morning: {
             type: Boolean,
             default: true
         },
         night: {
             type: Boolean,
             default: true
         }
 
    }]
},{
    collection: 'users'
});

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model;
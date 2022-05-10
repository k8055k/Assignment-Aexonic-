var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate-v2'); // this is a plugin for pagination provided by mongodb
var passportLocalMongoose = require('passport-local-mongoose');   //this plugin is for creating salt and hash value for password by mongodb

var User = new Schema({
    firstname :{
        type: String,
        default: "",
    },
    lastname: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    mobileno: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    }
});

User.plugin(passportLocalMongoose);  
User.plugin(aggregatePaginate);

var User = mongoose.model('User', User);
module.exports = User;
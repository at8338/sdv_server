const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const settingsUserSchema = new Schema({
    fullname: String,
    email: String,
    password: String,
    repeatpassword: String
});

module.exports = mongoose.model('settingsUser', settingsUserSchema, 'users');

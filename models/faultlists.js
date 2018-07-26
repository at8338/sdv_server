const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const faultlistsSchema = new Schema({
    maker: String,
    factory: String,
    machine: String,
    sensor: String,
    etype: String,
    elevel: String
});

module.exports = mongoose.model('faultlist', faultlistsSchema, 'faultlists');

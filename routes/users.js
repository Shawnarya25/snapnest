const express = require('express');
const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterestDB");

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    age: Number,
    profileimage: String,

    boards: {
        type: Array,
        default: [],
    },

    contact: Number,

    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);

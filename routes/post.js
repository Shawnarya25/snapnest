
const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterestDB");

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String,
    description: String,
    image: String,
})

module.exports = mongoose.model('post', postSchema);

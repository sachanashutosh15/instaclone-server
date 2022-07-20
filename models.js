const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: String,
  location: String,
  description: String,
  likes: Number,
  date: String,
  path: String,
})

const postsModel = mongoose.model('posts', postSchema);

module.exports = { postsModel };

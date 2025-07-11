const mongoose = require('mongoose');
const proprietorSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: Date,
  content: String,
  image: String // base64 encoded image
});
module.exports = mongoose.model('Proprietor', proprietorSchema);
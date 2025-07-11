const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: Date,
  category: String,
  content: String
});
module.exports = mongoose.model('News', newsSchema);

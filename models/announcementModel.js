const mongoose = require('mongoose');
const announcementSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date
});
module.exports = mongoose.model('Announcement', announcementSchema);
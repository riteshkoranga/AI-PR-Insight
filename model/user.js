const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
  },
  username: String,
  token: String,
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
},
  education: {
    type: String,
    required: true
  },
  gender:{
    type:String,
    required:true
  },
  interestInEntp: {
    type: String,
    required: true
  },
  interestSectors : {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  working: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('users', UserSchema);
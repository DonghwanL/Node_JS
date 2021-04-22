const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true, // 공백 제거
    unique: 1
  },
  password: {
    type: String,
    maxlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: { // 관리자와 일반 유저를 구분
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type: Number
  }
})

const User = mongoose.model('User', userSchema)
module.exports = { User };
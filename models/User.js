const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

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
    maxlength: 70
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

userSchema.pre('save', function (next) {
  var user = this; 

  if (user.isModified('password')) {
      // 비밀번호를 암호화 (Salt 사용)

    bcrypt.genSalt(saltRounds, function(err, salt) {

      if (err) return next(err)

      // 순수 비밀번호, 생성된 salt, 암호화할 hash
      bcrypt.hash(user.password, salt, function(err, hash) {
         if (err) return next(err)
         user.password = hash
         next()
      });
    });
  } else {
    next()
  }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
  // plainPassword를 암호화하여 암호화된 비밀번호와 비교 

  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  })
}

userSchema.methods.generateToken = function(cb) {
  // jsonwebtoken을 이용하여 token을 생성

  var user = this;
  var token = jwt.sign(user._id.toHexString(), 'secretToken')

  user.token = token
  user.save(function (err, user) {
   if (err) return cb(err) 
   cb(null, user)
  })
}

const User = mongoose.model('User', userSchema)
module.exports = { User };
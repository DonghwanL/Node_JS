const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User"); 

// application/x-www-from-urlencoded (코드를 분석해서 가져옴)
app.use(bodyParser.urlencoded({extended: true}));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/api/users/register', (req, res) => {
  // 회원가입시 필요한 정보를 client에서 가져와 데이터베이스에 입력

  const user = new User(req.body)

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에서 존재하는지 확인
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        return res.json({  
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 유저가 없습니다."
        })
      }
    
      // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) return res.json({ loginSuccess: false, message: '비밀번호가 틀렸습니다' })
        
        // 비밀번호가 맞다면 토큰을 생성
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);

          // 쿠키에 토큰을 저장
          res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
        })
      })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
  // Auth가 true인 경우

  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true, // role 0 일반유저
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if(err) return res.json({ success: false, err });
    return res.status(200).send({ success: true })
  })
}) 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
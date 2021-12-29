// express, morgan, cookieParser, session import
// dotenv, path import
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const pug = require('pug');

//dotenv 미들웨어
//.env 파일 -> process.env
dotenv.config();
const app = express();
// 3000: 서버가 실행될 포트 지정
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'pug');

// morgan 미들웨어: 
//서버로 들어온 요청과 응답을 기록
app.use(morgan('dev'));
// static 미들웨어:
//정적인 파일(html, css, js, img 등)을 제공
app.use(express.static(path.join(__dirname, 'public')));
// body-parser 미들웨어:
// req body의 데이터 -> req.body 객체
app.use(express.json());
app.use(express.urlencoded( {extended:false}) );
// cookie-parser 미들웨어:
// 요청 헤더의 쿠키 해석
app.use(cookieParser(process.env.COOKIE_SECRET));
// express-session 미들웨어:
// 세션 관리용 미들웨어
app.use(session( {
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 600000
    },
    name:'session-cookie'
}));

// user의 name, memo, pf를 저장할 list 만들기
const users = {};

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.sessionID);
    req.session.views = (req.session.views || 0) + 1;
    next();
});
// GET 요청 / 
app.get('/', (req, res) => {
    res.redirect('/home');
});
// GET 요청 /home 
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, './public/home.html'));
});
// GET 요청 /perfume1
app.get('/perfume1', (req, res) => {
    res.sendFile(path.join(__dirname, './public/perfume1.html'));
});
// GET 요청 /perfume2
app.get('/perfume2', (req, res) => {
    res.sendFile(path.join(__dirname, './public/perfume2.html'));
});
// GET 요청 /perfume3
app.get('/perfume3', (req, res) => {
    res.sendFile(path.join(__dirname, './public/perfume3.html'));
});
// GET 요청 /login
// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, './public/login.html'));
// }); 
app.get('/login', (req, res) => {
    res.render('login');
});
// POST 요청 /admit 
app.post('/admit', (req, res) => {
    const {login, password} = req.body;
    if (login == 'eun' && password == '0926') {
        res.cookie('admit', true, {
            maxAge: 600000,
            httpOnly: true,
            secure: false,
            path: '/',
            signed: true
        });
        res.redirect('/');
    } else {
        res.redirect('/login');
    }  
});
// GET 요청 /user
app.get('/user', (req, res) => {
    if (req.signedCookies.admit)
        res.sendFile(path.join(__dirname, './public/user.html'));
    else
        res.redirect('/login');
});
// GET 요청 /users 
app.get('/users', (req, res) => {
    res.send(users);
});
// POST 요청 /user 
app.post('/user', (req, res) => {
    const {name, memo, pf} = req.body;
    const id = Date.now();
    users[id] = {name, memo, pf};
    res.end();
});
// PUT 요청 /user:id
app.put('/user/:id', (req, res) => {
    const {name, memo, pf} = req.body;
    users[req.params.id] = {name, memo, pf};
    res.end();
});
// DELETE 요청 /user:id
app.delete('/user/:id', (req, res) => {
    delete users[req.params.id];
    res.end();
});
// Error-handling middleware
app.use((err, req, res, next) => {
    res.status(404).send(err.message);
});
// 3000번 포트에서 서버를 실행
app.listen(app.get('port'), () => {
    console.log(`App listening at http://localhost:${app.get('port')}`)
});
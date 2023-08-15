const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = 4000;
const secretText = 'superSecret';
const refreshSecretText = 'supersuperSecret';
const expiresIn = '1h';

const posts = [
    {
        username : 'John',
        title : 'Post 1'
    },
    {
        username : 'han',
        title : 'Post 2'
    }
]

const refreshTokenHistory = [];

app.use(express.json());    //바디로 들어오는 데이터를 받아 사용할 수 있돌고     
app.use(cookieParser());    // 쿠키파서도 바디 파싱하는 것처럼 등록이 되어야만 req.cookies를 읽을 수 있다.

app.get('/posts',authMiddleware,(req,res) => {  //두번쨰 파라미터로 해당 경로에서만 사용할 미들웨어를 등록할 수 있따.
    res.json(posts);
});

app.get('/refresh/list',(req,res) => {
    const authHeader = req.headers['authorization'];
    console.log(`${authHeader} 토큰 검증 후 해당 토큰 조회`);

    const temp = {
        'refreshTokenHistory' : refreshTokenHistory,
        'authanticatedToken' : authHeader
    }
    res.json(temp);
});

app.get('/refresh',(req, res) => {
    console.log('request cookies',req.cookies);
    const cookies = req.cookies;

    if(!cookies?.jwt) return res.sendStatus(401);   //optional chaining

    const refreshToken = cookies.jwt;
    if(!refreshTokenHistory.includes(refreshToken)){
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, refreshSecretText, (err, user) => {
        if(err) return res.sendStatus(403);

        const accessToken = jwt.sign({username : user.username}, secretText ,{ expiresIn });
        res.json({ accessToken });
    })

})

app.post('/login', (req,res) => {
    const { username } = req.body;
    console.log(username);
    const accessToken = jwt.sign({'username' : username}, secretText,{expiresIn});
    //sign(payload, secretText);
    const refreshToken = jwt.sign({'username' : username}, refreshSecretText,{expiresIn});
    //refreshToken은 쿠키에 넣을 것임
    res.cookie('jwt',refreshToken, {
        httpOnly : true,
        maxAge: 24 * 60 * 60 * 1000
    });

    refreshTokenHistory.push(refreshToken);

    res.json({ accessToken : accessToken});
})



app.listen(port, () => {
    console.log(`listening port ${port}`);
})


function authMiddleware(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];    //authHeader가 있다면 split해서 가져옴
    if(token == null || token == undefined) {
        return res.sendStatus(401);
    }
    jwt.verify(token, secretText, (err,payload) => {    //만약 에러가 있으면 err에 값이 나오고, 유효하면 payload 값이 들어옴
        if(err) return res.sendStatus(403);

        req.user = payload; //request.setAttribute같은 개념임 user값에 페이로드 값을 넣어서 다른 곳에서도 사용할 수 있도록
        next();
    });
}




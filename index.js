const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 4000;
const secretText = 'superSecret';

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


app.use(express.json());    //바디로 들어오는 데이터를 받아 사용할 수 있돌고

app.get('/posts',authMiddleware,(req,res) => {  //두번쨰 파라미터로 해당 경로에서만 사용할 미들웨어를 등록할 수 있따.
    res.json(posts);
})

app.post('/login', (req,res) => {
    const { username } = req.body;

    const accessToken = jwt.sign(username, secretText);
    //sign(payload, secretText);

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




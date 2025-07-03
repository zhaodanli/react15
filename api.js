let express = require('express');

// 跨域中间件
const cors = require('cors');
// 打印日志
const logger = require('morgan');
const app = express();

app.use(cors({
    allowedHeaders: ["Content-Type"], // 允许跨域响应头
    allowMethods: ["GET", 'POST', "PUT", "DELETE", "OPTIONS"] // 跨域请求方法
}));

app.get('/', (req, res) => {
    res.send(`
        <html>
          <body>
            <div id="root"></div>
            <script>root.innerHTML = 'hello2'</script>
          </body>
        </html>
    `);
});

app.use(express.json());
// 打印日志
app.use(logger('dev'));

// ============== 权限校验部分 ==========
// 处理用户认证或会话
const session = require('express-session');

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'zhufeng'
}))

// 支持表单
app.use(express.urlencoded({ extended: true })); 

// 数据
const users = new Array(10).fill(true).map((item, index) => ({ id: String(index + 1), name: `name${index + 1}` }))

// app.use((req, res, next) => {
//   setTimeout(next, 1000);
// });

app.get('/api/user', (req, res) => {
    res.json(users.map(user => ({ ...user, name: user.name + '#' + new Date().toLocaleString() })));
});

app.post('/api/login', (req, res) => {
    const user = req.body;

    // 用户信息放到会话对象上
    req.session.user = user;
    res.json({
        success: true,
        data: user
    });
});
app.get('/api/logout', (req, res) => {
    req.session.user = null;
    res.json({
        success: true
    });
});
app.get('/api/user', (req, res) => {
    const user = req.session.user;
    if (user) {
        res.json({
            success: true,
            data: user
        });
    } else {
        res.json({
            success: false,
            error: '用户未登录'
        });
    }
});

app.get('/api/validate', (req, res) => {
    const user = req.session.user;
    if (user) {
        res.json({
            success: true,
            data: user
        });
    } else {
        res.json({
            success: false,
            error: '用户未登录'
        });
    }
});


app.listen(8080, '127.0.0.1', () => console.log('started on port 8080'));




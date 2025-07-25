let express = require('express');

// 跨域中间件
const cors = require('cors');
// 打印日志
const logger = require('morgan');
const app = express();

app.use(cors({
    origin: ["http://localhost:8000"],
    credentials: true,
    allowedHeaders: ["Content-Type,Authorization"], // 允许跨域响应头
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
const id = new Date().getTime();
const RoleCodes = {
    root: 'root',
    admin: 'admin',
    member: 'member',
}

const users = [(
    {
        id,
        password: String(id + 2),
        phone: `135529908 ${String(id + 8)}`,
        username: `张三`,
        role: RoleCodes.root,
        createdAt: new Date().toISOString()
    }
)]

app.get('/api/user', (req, res) => {
    res.json({
        data: {
            success: true,
            list: users,
            total: 10,
        },

    });
});

app.post('/api/user', (req, res) => {
    const user = req.body;

    const { password, phone, username, role } = user;

    console.log(user)

    const user_id = {
        id: new Date().getTime(),
        password,
        phone,
        username,
        role,
        createdAt: new Date().toISOString()
    }
    console.log(user_id)
    users.push(user_id)

    // 用户信息放到会话对象上
    req.session.user = user_id;
    res.json({
        data: {
            success: true,
            data: user_id
        }
    });
});

app.get('/signup', (req, res) => {
    let user = req.body;
    user.id = Date.now() + '';
    users.push(user);
    res.json({
        success: true,
        data: user
    });
});

app.post('/api/signin', (req, res) => {
    let user = req.body;
    const { username, password } = user;
    const mubiao = users.find(item => item.username === username);
    if (!mubiao) {
        res.json({
            success: false,
            error: '用户不存在'
        });
    } else if (mubiao.password !== password) {
        res.json({
            success: false,
            error: '密码错误'
        });
    } else {
        res.json({
            success: true,
            data: mubiao
        });
    }
});


app.listen(8080, '127.0.0.1', () => console.log('started on port 8080'));




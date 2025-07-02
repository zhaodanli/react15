let express=require('express');

// 跨域中间件
const cors = require('cors');
// 打印日志
const logger = require('morgan');
const app = express();

app.use(cors({
  allowedHeaders: ["Content-Type"], // 允许跨域响应头
  allowMethods: ["GET", 'POST', "PUT", "DELETE", "OPTIONS"] // 跨域请求方法
}));

app.get('/',(req,res) => {
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

// 数据
const users = new Array(10).fill(true).map((item, index) => ({ id: String(index + 1), name: `name${index + 1}` }))

// app.use((req, res, next) => {
//   setTimeout(next, 1000);
// });

app.get('/api/user', (req, res) => {
  res.json(users.map(user => ({ ...user, name: user.name + '#' + new Date().toLocaleString() })));
});


app.listen(8080, '127.0.0.1', () => console.log('started on port 8080'));




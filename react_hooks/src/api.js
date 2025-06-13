let express = require('express');
let cors = require('cors');
let logger = require('morgan');
let app = express();

app.use(logger('dev'));
app.use(cors());

app.get('/api/users', function (req, res) {
    let currentPage = parseInt(req.query.currentPage);
    let pageSize = parseInt(req.query.pageSize);
    let total = 25;
    let list = [];
    let offset = (currentPage - 1) * pageSize;
    for (let i = offset; i < offset + pageSize; i++) {
        list.push({ id: i + 1, name: 'name' + (i + 1) });
    }
    res.json({
        currentPage,
        pageSize,
        totalPage: Math.ceil(total / pageSize),
        list
    });
});

/**
 * 确认监听地址
 * 你的 app.listen(8000, ...) 默认监听 0.0.0.0（所有地址），但有时 macOS 下可能只监听 IPv6 或 127.0.0.1。
 * 尝试明确监听 127.0.0.1：
 */
app.listen(8000, '127.0.0.1', () => {
    console.log('server started at port 8000');
});

// 启动 nodemon api.js
// 测试 http://127.0.0.1:8000/api/users?currentPage=1&pageSize=5
// lsof -i :8000查看端口状态
// killall node
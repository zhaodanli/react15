const next = require('next');
const app = next({ dev:false });
const handler = app.getRequestHandler();
app.prepare().then(() => {
    let express = require("express");
    let bodyParser = require("body-parser");
    let {UserModel} = require('./model');
    let session = require("express-session");
    let config = require('./config');
    let MongoStore = require('connect-mongo')(session);
    let app = express();
    //.......
    app.get('*', async (req, res) => {
        await handler(req, res);
    })
    app.listen(5000, () => {
        console.log('服务器在 8080 端口启动!');
    });
});
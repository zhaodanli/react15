import React from 'react';
import { renderToString } from 'react-dom/server';

import routesConfig from '../routesConfig';
import { StaticRouter } from "react-router-dom/server";
import proxy from 'express-http-proxy';
import { getStore } from '../store';
import { matchRoutes } from 'react-router-dom';
import App from '../App';

let express = require('express');
let app = express();

app.use(express.static('public'));

app.use('/api', proxy('http://localhost:8080', {
    proxyReqPathResolver(req) {
        console.log('store', store.getState())
        return `${req.url}`;
    }
}));

app.get(/^\/(.+)$/, (req, res) => {
    if(req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
        req.url = '/'
    }
    const routeMatches = matchRoutes(routesConfig, { pathname: req.url });

    console.log('routeMatches', routeMatches)

    if (routeMatches) {
        const store = getStore();
        const promises = routeMatches
            .map(({ route }) => route.element.type.loadData && route.element.type.loadData(store).then(data => data, error => error))
            .concat(App.loadData && App.loadData(store))
            .filter(Boolean)
        Promise.all(promises).then(() => {
            const html = renderToString(
                <StaticRouter location={req.url}><App store={store} /></StaticRouter>
            );

            console.log('store', store.getState())

            res.send(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>ssr</title>
                    </head>
                    <body>
                        <div id="root">${html}</div>
                       <script>
                            var context = {
                                state:${JSON.stringify(store.getState())}
                            }
                        </script>
                    </body>
                </html>
            `);
        })
    } else {
        res.sendStatus(404);
    }
});
app.listen(3000, (err) => {
    if (err) {
        return console.error('启动服务器失败:', err);
    }
    console.log('服务器正在运行在 http://localhost:3000');
});

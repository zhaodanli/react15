import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from "react-router-dom/server";
import proxy from 'express-http-proxy';
import App from '../App';
import { getServerStore } from '../store';
import { matchRoutes } from 'react-router-dom';
import routesConfig from '../routesConfig';
const express = require('express');
const app = express();
app.use(express.static('public'));

app.use('/api', proxy('http://localhost:8080', {
    proxyReqPathResolver(req) {
        return `${req.url}`;
    }
}));

app.get(/^\/(.+)$/, (req, res) => {
    if(req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
        req.url = '/'
    }

    const routeMatches = matchRoutes(routesConfig, { pathname: req.url });

    if (routeMatches) {
        const store = getServerStore();
        const promises = routeMatches
            .map(({ route }) => route.element.type.loadData && route.element.type.loadData(store).then(data => data, error => error))
            .concat(App.loadData && App.loadData(store))
            .filter(Boolean)
        Promise.all(promises).then(() => {
            const html = renderToString(
                <StaticRouter location={req.url}>
                    <App store={store} />
                </StaticRouter>
            );
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
                    <script src="/client.js"></script>
                </body>
                </html>
            `);
        })
    } else {
        res.sendStatus(404);
    }
});
app.listen(3000, () => console.log("server started on 3000"));
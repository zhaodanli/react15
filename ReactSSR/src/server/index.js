import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from "react-router-dom/server";
import proxy from 'express-http-proxy';
import StyleContext from 'isomorphic-style-loader-react18/StyleContext'
import App from '../App';
import { getServerStore } from '../store';
import { matchRoutes } from 'react-router-dom';
import routesConfig from '../routesConfig';
// import { Helmet } from 'react-helmet';

const express = require('express');
const app = express();

app.use(express.static('public'));

app.use('/api', proxy('http://localhost:8080', {
    proxyReqPathResolver(req) {
        return `/api${req.url}`;
    }
}));

app.get(/^\/(.*)$/, (req, res) => {
    if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
        req.url = '/'
    }

    const routeMatches = matchRoutes(routesConfig, { pathname: req.url });

    if (routeMatches) {
        const { store } = getServerStore(req);

        const promises = routeMatches
            .map(({ route }) => route.element.type.loadData && route.element.type.loadData(store).then(data => data, error => error))
            .concat(App.loadData && App.loadData(store))
            .filter(Boolean)

        Promise.all(promises).then((data) => {

            // 服务端坐重定向
            if (req.url === '/profile' && (!(store.getState().auth.user))) {
                return res.redirect('/login');
            } else if (routeMatches[routeMatches.length - 1].route.path === '*') {
                res.statusCode = 404;
            }

            // 支持css
            const css = new Set()
            const insertCss = (...styles) => styles.forEach(style => {
                css.add(style._getCss())
            })

            // 支持SEO
            // let helmet = Helmet.renderStatic();

            const html = renderToString(
                <StaticRouter location={req.url}>
                    <StyleContext.Provider value={{ insertCss }}>
                        <App store={store} />
                    </StyleContext.Provider>
                </StaticRouter>
            );

                        // ${helmet.title.toString()}
                        // ${helmet.meta.toString()}
            let style = null;

            console.log('css', css.size)
            if(css.size > 0) {
                style = `\n<style>${[...css].join('')}</style>`
            }
            res.send(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>ssr</title>
                        ${style}
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
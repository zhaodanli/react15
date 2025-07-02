import React from 'react';
import { renderToString } from 'react-dom/server';

import routesConfig from '../routesConfig';
import { StaticRouter } from "react-router-dom/server";
import { matchRoutes } from 'react-router-dom';
import App from '../App';

let express = require('express');
let app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    const html = renderToString(
        <StaticRouter location={req.url}><App /></StaticRouter>
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
                <script src="/client.js"></script>
            </body>
        </html>
    `);
});
app.listen(3000);


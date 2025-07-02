import React from 'react';
import Home from './routes/Home';
import Counter from './routes/Counter';

import User from './routes/User';
import UserAdd from './routes/UserAdd';
import UserList from './routes/UserList';

export default [
  {
    path: '/',
    element: <Home />,
    index: true
  },
  {
    path: '/counter',
    element: <Counter />
  },
  {
    path: '/user',
    element: <User />,
    children: [
      {
        path: '/user/List',
        element: <UserList />,
        index: true
      },
      {
        path: '/user/Add',
        element: <UserAdd />
      }
    ]
  }
]
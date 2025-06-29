export default [
    { path: '/', redirect: '/home' },
    { icon: 'HomeOutlined', name: '首页', path: '/home', component: './home/index' },
    { icon: 'ProfileOutlined', name: '个人中心', path: '/profile', component: './profile/index'},
    // { icon: 'ProfileOutlined', name: '产品可看', path: '/profile', component: './profile/index',  },
    {
        icon: 'UserOutlined',
        name: '用户管理',
        path: '/user',
        component: './user/index',
        routes: [
            { name: '添加用户', path: '/user/add', component: './user/add/index' },
            { name: '用户列表', path: '/user/list', component: './user/list/index' },
            { name: '用户详情', path: '/user/detail/:id', component: './user/detail/index', hideInMenu: true },
        ],
    },
]
export default [
    { path: '/', redirect: '/home' },
    { icon: 'HomeOutlined', name: '首页', path: '/home', component: './home/index' },
    { icon: 'ProfileOutlined', name: '个人中心', path: '/profile', component: './profile/index' },
    // { icon: 'ProfileOutlined', name: '产品可看', path: '/profile', component: './profile/index',  },
    { icon: 'ProfileOutlined', name: '长列表', path: '/fixedSizeList', component: './fixedSizeList/index', },
    {
        icon: 'UserOutlined',
        name: '用户管理',
        path: '/user',
        component: './user/index',
        routes: [
            { name: '添加用户', path: '/user/add', component: './user/add/index', access: 'adminCan' },
            { name: '用户列表', path: '/user/list', component: './user/list/index', access: 'memberCan' },
            { name: '用户详情', path: '/user/detail/:id', component: './user/detail/index', hideInMenu: true, access: 'memberCan' },
        ],
    },
    {
        icon: 'UserOutlined',
        name: '埋点管理',
        path: '/trackManage',
        component: './trackManage/index',
        routes: [
            { name: '新增页面', path: '/trackManage/pageList/edit', component: './trackManage/pageList/edit/index'},
            { name: '页面列表', path: '/trackManage/pageList', component: './trackManage/pageList/index' },
            { name: '事件列表', path: '/trackManage/eventList', component: './trackManage/eventList/index', hideInMenu: true  },
            { name: '参数列表', path: '/trackManage/paramList', component: './trackManage/paramList/index' },
        ],
    },
    {
        name: '注册',
        path: '/signup',
        component: './signup/index',
        hideInMenu: true,
        layout: false
    },
    {
        name: '登录',
        path: '/signin',
        component: './signin/index',
        hideInMenu: true,
        layout: false
    }
]
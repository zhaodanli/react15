
const params = [
    { param_id: 'from', name: '触发来源', desc: '首页', enum: {"home": "首页", "profile": "个人中心页"}, events: [], pages: [], Industry: []  },
    { page_id: 'prefile', name: '个人中心页', desc: '个人中心页', enum: {"home": "首页", "profile": "个人中心页"}, events: [], pages: [], Industry: []},
];

export default {
    'GET /api/v1/queryParamList': (req: any, res: any) => {
        res.json({
            success: true,
            data: { list: params },
            errorCode: 0,
        });
    },
    'PUT /api/v1/param/': (req: any, res: any) => {
        res.json({
            success: true,
            errorCode: 0,
        });
    },
};

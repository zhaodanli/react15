
const pages = [
    { page_id: 'home', page_name: '首页', dsc: '首页', events: ['buttonClick'] },
    { page_id: 'prefile', page_name: '个人中心页', dsc: '个人中心页', events: ['buttonShow'] },
    { page_id: 'prefile2', page_name: '详情页', dsc: '详情页', events: ['buttonShow'] },
    { page_id: 'prefile3', page_name: '列表页', dsc: '列表页', events: ['buttonShow'] },
    { page_id: 'prefile4', page_name: '订单页', dsc: '订单页', events: ['buttonShow'] },
    { page_id: 'prefile5', page_name: '发票页', dsc: '发票页', events: ['buttonShow'] },
    { page_id: 'prefile6', page_name: '中间页', dsc: '中间页', events: ['buttonShow'] },
    { page_id: 'prefile7', page_name: '付款页', dsc: '付款页', events: ['buttonShow'] },
    { page_id: 'prefile8', page_name: '退款页', dsc: '退款页', events: ['buttonShow'] },
    { page_id: 'prefile9', page_name: '商品详情页', dsc: '商品详情页', events: ['buttonShow'] },
    { page_id: 'prefile9', page_name: '货架页', dsc: '货架页', events: ['buttonShow'] },
];

export default {
    'GET /api/v1/queryPageList': (req: any, res: any) => {
        res.json({
            massage: '',
            data: { list: pages },
            code: 0,
        });
    },
    'PUT /api/v1/page/': (req: any, res: any) => {
        res.json({
            success: true,
            errorCode: 0,
        });
    },
};

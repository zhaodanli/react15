const events = [
    { event_id: 'Acard_click', event_name: 'A 卡点击事件', dsc: '点击事件' },
    { event_id: 'Acard_show', event_name: 'A 卡曝光事件', dsc: '曝光事件' },
    { event_id: 'Acard_click', event_name: 'B 卡点击事件', dsc: '点击事件' },
    { event_id: 'Acard_show', event_name: 'B 卡曝光事件', dsc: '曝光事件' },
    { event_id: 'Acard_click', event_name: 'C 卡点击事件', dsc: '点击事件' },
    { event_id: 'Acard_show', event_name: 'C 卡曝光事件', dsc: '曝光事件' },
    { event_id: 'Acard_click', event_name: 'D 卡点击事件', dsc: '点击事件' },
    { event_id: 'Acard_show', event_name: 'D 卡曝光事件', dsc: '曝光事件' },
];

export default {
    'GET /api/v1/queryEventList': (req: any, res: any) => {
        res.json({
            success: true,
            data: { list: events },
            errorCode: 0,
        });
    },
    'PUT /api/v1/event/': (req: any, res: any) => {
        res.json({
            success: true,
            errorCode: 0,
        });
    },
};

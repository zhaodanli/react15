// const { produce } = require("immer");
const { produce } = require("./core");

let baseState = {
    ids: [1],
    pos: {
        x: 1,
        y: 1
    },
    list: ['1', '2'],
    user: {
        name: 'Alice',
        age: 25,
        address: {
            city: 'New York',
            zip: '10001'
        }
    }
}

let result = produce(baseState, (draft) => {
    draft.user.age = 26; // 修改年龄
    draft.user.address.city = 'Los Angeles'; // 修改城市

    draft.ids.push(2);
    draft.list.push('3');
})
console.log(baseState);
console.log(result);

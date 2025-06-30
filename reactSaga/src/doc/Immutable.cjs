const immutable = require("immutable");
const assert = require("assert");

// 基础对象
// let obj1 = immutable.Map({ name: 'zfpx', age: 8 });
// let obj2 = obj1.set('name', 'zfpx2');
// let obj3 = obj2.update('age', x => x + 1);
// let obj4 = obj3.merge({ home: '北京' });
// console.log(
//     obj1._root, 
//     obj2._root, 
//     obj3._root, 
//     obj4._root
// );


// map 相关
// let obj6 = immutable.fromJS({ user: { name: 'zfpx', age: 8 }, 'k': 'v' });
// let obj7 = obj6.setIn(['user', 'name'], 'zfpx2');
// let obj8 = obj7.updateIn(['user', 'age'], x => x + 1);
// let obj9 = obj8.mergeIn(["user"], { home: '北京' });
// console.log(
//     obj6._root.entries[0][1]._root, 
//     obj7._root.entries[0][1]._root, 
//     obj8._root.entries[0][1]._root, 
//     obj9._root.entries[0][1]._root, 
// );

// console.log(obj6.get('user'));
// console.log(obj6.getIn(['user', 'name']));
// console.log(...obj6.keys());
// console.log(...obj6.values());
// console.log(...obj6.entries());

// var map1 = immutable.Map({ name: 'zfpx', age: 9 });
// var map2 = immutable.Map({ name: 'zfpx', age: 9 });
// assert(map1 !== map2);
// assert(Object.is(map1, map2) === false);
// assert(immutable.is(map1, map2) === true); 

// list 相关
let arr1 = immutable.fromJS([1, 2, 3]);
console.log(arr1.size);
let arr2 = arr1.push(4);
console.log(arr2);
let arr3 = arr2.pop();
console.log(arr3);
let arr4 = arr3.update(2, x => x + 1);
console.log(arr4);
let arr5 = arr4.concat([5, 6]);
console.log(arr5);
let arr6 = arr5.map(item => item * 2);
console.log(arr6);
let arr7 = arr6.filter(item => item >= 10);
console.log(arr7);
console.log(arr7.get(0));
console.log(arr7.includes(10));
console.log(arr7.last());
let val = arr7.reduce((val, item) => val + item, 0);
console.log(val);
console.log(arr7.count());
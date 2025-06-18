import { 
    match, // 用于路径匹配和参数提取（最常用）
    compile, // 用于根据参数生成路径
    parse, // 将路径模板解析为 token 数组
} from 'path-to-regexp';


/** 
 * 路径匹配与参数提取：用 match
 * 路径生成：用 compile
 * 模板分析：用 parse
 * 正则匹配：可用 pathToRegexp，但推荐用 match
 */

// 1. 用于路径匹配和参数提取（最常用）
const matchUser = match('/user/:id');
const result = matchUser('/user/123');
console.log('result', result); 
// 匹配成功：{ path: '/user/123', index: 0, params: { id: '123' } }
console.log(matchUser('/user'));
// false

// 2. 用于根据参数生成路径
// 新版 path-to-regexp 的 compile 方法要求参数必须是字符串（string），而你传入了数字 123。
const toPath = compile('/user/:id');
console.log(toPath({ id: '123' }));
// 输出：/user/123

// 3. 将路径模板解析为 token 数组
const tokens = parse('/user/:id');
console.log(tokens);
// 输出：['/user/', { name: 'id', prefix: '/', ... }]
// TokenData {
//   tokens: [ { type: 'text', value: '/user/' }, { type: 'param', name: 'id' } ]
// }

// 路由匹配+参数提取
const matcher2 = match('/article/:category/:id');
const res = matcher2('/article/js/100');
if (res) {
  console.log(res.params); // { category: 'js', id: '100' }
}
// 生成路径
const toPath2 = compile('/article/:category/:id');
console.log(toPath2({ category: 'js', id: '100' })); // /article/js/100
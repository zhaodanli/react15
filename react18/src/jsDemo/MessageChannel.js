/**
 * 目前 requestIdleCallback 目前只有Chrome支持
 * 所以目前 React利用 MessageChannel模拟了requestIdleCallback，将回调延迟到绘制操作之后执行
 * MessageChannel 创建两个端口，一个端口发数据，另一个接收数据
 */

var channel = new MessageChannel();
var port1 = channel.port1;
var port2 = channel.port2
port1.onmessage = function(event) {
    console.log("port1收到来自port2的数据：" + event.data);
}
port2.onmessage = function(event) {
    console.log("port2收到来自port1的数据：" + event.data);
}
port1.postMessage("发送给port2");
port2.postMessage("发送给port1");
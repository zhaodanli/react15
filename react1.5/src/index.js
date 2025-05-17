import React from './react';
import ReactDOM from './react-dom';

// import React from 'react';
// import ReactDOM from 'react-dom/client';

// 基础组件
import ReactBase from './IndeBaseComponent';

// 高阶组件
// import ReactHightComponent from './ReactHightComponent'
// 反向继承
import ReverseInstansComponent from './ReverseInstansComponent'

// ReactDOM.render(
//   <ReactBase />,
//   document.getElementById('root')
// );

/** ============ 高阶组件 ============*/ 
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<ReactHightComponent />);
// root.render(<ReverseInstansComponent title="标题" />);

/** ============ 反向继承 ============ */ 
// ReactDOM.render(
//   <ReverseInstansComponent />,
//   document.getElementById('root')
// );

/** =========== pureComponent ============== */

// import PureAndMemoComponent from './PureAndMemoComponent'
// ReactDOM.render(
//   <PureAndMemoComponent />, document.getElementById('root'));

/** 
 * potal 
 * React v16增加了对Portal的直接支持
 * 它可以把JSX渲染到一个单独的DOM节点中 
  */
import PortalComponent from './PortalComponent';

ReactDOM.render(
  <PortalComponent />, document.getElementById('root'));

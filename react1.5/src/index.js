import React from './react';
import ReactDOM from './react-dom';
// import ReactDOM from 'react-dom/client';

import ReactBase from './IndeBaseComponent';

// 高阶组件
// import ReactHightComponent from './ReactHightComponent'
// 反向继承
// import ReverseInstans from './ReverseInstans'

/** react 基础功能实现 */
ReactDOM.render(
  <ReactBase />,
  document.getElementById('root')
);

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<ReactHightComponent />);
// root.render(<ReverseInstans title="标题" />);

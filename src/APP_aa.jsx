import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';


import SuspensePage from './Page/Suspense/SuspensePage';
import SuspenseList from './Page/Suspense/SuspenseList';

import StartTransition from './Page/StartTransition';
import UseDeferredValue from './Page/UseDeferredValue';
import BatchState from './Page/BatchState';

/** 测试react 18 新特性
 * 
 * @returns 
 */
function APP() {
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12" style={{ padding: 10 }}>
                    <BrowserRouter>
                        <ul className="nav nav-tabs">
                            <li><Link to="/suspense">suspense</Link></li>
                            <li><Link to="/suspenseList">SuspenseList</Link></li>

                            <li><Link to="/startTransition">startTransition</Link></li>
                            <li><Link to="/useDeferredValue">useDeferredValue</Link></li>
                            <li><Link to="/batchState">BatchState</Link></li>
                            
                        </ul>
                        <Routes>
                            <Route path="/suspense" element={<SuspensePage />} />
                             <Route path="/suspenseList" element={<SuspenseList />} />

                            <Route path="/startTransition" element={<StartTransition />} />
                            <Route path="/useDeferredValue" element={<UseDeferredValue />} />
                            <Route path="/batchState" element={<BatchState />} />
                           
                        </Routes>
                    </BrowserRouter>
                </div>
                <div style={{ display: 'flex', flex: 1, height: '1000px'}}></div>
            </div>
        </div>
    )
}

export default APP;
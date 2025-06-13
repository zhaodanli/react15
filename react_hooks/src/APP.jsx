import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

import Table from './Page/Table';
import Drag from './Page/Drag';
import Form from './Page/Form';
import Circle from './Page/Circle';

function APP() {
    return (
        <div className="container">
        <div className="row">
            <div className="col-md-12" style={{ padding: 10 }}>
                <BrowserRouter>
                    <ul className="nav nav-tabs">
                        <li><Link to="/table">Table</Link></li>
                        <li><Link to="/drag">Drag</Link></li>
                        <li><Link to="/form">Form</Link></li>
                        <li><Link to="/circle">Circle</Link></li>
                    </ul>
                    <Routes>
                        <Route path="/table" element={<Table />} />
                        <Route path="/drag" element={<Drag />} />
                        <Route path="/form" element={<Form />} />
                        <Route path="/circle" element={<Circle />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    </div>
    )
}

export default APP;
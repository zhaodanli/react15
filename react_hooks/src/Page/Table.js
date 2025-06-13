import React from 'react';
import useRequest from './../hooks/useRequest';
const URL = 'http://localhost:8000/api/users';

export default function Table() {
    const [ data, options,setOptions ] = useRequest(URL);
    const { currentPage, totalPage, list } = data;

    return (
        <>
            {/* 内容部分 */}
            <table className="table table-striped">
                <thead>
                    <tr><td>ID</td><td>姓名</td></tr>
                </thead>
                <tbody>
                    {
                        list.map(item => (<tr key={item.id}><td>{item.id}</td><td>{item.name}</td></tr>))
                    }
                </tbody>
            </table>

            {/* 页码部分 */}
            <nav>
                <ul className="pagination">
                    {
                        currentPage > 1 && (
                        <li>
                            <button className="btn btn-default" href="#" onClick={() => setOptions({ ...options,currentPage: currentPage - 1 })}>
                                <span >&laquo;</span>
                            </button>
                        </li>
                        )
                    }
                    {
                        new Array(totalPage).fill(0).map((item, index) => (
                            <li key={index}>
                                <button 
                                    className = { 
                                        index+1 === currentPage ?
                                            'btn btn-success':
                                            'btn btn-default'
                                    } 
                                    onClick={
                                        () => setOptions({ ...options,currentPage: index + 1 })
                                    }
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))
                    }
                    {
                        currentPage < totalPage && (
                            <li>
                                <button className="btn btn-default"  onClick={() => setOptions({...options, currentPage: currentPage + 1 })}>
                                    <span>&raquo;</span>
                                </button>
                            </li>
                        )
                    }
                </ul>
            </nav>
        </>
    )
}
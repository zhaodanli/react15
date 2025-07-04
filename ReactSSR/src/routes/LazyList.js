import React, { useEffect, Suspense, useRef } from 'react';

export default function LazyList({ resource }) {
    const userList = resource.read();

    console.log('userList', userList)
    return (
        <ul>
            {
                userList?.map(item => <li key={item.id}>{item.name}</li>)
            }
        </ul>
    )
}
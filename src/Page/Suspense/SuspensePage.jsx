import React, { Component } from 'react'
import ErrorBoundary from './ErrorBoundary';
import { fetchUser } from './fakeApi';
import { wrapPromise } from './utils.jsx';
import Suspense from './Suspense';

const userPromise = fetchUser('1');
const userResource = wrapPromise(userPromise);

class SuspensePage extends Component {
    render() {
        return (
            <Suspense fallback={<h3>Loading User......</h3>}>
                <ErrorBoundary>
                    <User />
                </ErrorBoundary>
            </Suspense >
        );
    }
}
function User() {
    const user = userResource.read();

    return <div>{user.id}:{user.name}</div>
}

export default SuspensePage;
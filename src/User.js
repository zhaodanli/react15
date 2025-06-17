import React from 'react';

const userPromise = fetchUser(1);
const userResource = wrapPromise(userPromise);
function User() {
    const user = userResource.read();
    return <div>ID:{user.id}</div>
}
export default User;

function fetchUser(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id });
        }, 10000);
    });
}
function wrapPromise(promise) {
    let status = "pending";
    let result;
    let suspender = promise.then(
        (r) => {
            status = "success";
            result = r;
        },
        (e) => {
            status = "error";
            result = e;
        }
    );
    return {
        read() {
            if (status === "pending") {
                throw suspender;
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        }
    };
}
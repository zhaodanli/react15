import React from "react";
import { Navigate } from "../react-router-dom";

/** 渲染前拦截+条件渲染+重定向 */
function Protected(props) {
    let { component: RouteComponent, path } = props;

    console.log(localStorage.getItem("login"))

    return (
        localStorage.getItem("login") ? (
            <RouteComponent />
        ) : (
            <Navigate to={{ pathname: "/login", state: { from: path } }} />
        )
    )
}

export default Protected;
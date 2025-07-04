import React from "react";
import UserLayout from "../";
import request from '../../../utils/request';

function UserDetail(props) {
    return (
        <UserLayout>
            <p>ID:{props.user.id}</p>
            <p>ID:{props.user.name}</p>
        </UserLayout>
    );
}

UserDetail.getInitialProps = async (ctx) => {
    let response = await request({ url: `/api/users/${ctx.query.id}`, method: 'GET' }).then(res => res.data);
    return { user: response.data.data };
    //   return { user: { id: ctx.query.id } };
};


export default UserDetail;
import React from "react";
import UserLayout from "../";
import request from '@/utils/request';
// import UserInfo from '@/components/UserInfo';
import dynamic from 'next/dynamic';
const DynamicUserInfo = dynamic(() => import('@/components/UserInfo'));

function UserDetail(props) {
    const [show, setShow] = React.useState(false);

    return (
        <UserLayout>
            <p>ID:{props.user.id}</p>
            <p>ID:{props.user.name}</p>
            <button onClick={() => setShow(!show)}>显示/隐藏</button>
            {
                show && props.user && <DynamicUserInfo user={props.user} />
            }
        </UserLayout >
    );
}

UserDetail.getInitialProps = async (ctx) => {
    let response = await request({ url: `/api/users/${ctx.query.id}`, method: 'GET' }).then(res => res.data);
    return { user: response.data };
    //   return { user: { id: ctx.query.id } };
};


export default UserDetail;
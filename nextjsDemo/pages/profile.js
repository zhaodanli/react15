import router from 'next/router';
import { connect } from 'react-redux';
import request from '../utils/request';

function Profile(props) {
    let { currentUser } = props;
    return (
        <div>
            <p>当前登录用户:{currentUser?.name}</p>
            <button onClick={() => router.back()}>返回</button>
        </div>
    )
}

Profile.getInitialProps = async function (ctx) {
    let options = { url: '/api/validate' };
    if (ctx.req && ctx.req.headers.cookie) {
        options.headers = options.headers || {};
        options.headers.cookie = ctx.req.headers.cookie;
    }
    let response = await request(options).then(res => res.data);
    if (response.success) {
        return { currentUser: response.data };
    } else {
        if (ctx.req) {
            ctx.res.writeHead(303, { Location: '/login' })
            ctx.res.end()
        } else {
            router.push('/login');
        }
        return {};
    }
}

const WrappedProfile = connect(
    state => state
)(Profile);
export default WrappedProfile;
import React from "react";
import { useNavigate } from '../react-router-dom';

function Home(props) {
    let navigate = useNavigate();
    function navigateTo() {
        navigate('/profile');
    }
    return (
        <div>
            Home
            <button onClick={navigateTo}>跳转到/profile</button>
        </div>
    )
}
export default Home;
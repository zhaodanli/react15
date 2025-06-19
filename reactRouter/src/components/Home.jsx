import React from "react";
import { useNavigate } from '../react-router-dom';

function Home(props) {
    let navigate = useNavigate();

    function navigateTo() {
        navigate('/profile');
    }

    const handleClear = () => {
        localStorage.removeItem("login");
    }

    return (
        <div>
            Home
            <button onClick={navigateTo}>跳转到/profile</button>
            <button onClick={handleClear}>清空信息</button>
        </div>
    )
}
export default Home;
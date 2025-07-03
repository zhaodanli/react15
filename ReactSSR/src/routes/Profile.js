import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const user = useSelector(state => state.auth.user);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  },[]);

  return <div>用户名:{user && user.name}</div>
}
export default Profile;
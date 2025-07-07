import { Dropdown, Menu } from 'antd'
import { LoginOutlined } from '@ant-design/icons';
import { useModel, history } from '@umijs/max';

export default function HeaderMenu() {
  const { initialState, setInitialState } = useModel('@@initialState');
  const logoutClick = () => {
    localStorage.removeItem('token');
    setInitialState({ currentUser: null });
    history.push('/signin');
  }
  const menu = (
    <Menu items={[
      {
        key: 'logout',
        label: (
          <span>退出</span>
        ),
        icon: <LoginOutlined />,
        onClick: logoutClick
      }
    ]} />
  )
  return (
    <Dropdown.Button overlay={menu}>
      {initialState?.currentUser?.username}
    </Dropdown.Button>
  )
}
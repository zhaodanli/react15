import Link from "next/link";

function UserLayout(props) {
  return (
    <div>
      <div>
        <ul>
          <li>
            <Link href="/user/list">
              <a>用户列表</a>
            </Link>
          </li>
          <li>
            <Link href="/user/add">
              <a>添加用户</a>
            </Link>
          </li>
        </ul>
        <div>{props.children}</div>
      </div>
    </div>
  );
}
export default UserLayout;
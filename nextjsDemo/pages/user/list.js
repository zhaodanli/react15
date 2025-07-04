import Link from "next/link";
import UserLayout from "./";

function UseList(props) {
    return (
        <UserLayout>
            <ul>
                {props.list.map((user) => (
                    <li key={user.id}>
                        <Link href={`/user/detail/${user.id}`}>{user.name}</Link>
                    </li>
                ))}
            </ul>
        </UserLayout>
    );
}
UseList.getInitialProps = async () => {
    let list = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
    ];
    return { list };
};
export default UseList;
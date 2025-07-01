
import useUsers from './useUsers'

export default function Counter({ queryKey }) {
    // const { data } = request.get('/users')
    const { data, isLoading, isError, isFetching } = useUsers(queryKey)

    if (isLoading) return <div>加载中.......</div>
    if (isError) return <div>加载失败</div>

    return (
        (<ul>
            {
                data?.map((user) => <li key={user.id}>{user.name} {Date.now()}</li>)
            }
            {isFetching && <div>更在更新数据...</div>}
        </ul>)
    )
}
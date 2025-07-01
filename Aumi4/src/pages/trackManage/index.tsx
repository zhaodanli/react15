import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from 'react-router-dom';

export default function Page() {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
}

import { Link, history, useNavigate } from '@umijs/max';
import { Button } from 'antd';
import { PageContainer } from '@ant-design/pro-components';

export default function Page() {
  // react-dom-v6
  const navigate = useNavigate();

  return (
    <PageContainer>
      <h1 className={`text-lg font-bold text-red-600`}>首页</h1>
      <Link to="/profile">个人中心</Link>
      <Button type='primary' onClick={() => history.push('/profile')}>查询</Button>
      <Button type='dashed' onClick={() => navigate('/profile')}>页面</Button>
      <Button type='primary' onClick={() => history.push('/profile')}>事件</Button>
      <Button type='dashed' onClick={() => navigate('/profile')}>参数</Button>
      <Button type='primary' onClick={() => history.push('/profile')}>个人中心</Button>
      <Button type='dashed' onClick={() => navigate('/profile')}>个人中心</Button>
      <Button type='primary' onClick={() => history.push('/profile')}>个人中心</Button>
      <Button type='dashed' onClick={() => navigate('/profile')}>个人中心</Button>
      <Button type='primary' onClick={() => history.push('/profile')}>个人中心</Button>
      <Button type='dashed' onClick={() => navigate('/profile')}>个人中心</Button>
      产品介绍
      以往，开发团队在进行 埋点设计、管理和测试时，以及埋点上报数据管理，经常要在多平台之间频繁切换。这种方式不仅容易导致数据同步不一致，还阻碍了团队成员之间的协作，最终影响开发效率。
      面对这些问题，如果有一个一体化的平台，能将 API 的设计、开发、测试，获取数据等所有环节整合在一起，会很方便！
      团队成员可以共享一份清晰的埋点文档，产品和测试可以更快根据文档快速开发并调试，

      将两个平台功能合一

      埋点管理：埋点添加，修改，测试。 权限流转（创建 - 开发 - 提测流程）
      埋点数据回流：针对交易链路的数据看板
      组件管理

      而看数平台正是这样一个一站式 API 开发协作平台

      Apifox 如何整合你的工作流?

      在 Apifox 中，所有操作都围绕 API 定义 （API specification） 展开。每个角色都可以直接利用设计好的 API 来发送请求、创建接口用例、生成 Mock 数据和发布文档。具体来说：
      API 设计者： 可以在 Apifox 中通过可视化界面创建 API，或者导入现有的文件 （例如 OpenAPI/Swagger 的.yaml或.json文件），并支持使用迭代分支来设计 API。
      后端开发： 可以直接根据定义好的 API 来发送请求，或生成后端业务代码。
      前端开发： 不用等后端完成，可以直接基于 API 定义生成 Mock 数据。
      测试工程师： 可以基于 API 定义自动生成接口用例，提供可视化界面来编排测试场景，并集成 CI/CD 流水线。
      API 文档维护者： 可以一键生成规范的 API 文档，文档会随 API 定义的更新自动保持同步。
      有组织的 API 管理
      良好的开发体验
      这个工作流程可以带来以下优势：
      紧密协作： 
    </PageContainer>
  );
}

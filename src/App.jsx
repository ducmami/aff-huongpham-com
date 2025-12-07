import { Layout, Typography } from 'antd'
import Home from './pages/Home.jsx'
import './App.css'

const { Header, Content } = Layout

function App() {
  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <Typography.Title level={4} className="brand">
        HuongPham Affiliate
        </Typography.Title>
      </Header>
      <Content className="app-content">
        <Home />
      </Content>
    </Layout>
  )
}

export default App

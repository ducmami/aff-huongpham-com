import { Col, Row, Space } from 'antd'
import CustomerInfo from '../components/CustomerInfo.jsx'
import AffiliateInput from '../components/AffiliateInput.jsx'
import AdsContainer from '../components/AdsContainer.jsx'

function Home() {
  return (
    <div className="page-wrap">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8} lg={7} xl={6}>
          <CustomerInfo />
        </Col>
        <Col xs={24} md={16} lg={17} xl={18}>
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <AffiliateInput />
            <AdsContainer />
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default Home


import React, { useState } from 'react';
import { Layout, Menu, Card, Button, Spin, Alert } from 'antd';
import { UnorderedListOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const { Sider, Content } = Layout;

const AnalyzePage = () => {
  const [analysis, setAnalysis] = useState(''); // Store the analysis from the API
  const [loading, setLoading] = useState(false); // Loading state for the button
  const [error, setError] = useState(null); // Error state if API call fails

  const items = [
    { key: '1', icon: <HomeOutlined />, label: <Link to="/home">{'Appliance'}</Link> },
    { key: '2', icon: <SettingOutlined />, label: <Link to="/analyze">{'Advice'}</Link> },
  ];

  // Function to call the backend API and fetch ChatGPT analysis
  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace 'user1' with the actual user if needed
      const response = await axios.get('http://127.0.0.1:5000/analyze?user=user1'); 
      setAnalysis(response.data.analysis); // Set the analysis response
    } catch (err) {
      setError('Failed to fetch analysis'); // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Sider theme="light" width={200}>
        <div className="logo" style={{ fontSize: '24px', color: '#87CEFA' }}>
          <UnorderedListOutlined />
        </div>
        <Menu mode="vertical" defaultSelectedKeys={['1']} items={items} />
      </Sider>
      <Layout>
        <Content style={{ padding: '20px' }}>
          <Card title="Energy Usage Analysis">
            <Button type="primary" onClick={fetchAnalysis} disabled={loading}>
              {loading ? 'Fetching Analysis...' : 'Get Energy Usage Analysis'}
            </Button>
            <div style={{ marginTop: '20px' }}>
              {loading && <Spin />}
              {error && <Alert message={error} type="error" />}
              {!loading && analysis && (
                <Card title="GPT Analysis" style={{ marginTop: '20px' }}>
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </Card>
              )}
            </div>
          </Card>

          {/* Add images of 3D room layout below */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-around' }}>
            <Card
              cover={<img alt="Room Layout" src="/scene.png" style={{ maxWidth: '100%', height: 'auto' }} />}
              style={{ width: '45%' }}
              title="3D Room Layout"
            >
              <p>Three-dimensional view of the room layout.</p>
            </Card>

            <Card
              cover={<img alt="Alert" src="/alert.png" style={{ maxWidth: '100%', height: 'auto' }} />}
              style={{ width: '45%' }}
              title="Alert"
            >
              <p>Visual representation of alerts or issues detected.</p>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AnalyzePage;

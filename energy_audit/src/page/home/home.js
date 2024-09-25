import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Layout, Menu, Card, Slider } from 'antd';
import { UnorderedListOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const { Sider, Content } = Layout;

const HomePage = () => {
  const [userData, setUserData] = useState([]); // Initialize as an empty array
  const [timeRange, setTimeRange] = useState('hour'); // Default to hourly
  const [groupedData, setGroupedData] = useState({}); // Initialize as an empty object
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  const items = [
    { key: '1', icon: <HomeOutlined />, label: <Link to="/home">{'Appliance'}</Link> },
    { key: '2', icon: <SettingOutlined />, label: <Link to="/analyze">{'Advice'}</Link> },
  ];

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/data?user=user1'); // Ensure the request is correct
        if (response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        setError('Failed to fetch data'); // Set error message
      } finally {
        setLoading(false); // Data loading complete
      }
    };
    fetchData();
  }, []);

  // Group data
  useEffect(() => {
    if (userData && userData.length > 0) {
      const groupByTimeRange = () => {
        const grouped = {};
        userData.forEach(item => {
          const timeKey = formatTime(item.Timestamp);
          if (!grouped[timeKey]) {
            grouped[timeKey] = {};
          }
          if (!grouped[timeKey][item.Name]) {
            grouped[timeKey][item.Name] = 0;
          }
          grouped[timeKey][item.Name] += item.Power_Consumption;
        });
        setGroupedData(grouped);
      };
      groupByTimeRange();
    }
  }, [userData, timeRange]);

  // Format time
  const formatTime = (timestamp) => {
    const date = dayjs(timestamp);
    switch (timeRange) {
      case 'day':
        return date.format('YYYY-MM-DD');
      case 'week':
        return date.format('YYYY-WW');
      default:  // Default to hourly
        return date.format('YYYY-MM-DD HH');
    }
  };

  // Generate options for line chart
  const getLineChartOption = () => {
    const timeLabels = Object.keys(groupedData);  // Use Object.keys to ensure it's an array
    const applianceNames = [...new Set(userData.map(item => item.Name))]; // Ensure userData is loaded
    const series = applianceNames.map(name => ({
      name,
      type: 'line',
      data: timeLabels.map(label => groupedData[label][name] || 0),
    }));

    return {
      title: {
        text: 'Line'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: applianceNames
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timeLabels
      },
      yAxis: {
        type: 'value'
      },
      series
    };
  };

  // Generate options for bar chart
  const getBarChartOption = () => {
    // Calculate total power consumption for each appliance
    const applianceNames = [...new Set(userData.map(item => item.Name))];
    const totalConsumption = applianceNames.map(name => {
      return userData
        .filter(item => item.Name === name)
        .reduce((total, item) => total + item.Power_Consumption, 0);
    });

    return {
      title: {
        text: 'Histogram'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Total Power Consumption']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: applianceNames
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Total Power Consumption',
          type: 'bar',
          data: totalConsumption
        }
      ]
    };
  };

  // Generate options for pie chart
  const getPieChartOption = () => {
    // Calculate total power consumption for each appliance
    const applianceNames = [...new Set(userData.map(item => item.Name))];
    const totalConsumption = applianceNames.map(name => {
      return userData
        .filter(item => item.Name === name)
        .reduce((total, item) => total + item.Power_Consumption, 0);
    });

    const pieData = applianceNames.map((name, index) => ({
      value: totalConsumption[index],
      name: name
    }));

    return {
      title: {
        text: 'Pie',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Power Consumption Share',
          type: 'pie',
          radius: '50%',
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  // Handle time range change with slider
  const handleTimeRangeChange = (value) => {
    const timeRangeMapping = {
      0: 'hour',
      1: 'day',
      2: 'week'
    };
    setTimeRange(timeRangeMapping[value]);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return <div>Loading data...</div>;
  }

  // Show error message if data fetch failed
  if (error) {
    return <div>{error}</div>;
  }

  // Show message if no data is available
  if (!userData || userData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div className="logo" style={{ fontSize: '24px', color: '#87CEFA' }}><UnorderedListOutlined /></div>
        <Menu mode="vertical" defaultSelectedKeys={['1']} items={items}></Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: '20px' }}>
          <Card title="Appliance Power Consumption" style={{ marginBottom: '20px' }}>
            <ReactECharts option={getLineChartOption()} style={{ height: 400, width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <Slider
                style={{ width: '50%' }}
                min={0}
                max={2}
                step={1}
                marks={{
                  0: 'Hourly',
                  1: 'Daily',
                  2: 'Weekly'
                }}
                defaultValue={0}
                onChange={handleTimeRangeChange}
              />
            </div>
          </Card>

          <Card title="Total Appliance Power Consumption and Share" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ReactECharts option={getBarChartOption()} style={{ height: 400, width: '48%' }} />
              <ReactECharts option={getPieChartOption()} style={{ height: 400, width: '48%' }} />
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomePage;

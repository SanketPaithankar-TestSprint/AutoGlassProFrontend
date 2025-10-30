// Home.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Typography, Space, Divider } from "antd";
import { SearchOutlined, CarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const Home = () =>
{
    const navigate = useNavigate();
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() =>
    {
        const token = localStorage.getItem("token");
        setIsAuthed(Boolean(token));
    }, []);

    return (
        <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                {isAuthed ? <Space /> : <Space />}
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Title level={2}>Welcome to Auto Insights</Title>
                    <Paragraph>
                        Explore vehicle data, decode VINs, and visualize models in 3D once you sign in to your account.
                    </Paragraph>
                    <Divider />
                </Col>

                <Col xs={24} md={8}>
                    <Card
                        title="Search by VIN"
                        actions={[
                            <Button
                                key="vin"
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={() => navigate("/search-by-vin")}
                            >
                                Open
                            </Button>,
                        ]}
                    >
                        <Space direction="vertical">
                            <Text>Decode a VIN and fetch specs from your backend.</Text>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card
                        title="Search by YMM"
                        actions={[
                            <Button
                                key="ymm"
                                type="primary"
                                icon={<CarOutlined />}
                                onClick={() => navigate("/search-by-ymm")}
                            >
                                Open
                            </Button>,
                        ]}
                    >
                        <Space direction="vertical">
                            <Text>Find vehicles by Year, Make, and Model.</Text>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Home;

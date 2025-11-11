import React from "react";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";
import
{
    CarOutlined,
    LinkedinFilled,
    FacebookFilled,
    TwitterSquareFilled,
} from "@ant-design/icons";

const { Footer: AntFooter } = Layout;
const { Title, Paragraph } = Typography;

const Footer = () =>
{
    return (
        <AntFooter className="!bg-black !text-white px-4 sm:px-6">
            <div className="mx-auto w-full max-w-6xl py-12">
                <Row gutter={[32, 24]}>
                    {/* Brand */}
                    <Col xs={24} md={10} lg={10}>
                        <div className="flex items-center gap-3">
                            <CarOutlined className="text-2xl" style={{ color: "#8b5cf6" }} />
                            <span className="text-xl font-semibold">AutoPaneAi</span>
                        </div>
                        <Paragraph className="!text-white/70 !mt-4 !mb-8">
                            Professional auto glass pricing and quoting
                            <br /> platform for repair shops
                        </Paragraph>

                        <Title level={5} className="!text-white !mt-6">
                            Follow Us
                        </Title>

                        <Space size={16} className="!mt-3">
                            <Button
                                type="text"
                                className="!h-12 !w-12 !p-0 !rounded-full !bg-white/10 hover:!bg-white/20 !text-white"
                                aria-label="LinkedIn"
                                href="#"
                            >
                                <LinkedinFilled className="text-xl" />
                            </Button>
                            <Button
                                type="text"
                                className="!h-12 !w-12 !p-0 !rounded-full !bg-white/10 hover:!bg-white/20 !text-white"
                                aria-label="Facebook"
                                href="#"
                            >
                                <FacebookFilled className="text-xl" />
                            </Button>
                            <Button
                                type="text"
                                className="!h-12 !w-12 !p-0 !rounded-full !bg-white/10 hover:!bg-white/20 !text-white"
                                aria-label="Twitter / X"
                                href="#"
                            >
                                <TwitterSquareFilled className="text-xl" />
                            </Button>
                        </Space>
                    </Col>

                    {/* Quick Links */}
                    <Col xs={24} md={7} lg={7}>
                        <Title level={4} className="!text-white">
                            Quick Links
                        </Title>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <a href="#" className="text-white/80 hover:text-white">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/80 hover:text-white">
                                    Search Glass
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/80 hover:text-white">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/80 hover:text-white">
                                    About
                                </a>
                            </li>
                        </ul>
                    </Col>

                    {/* Support */}
                    <Col xs={24} md={7} lg={7}>
                        <Title level={4} className="!text-white">
                            Support
                        </Title>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <a href="#" className="text-white/80 hover:text-white">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/80 hover:text-white">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/80 hover:text-white">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </Col>
                </Row>

                <Divider className="!border-white/10 !mt-12" />

                <div className="py-6 text-center text-white/70">
                    © {new Date().getFullYear()} AutoGlass Pro. All rights reserved.
                </div>
            </div>
        </AntFooter >
    );
};

export default Footer;

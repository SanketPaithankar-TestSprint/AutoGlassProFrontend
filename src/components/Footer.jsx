import React from "react";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";
import {
  CarOutlined,
  LinkedinFilled,
  FacebookFilled,
  TwitterSquareFilled,
} from "@ant-design/icons";

const { Footer: AntFooter } = Layout;
const { Title, Paragraph } = Typography;

const Footer = () => {
  return (
    <AntFooter
      className="footer-gradient px-4 sm:px-6 !pt-6 !pb-3 border-t border-slate-800/70"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 mb-4 opacity-80" />

        <Row gutter={[24, 20]}>
          {/* Brand */}
          <Col xs={24} md={10} lg={10}>
            <div className="flex items-center gap-2">
              <CarOutlined className="text-xl" style={{ color: "#a855f7" }} />
              <span className="text-lg font-semibold tracking-tight text-slate-50">
                AutoPaneAi
              </span>
            </div>

            <Paragraph className="!text-slate-300 !mt-3 !mb-3 text-sm">
              Professional auto glass pricing &amp; quoting platform
              <br /> built for modern repair shops.
            </Paragraph>

            <Title level={5} className="!text-slate-100 !mt-3 !mb-2 text-xs uppercase tracking-[0.18em]">
              Follow Us
            </Title>

            <Space size={10} className="!mt-1">
              <Button
                type="text"
                className="!h-9 !w-9 !p-0 !rounded-full
                           !bg-slate-800/80 hover:!bg-slate-700/80
                           !text-slate-100 border border-slate-700/70
                           shadow-sm hover:shadow-md transition"
                aria-label="LinkedIn"
                href="#"
              >
                <LinkedinFilled className="text-lg" />
              </Button>
              <Button
                type="text"
                className="!h-9 !w-9 !p-0 !rounded-full
                           !bg-slate-800/80 hover:!bg-slate-700/80
                           !text-slate-100 border border-slate-700/70
                           shadow-sm hover:shadow-md transition"
                aria-label="Facebook"
                href="#"
              >
                <FacebookFilled className="text-lg" />
              </Button>
              <Button
                type="text"
                className="!h-9 !w-9 !p-0 !rounded-full
                           !bg-slate-800/80 hover:!bg-slate-700/80
                           !text-slate-100 border border-slate-700/70
                           shadow-sm hover:shadow-md transition"
                aria-label="Twitter / X"
                href="#"
              >
                <TwitterSquareFilled className="text-lg" />
              </Button>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} md={7} lg={7}>
            <Title level={5} className="!text-slate-100 text-sm">
              Quick Links
            </Title>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#" className="footer-link">Home</a></li>
              <li><a href="#" className="footer-link">Search Glass</a></li>
              <li><a href="#" className="footer-link">Pricing</a></li>
              <li><a href="#" className="footer-link">About</a></li>
            </ul>
          </Col>

          {/* Support */}
          <Col xs={24} md={7} lg={7}>
            <Title level={5} className="!text-slate-100 text-sm">
              Support
            </Title>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#" className="footer-link">Contact</a></li>
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
            </ul>
          </Col>
        </Row>

        <Divider className="!border-slate-800/80 !mt-5 !mb-2" />

        <div className="py-1 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} AutoGlass Pro. All rights reserved.
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;

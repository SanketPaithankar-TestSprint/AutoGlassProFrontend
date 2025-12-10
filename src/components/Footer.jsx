import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";
import {
  CarOutlined,
  LinkedinFilled,
  FacebookFilled,
  TwitterSquareFilled,
} from "@ant-design/icons";
import { getValidToken } from "../api/getValidToken";

const { Footer: AntFooter } = Layout;
const { Title, Paragraph } = Typography;

const Footer = () => {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getValidToken();
    setIsAuthed(!!token);
  }, []);

  if (isAuthed) {
    return (
      <AntFooter className="footer-gradient px-4 sm:px-6 py-3 border-t border-slate-800/70">
        <div className="mx-auto w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Left: Brand + Copy */}
          <div className="flex items-center gap-3 text-slate-400">
            <div className="flex items-center gap-2">
              <CarOutlined className="text-lg" style={{ color: "#a855f7" }} />
              <span className="font-semibold text-slate-300">AutoPaneAi</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <span>© {new Date().getFullYear()} AutoGlass Pro</span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">Contact</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">Terms</a>
          </div>
        </div>
      </AntFooter>
    );
  }

  return (
    <AntFooter
      className="footer-gradient px-4 sm:px-6 !pt-6 !pb-3 border-t border-slate-800/70"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 mb-4 opacity-80" />

        <Row gutter={[24, 20]}>
          {/* Brand */}
          <Col xs={24} md={isAuthed ? 12 : 10} lg={isAuthed ? 12 : 10}>
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

          {/* Quick Links - Conditional */}
          {!isAuthed && (
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
          )}

          {/* Support */}
          <Col xs={24} md={isAuthed ? 12 : 7} lg={isAuthed ? 12 : 7}>
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

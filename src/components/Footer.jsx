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
      <AntFooter className="bg-white px-4 sm:px-6 py-1">
        <div className="mx-auto w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Left: Brand + Copy */}
          <div className="flex items-center gap-3 text-slate-400">
            <div className="flex items-center gap-2">
              <CarOutlined className="text-lg" style={{ color: "#7E5CFE" }} />
              <span className="font-semibold text-slate-800">AutoPaneAi</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <span>© {new Date().getFullYear()} APAI</span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Contact</a>
            <a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Terms</a>
          </div>
        </div>
      </AntFooter>
    );
  }

  return (
    <AntFooter
      className="bg-white px-4 sm:px-6 !pt-4 !pb-2 border-t border-slate-200"
    >
      <div className="mx-auto w-full max-w-6xl">


        <Row gutter={[24, 20]}>
          {/* Brand */}
          <Col xs={24} md={isAuthed ? 12 : 10} lg={isAuthed ? 12 : 10}>
            <div className="flex items-center gap-2">
              <CarOutlined className="text-xl" style={{ color: "#7E5CFE" }} />
              <span className="text-lg font-semibold tracking-tight text-slate-800">
                AutoPaneAi
              </span>
            </div>

            <Paragraph className="!text-slate-600 !mt-3 !mb-3 text-sm">
              Professional auto glass pricing &amp; quoting platform
              <br /> built for modern repair shops.
            </Paragraph>


          </Col>

          {/* Quick Links - Conditional */}
          {!isAuthed && (
            <Col xs={24} md={7} lg={7}>
              <Title level={5} className="!text-slate-800 text-sm">
                Quick Links
              </Title>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Home</a></li>
                <li><a href="#" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">About</a></li>
              </ul>
            </Col>
          )}

          {/* Support */}
          <Col xs={24} md={isAuthed ? 12 : 7} lg={isAuthed ? 12 : 7}>
            <Title level={5} className="!text-slate-800 text-sm">
              Support
            </Title>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Contact</a></li>
              <li><a href="#" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Terms of Service</a></li>
            </ul>
          </Col>
        </Row>

        <Divider className="!border-slate-200 !mt-5 !mb-2" />

        <div className="py-1 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} APAI. All rights reserved.
        </div>
      </div>
    </AntFooter>
  );
};

export default React.memo(Footer);

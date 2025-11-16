// src/pages/PricingPage.jsx
import React from "react"
import { Layout, Row, Col, Card, Button, Tag } from "antd"
import {
  CheckOutlined,
  ThunderboltFilled,
  CrownFilled,
  StarFilled,
} from "@ant-design/icons"

const { Content } = Layout

const PricingPage = () =>
{
  const plans = [
    {
      key: "starter",
      name: "Starter",
      price: "$19",
      period: "per month",
      description: "Perfect for solo technicians and small shops getting started.",
      popular: false,
      accent: "from-slate-800/80 to-slate-900/80",
      badge: null,
      features: [
        "Up to 100 quotes per month",
        "Basic glass database",
        "Single-user access",
        "Email support",
      ],
      cta: "Start Free Trial",
    },
    {
      key: "pro",
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "Best for growing auto glass businesses needing more power.",
      popular: true,
      accent: "from-violet-600 to-fuchsia-500",
      badge: "Most Popular",
      features: [
        "Unlimited quotes",
        "Full glass & moulding database",
        "Up to 5 user seats",
        "Priority email & chat support",
        "Advanced reporting",
      ],
      cta: "Upgrade to Pro",
    },
    {
      key: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For multi-location operations and custom integrations.",
      popular: false,
      accent: "from-slate-800/80 to-slate-900/80",
      badge: null,
      features: [
        "Unlimited locations & users",
        "API & system integrations",
        "Dedicated account manager",
        "Custom onboarding",
      ],
      cta: "Talk to Sales",
    },
  ]

  return (
    <Layout className="min-h-screen !bg-gradient-to-b !from-slate-950 !via-slate-900 !to-slate-950 text-slate-50">
      <Content className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-12">
            <Tag
              color="purple"
              className="!border-0 !bg-violet-600/20 !text-violet-200 !px-3 !py-1 !rounded-full uppercase tracking-[0.24em] text-[10px]"
            >
              Pricing
            </Tag>
            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50">
              Simple, transparent pricing for{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                APAI
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-slate-300">
              Choose the plan that fits your shop today—upgrade or downgrade
              anytime as your business grows.
            </p>
          </div>

          {/* Plans */}
          <Row gutter={[24, 24]} justify="center">
            {plans.map((plan) => {
              const isPro = plan.key === "pro"

              return (
                <Col xs={24} sm={24} md={8} key={plan.key}>
                  <Card
                    bordered={false}
                    className={`
                      relative overflow-hidden
                      rounded-2xl 
                      bg-gradient-to-br ${plan.accent}
                      !bg-transparent
                      !border !border-slate-800
                      shadow-xl shadow-slate-950/60
                      transition-all duration-300
                      hover:-translate-y-1 hover:shadow-violet-800/50
                      ${isPro ? "scale-[1.02] md:scale-[1.05]" : ""}
                    `}
                    bodyStyle={{
                      background: "transparent",
                      padding: "20px 20px 22px 20px",
                    }}
                  >
                    {/* Popular badge / accent glow */}
                    {plan.popular && (
                      <>
                        <div className="absolute -inset-x-8 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.65),_transparent_65%)] pointer-events-none" />
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Tag
                            color="gold"
                            className="!border-0 !text-slate-900 !px-3 !py-1 !rounded-full text-[11px] font-semibold shadow-md shadow-yellow-300/60 flex items-center gap-2"
                          >
                            <CrownFilled className="text-xs" />
                            {plan.badge}
                          </Tag>
                        </div>
                      </>
                    )}

                    {/* Plan header */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {plan.key === "starter" && (
                            <StarFilled className="text-violet-400" />
                          )}
                          {plan.key === "pro" && (
                            <ThunderboltFilled className="text-yellow-300" />
                          )}
                          {plan.key === "enterprise" && (
                            <CrownFilled className="text-fuchsia-300" />
                          )}
                          <h2 className="text-lg font-semibold text-slate-50">
                            {plan.name}
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-slate-50">
                          {plan.price}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                          {plan.period}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-slate-300 mb-4">
                        {plan.description}
                      </p>
                    </div>

                    {/* Divider line */}
                    <div className="h-px w-full bg-slate-700/80 mb-4" />

                    {/* Features */}
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-xs md:text-sm text-slate-200"
                        >
                          <CheckOutlined className="mt-[2px] text-[11px] text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      type={isPro ? "primary" : "default"}
                      block
                      className={`
                        !mt-1 !h-10 !text-sm !font-semibold
                        !rounded-full
                        ${
                          isPro
                            ? "!bg-gradient-to-r !from-violet-500 !to-fuchsia-500 hover:!from-violet-400 hover:!to-fuchsia-400 !border-0 !text-white shadow-lg shadow-violet-800/60"
                            : "!bg-slate-900/80 hover:!bg-slate-800/90 !border-slate-600 !text-slate-100"
                        }
                        transition-transform duration-150 hover:scale-[1.02]
                      `}
                    >
                      {plan.cta}
                    </Button>
                  </Card>
                </Col>
              )
            })}
          </Row>

          {/* Small note */}
          <div className="mt-8 text-center text-xs text-slate-400">
            Need help choosing a plan?{" "}
            <a href="/contact" className="text-violet-300 hover:text-violet-200">
              Talk to our team
            </a>
            .
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default PricingPage

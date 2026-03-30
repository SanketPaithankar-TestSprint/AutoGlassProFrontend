
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Card, Button, Space, Typography, List } from "antd";
import { CheckCircleTwoTone, ExclamationCircleTwoTone, CloseCircleTwoTone, ClockCircleTwoTone, DollarOutlined, InfoCircleOutlined, CheckOutlined } from "@ant-design/icons";
import { subscriptionStyles, getBadgeClass } from "../../../constants/subscriptionStyles";


const statusMap = {
  ACTIVE: {
    icon: <CheckCircleTwoTone twoToneColor="#52c41a" />, text: "Active"
  },
  INACTIVE: {
    icon: <ExclamationCircleTwoTone twoToneColor="#faad14" />, text: "Inactive"
  },
  EXPIRED: {
    icon: <CloseCircleTwoTone twoToneColor="#ff4d4f" />, text: "Expired"
  },
  PENDING: {
    icon: <ClockCircleTwoTone twoToneColor="#1890ff" />, text: "Pending"
  },
};

const { Title, Text } = Typography;


const SubscriptionOverviewCard = ({ details, loading, onAdd, onUpdate, onActivate, onDeactivate, onDelete }) => {
  const { t } = useTranslation();
  const status = useMemo(() => statusMap[details?.status] || statusMap.PENDING, [details]);
  
  const pricingFeatures = useMemo(() => {
    const common = t('pricing.features.common', { returnObjects: true }) || [];
    const pro = t('pricing.features.pro', { returnObjects: true }) || [];
    // Just select the most important ones for the dashboard overview
    return [...pro.slice(0, 2), ...common.slice(0, 2)];
  }, [t]);
  const { displayPlan, displayExpiry } = useMemo(() => {
    let plan = details?.plan || "-";
    let expiry = details?.expiryDate || "-";

    if (details?.desc) {
      // Example: "Plan: PRO, Expiry: 2027-03-30..."
      const planMatch = details.desc.match(/Plan:\s*([^,]+)/);
      const expiryMatch = details.desc.match(/Expiry:\s*([^,]+)/);
      if (planMatch) {
        plan = planMatch[1].trim();
      }
      if (expiryMatch) {
        const dateStr = expiryMatch[1].trim();
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            expiry = d.toLocaleDateString(undefined, { 
              year: 'numeric', month: 'long', day: 'numeric' 
            });
          } else {
            expiry = dateStr;
          }
        } catch (e) {
          expiry = dateStr;
        }
      }
    } else if (expiry && expiry !== "-") {
      try {
        const d = new Date(expiry);
        if (!isNaN(d.getTime())) {
          expiry = d.toLocaleDateString(undefined, { 
            year: 'numeric', month: 'long', day: 'numeric' 
          });
        }
      } catch (e) {}
    }

    // Final sanitization to remove literal "null" strings
    const sanitize = (val) => (val === "null" || !val) ? "-" : val;

    return { displayPlan: sanitize(plan), displayExpiry: sanitize(expiry) };
  }, [details]);

  return (
    <Card
      loading={loading}
      className={subscriptionStyles.sectionCard + " !p-0 overflow-hidden"}
      bodyStyle={{ padding: 0 }}
    >
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Subscription Plan</h2>
          {details?.status !== "INACTIVE" && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold shadow-sm transition-all duration-300 ${getBadgeClass(details?.status)}`}>
              {status.icon} <span className="ml-1.5">{status.text}</span>
            </span>
          )}
        </div>
        <div>
          {details?.status === "INACTIVE" ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <Title level={4} className="!mb-1 text-slate-800">
                    {t('pricing.professional')} Plan
                  </Title>
                  <Text className="text-slate-500 text-sm">
                    {t('pricing.proDescription')}
                  </Text>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-baseline gap-1 md:justify-end">
                      <span className="text-3xl font-extrabold text-slate-900">$99</span>
                      <span className="text-sm font-medium text-slate-500">/mo</span>
                    </div>
                    <div className="flex items-baseline gap-1 md:justify-end -mt-1 opacity-80">
                      <span className="text-lg font-bold text-slate-600">$999</span>
                      <span className="text-[10px] font-medium text-slate-400">/year</span>
                    </div>
                  </div>
                  <Text className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1">
                    {t('pricing.mostPopular')}
                  </Text>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {pricingFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="mt-1 bg-blue-100 rounded-full p-0.5 flex items-center justify-center">
                      <CheckOutlined className="text-[10px] text-blue-600 font-bold" />
                    </div>
                    <div>
                      <Text className="block font-semibold text-slate-700 text-sm leading-none mb-0.5">
                        {feature.label}
                      </Text>
                      <Text className="block text-slate-500 text-[12px] leading-relaxed">
                        {feature.desc}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <Title level={4} className="!mb-0 text-gray-900 tracking-tight">
                {displayPlan} Plan
              </Title>
              <Text type="secondary" className="block text-sm mt-1">
                Expiry: <span className="font-semibold text-gray-700">{displayExpiry}</span>
              </Text>
            </>
          )}
        </div>
      </div>
      {/* Actions and Status-specific info */}
      <div className="px-6 py-4">
        {details?.status === "ACTIVE" ? (
          <div className="bg-blue-50 border border-blue-100 p-3 md:p-5 rounded-xl w-full">
            <Space align="start" gap={12} className="w-full">
              <InfoCircleOutlined className="text-blue-500 mt-1 flex-shrink-0 text-lg" />
              <div className="flex-1">
                <Title level={5} className="text-blue-900 font-bold block mb-1 !text-base md:!text-lg leading-tight">Subscription Managed by Support</Title>
                <Text className="text-blue-800 text-sm md:text-md leading-relaxed block">
                  <span className="md:hidden">
                    Contact <span className="font-bold text-blue-900 underline underline-offset-4 decoration-blue-200">support@autoglasspro.com</span> with <span className="font-semibold text-blue-900 italic">15 days notice</span> for changes or cancellation.
                  </span>
                  <span className="hidden md:inline">
                    To make any changes or to cancel your active subscription, please contact us at 
                    <span className="font-bold text-blue-900"> support@autoglasspro.com </span> 
                    at least <span className="underline underline-offset-4 decoration-blue-300 font-semibold italic">15 days in advance</span>.
                  </span>
                </Text>
              </div>
            </Space>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              {/* Optional summary info placeholder */}
            </div>
            <Space wrap>
              <Button 
                type="primary" 
                onClick={onAdd} 
                className={subscriptionStyles.primaryBtn + " min-w-[200px]"} 
                size="large"
              >
                Add Subscription
              </Button>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubscriptionOverviewCard;

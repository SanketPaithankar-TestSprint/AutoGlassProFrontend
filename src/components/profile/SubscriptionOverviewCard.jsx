
import React, { useMemo } from "react";
import { Badge, Card, Button, Space, Typography } from "antd";
import { CheckCircleTwoTone, ExclamationCircleTwoTone, CloseCircleTwoTone, ClockCircleTwoTone, DollarOutlined } from "@ant-design/icons";
import { subscriptionStyles, getBadgeClass } from "../../constants/subscriptionStyles";


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
  const status = useMemo(() => statusMap[details?.status] || statusMap.PENDING, [details]);

  return (
    <Card
      loading={loading}
      className={subscriptionStyles.sectionCard + " !p-0 overflow-hidden"}
      bodyStyle={{ padding: 0 }}
    >
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Subscription Plan</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${getBadgeClass(details?.status)}`}>
            {status.icon} <span className="ml-1.5">{status.text}</span>
          </span>
        </div>
        <div>
          <Title level={4} className="!mb-0 text-gray-900 tracking-tight">
            {details?.plan || "-"} Plan
          </Title>
          <Text type="secondary" className="block text-sm mt-1">
            Expiry: <span className="font-semibold text-gray-700">{details?.expiryDate || "-"}</span>
          </Text>
        </div>
      </div>
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          {/* Add more summary info here if needed */}
        </div>
        <Space wrap>
          {!details?.plan && (
            <Button type="primary" onClick={onAdd} className={subscriptionStyles.primaryBtn + " min-w-[160px]"} size="large">
              Add Subscription
            </Button>
          )}
          {!!details?.plan && (
            <>
              <Button type="primary" onClick={onUpdate} size="large" style={{ background: '#2563eb', borderColor: '#2563eb', color: '#ffffff' }}>Update</Button>
              {details.status === "INACTIVE" && (
                <Button type="primary" onClick={onActivate} className={subscriptionStyles.primaryBtn} size="large">
                  Activate
                </Button>
              )}
              {details.status === "ACTIVE" && (
                <Button danger onClick={onDeactivate} className={subscriptionStyles.destructiveBtn} size="large">
                  Deactivate
                </Button>
              )}
              <Button danger type="text" onClick={onDelete} className={subscriptionStyles.destructiveBtn} size="large">
                Delete
              </Button>
            </>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default SubscriptionOverviewCard;

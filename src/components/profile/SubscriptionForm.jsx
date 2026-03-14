import React, { useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button, Checkbox, Row, Col, Typography } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { RECURRING_TYPE_OPTIONS, SUBSCRIPTION_PLAN_OPTIONS } from "../../constants/subscription";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const addressFields = [
  { name: "customerName", label: "Name" },
  { name: "streetNo", label: "Street No" },
  { name: "streetName", label: "Street Name" },
  { name: "unit", label: "Unit/Apt" },
  { name: "zip", label: "Postal Code" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
];

const SubscriptionForm = ({ initialValues = {}, onSubmit, loading, submitLabel = "Submit" }) => {
  const [form] = Form.useForm();
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const recurringType = Form.useWatch("recurringType", form);

  // Sync amount based on recurring type
  React.useEffect(() => {
    if (recurringType === "2") {
      form.setFieldsValue({ amount: 99 });
    } else if (recurringType === "4") {
      form.setFieldsValue({ amount: 999 }); // Yearly price
    }
  }, [recurringType, form]);


  // Sync shipping address if "same as billing" is checked
  const handleSameAsBilling = (e) => {
    setSameAsBilling(e.target.checked);
    if (e.target.checked) {
      const billing = form.getFieldValue("billingAddress") || {};
      form.setFieldsValue({ shippingAddress: { ...billing } });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        subscriptionPlan: "PRO",
        surchargeAmount: 2.50,
        ...initialValues,
        subscriptionStartsFrom: initialValues.subscriptionStartsFrom ? dayjs(initialValues.subscriptionStartsFrom) : dayjs(),
        isValidateCard: initialValues.isValidateCard === "1",
      }}
      onFinish={onSubmit}
      scrollToFirstError
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <DollarOutlined className="text-violet-500" /> Subscription Details
      </h2>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="amount" label="Amount ($)" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="$" readOnly disabled placeholder="99.99" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="surchargeAmount" label="Surcharge Amount">
            <InputNumber className="w-full" prefix="$" min={0} step={0.01} placeholder="2.50" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="recurringType" label="Recurring Type" rules={[{ required: true }]}>
            <Select options={RECURRING_TYPE_OPTIONS} placeholder="Select..." />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="subscriptionPlan" label="Plan">
            <Input readOnly disabled className="bg-gray-50" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="subscriptionStartsFrom" label="Start Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        {/* Hidden fields maintained in form state */}
        <Form.Item name="chargeUntil" hidden><Input /></Form.Item>
        <Form.Item name="chargeOn" hidden><Input /></Form.Item>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="isValidateCard" label="Validate Card?" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </Col>
      </Row>
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Payment Info</h2>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name={["paymentInfo", "customerProfileID"]} label="Customer Profile ID" rules={[{ required: true }]}> <Input /> </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name={["paymentInfo", "cardNumber"]} label="Card Number" rules={[{ required: true }]}> <Input placeholder="**** **** **** 1234" /> </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name={["paymentInfo", "expiryDate"]} label="Expiry (MMYY)" rules={[{ required: true, pattern: /^\d{4}$/ }]}> <Input placeholder="1227" /> </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name={["paymentInfo", "cvv"]} label="CVV" rules={[{ required: true, pattern: /^\d{3,4}$/ }]}> <Input.Password placeholder="123" maxLength={4} /> </Form.Item>
        </Col>
      </Row>
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Billing Address</h2>
      <Row gutter={16}>
        {addressFields.map((f) => (
          <Col xs={24} md={8} key={f.name}>
            <Form.Item name={["billingAddress", f.name]} label={f.label} rules={[{ required: true }]}> <Input /> </Form.Item>
          </Col>
        ))}
      </Row>
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Shipping Address</h2>
      <Checkbox checked={sameAsBilling} onChange={handleSameAsBilling} className="mb-2">Same as billing address</Checkbox>
      <Row gutter={16}>
        {addressFields.map((f) => (
          <Col xs={24} md={8} key={f.name}>
            <Form.Item name={["shippingAddress", f.name]} label={f.label} rules={[{ required: !sameAsBilling }]}> <Input disabled={sameAsBilling} /> </Form.Item>
          </Col>
        ))}
      </Row>
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Contact Info</h2>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}> <Input /> </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}> <Input /> </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="descriptor" label="Statement Descriptor" rules={[{ required: true }]}> <Input /> </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="invoiceNo" label="Invoice No" rules={[{ required: true }]}> <Input /> </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="cardHolderName" label="Card Holder Name" rules={[{ required: true }]}> <Input /> </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="productDescription" label="Product Description" rules={[{ required: true }]}> <Input /> </Form.Item>
        </Col>
      </Row>
      <Form.Item className="mt-8">
        <Button type="primary" htmlType="submit" loading={loading} className="bg-violet-600 hover:bg-violet-700 w-full md:w-auto h-11 px-8 rounded-lg font-semibold">
          {submitLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SubscriptionForm;

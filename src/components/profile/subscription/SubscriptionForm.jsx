import React from "react";
import { Form, Input, InputNumber, Select, Button, Row, Col, Typography, Card, Divider, Checkbox } from "antd";
import { DollarOutlined, InfoCircleOutlined, ArrowUpOutlined, CheckCircleFilled, MessageOutlined } from "@ant-design/icons";
import { RECURRING_TYPE_OPTIONS } from "../../../const/subscription";
import { COUNTRIES, getStatesOrProvinces, getCities, US_CITIES } from "../../../const/locations";
import "./SubscriptionForm.css";

const { Title, Text } = Typography;

const SubscriptionForm = ({ initialValues = {}, onSubmit, loading, submitLabel = "Submit" }) => {
  const [form] = Form.useForm();

  // Watches for dynamic UI
  const recurringType = Form.useWatch("recurringType", form) || "2";
  const employeeCount = Form.useWatch("employeeCount", form) || 0;
  const autoRenewal = Form.useWatch("autoRenewal", form);

  // Watches for Location logic
  const selectedCountry = Form.useWatch(["billingAddress", "country"], form) || "USA";
  const selectedState = Form.useWatch(["billingAddress", "state"], form);
  
  const [availableStates, setAvailableStates] = React.useState(getStatesOrProvinces(selectedCountry));
  const [availableCities, setAvailableCities] = React.useState([]);

  // Flattened list of all cities for global search (USA only for simplicity)
  const allUSCities = React.useMemo(() => {
    if (selectedCountry !== "USA") return [];
    const entries = [];
    Object.entries(US_CITIES).forEach(([stateCode, cities]) => {
      cities.forEach(city => {
        entries.push({ 
          label: `${city}, ${stateCode}`, 
          value: `${city}|${stateCode}`,
          city,
          state: stateCode 
        });
      });
    });
    return entries;
  }, [selectedCountry]);

  // Sync states when country changes
  React.useEffect(() => {
    setAvailableStates(getStatesOrProvinces(selectedCountry));
    // Reset state/city if country changes and they are not valid for new country
    const currentAddress = form.getFieldValue("billingAddress") || {};
    if (currentAddress.country === selectedCountry) return;
    form.setFieldsValue({ 
      billingAddress: { ...currentAddress, state: undefined, city: undefined } 
    });
  }, [selectedCountry, form]);

  // Sync cities when state changes
  React.useEffect(() => {
    if (selectedState) {
      const cities = getCities(selectedCountry, selectedState);
      setAvailableCities(cities.map(c => ({ label: c.label, value: c.value })));
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry, selectedState]);

  const handleCityChange = (val) => {
    if (val && val.includes("|")) {
      const [city, state] = val.split("|");
      form.setFieldsValue({ 
        billingAddress: { 
          ...form.getFieldValue("billingAddress"),
          state: state,
          city: city 
        } 
      });
    }
  };

  const isYearly = recurringType === "4";
  const singleUserCost = isYearly ? 999 : 99;
  const employeeCostPerUnit = isYearly ? 79 * 11 : 79;

  const totalEmployeeCost = employeeCostPerUnit * employeeCount;
  const finalTotal = (singleUserCost + totalEmployeeCost);


  const formatCardNumber = (value = "") => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.length > 1 ? parts.join(" ") : v;
  };

  const formatExpiry = (value = "") => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length > 2) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        recurringType: "2",
        employeeCount: 0,
        autoRenewal: true,
        billingAddress: { country: "USA" },
        paymentInfo: {},
        ...initialValues,
      }}
      onFinish={onSubmit}
      scrollToFirstError
      className="subscription-upgrade-form"
    >
      <Row gutter={[40, 24]}>
        {/* Left Column: Form Details */}
        <Col xs={24} lg={16}>
          <div className="form-header-premium">
            <div className="upgrade-icon-bg">
              <ArrowUpOutlined />
            </div>
            <h2 className="premium-title">Upgrade to Subscription</h2>
            <p className="premium-subtitle">Complete your details to unlock full access and team features.</p>
          </div>

          <div className="space-y-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="cardHolderName" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
                  <Input placeholder="Sanket Paithankar" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="employeeCount" 
                  label="User Count" 
                  tooltip="The number of additional staff members who will have access to the dashboard."
                  rules={[{ required: true, message: 'Please enter user count' }]}
                >
                  <InputNumber min={0} className="w-full" placeholder="0" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item 
                  name={["paymentInfo", "cardNumber"]} 
                  label="Card number" 
                  rules={[{ required: true, message: 'Please enter Card Number' }]}
                  normalize={(value) => formatCardNumber(value)}
                > 
                  <Input 
                    placeholder="1234 1234 1234 1234" 
                    maxLength={19} 
                  /> 
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={12}>
                <Form.Item 
                  name={["paymentInfo", "expiryDate"]} 
                  label="Expiration date" 
                  rules={[
                    { required: true, message: 'Required' },
                    { pattern: /^\d{2} \/ \d{2}$/, message: 'MM / YY' }
                  ]}
                  normalize={(value) => formatExpiry(value)}
                > 
                  <Input placeholder="MM / YY" maxLength={7} /> 
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item 
                  name={["paymentInfo", "cvv"]} 
                  label="Security code" 
                  rules={[{ required: true, message: 'Required' }, { pattern: /^\d{3,4}$/, message: 'Invalid' }]}
                > 
                  <Input.Password placeholder="CVC" maxLength={4} /> 
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name={["billingAddress", "country"]} label="Country" rules={[{ required: true }]}>
                  <Select 
                    options={COUNTRIES} 
                    onChange={(val) => {
                      form.setFieldsValue({ 
                        billingAddress: { ...form.getFieldValue("billingAddress"), country: val, state: undefined, city: undefined } 
                      });
                    }} 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-8" />

            <h3 className="text-lg font-bold text-gray-800 mb-4">Billing Address</h3>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name={["billingAddress", "customerName"]} label="Full Name" rules={[{ required: true, message: 'Please enter Name' }]}>
                  <Input placeholder="John Doe" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={["billingAddress", "streetNo"]} label="Street No">
                  <Input placeholder="123" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name={["billingAddress", "streetName"]} label="Street Name">
                  <Input placeholder="Main St" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name={["billingAddress", "state"]} label="State">
                  <Select 
                    showSearch 
                    optionFilterProp="label" 
                    options={availableStates} 
                    placeholder="Select State"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name={["billingAddress", "city"]} label="City">
                  <Select 
                    showSearch 
                    optionFilterProp="label" 
                    options={selectedState ? availableCities : allUSCities}
                    onChange={handleCityChange}
                    placeholder="City"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name={["billingAddress", "zip"]} label="Zip">
                  <Input placeholder="10001" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Col>

        {/* Right Column: Billing & Summary */}
        <Col xs={24} lg={8}>
          <div className="sticky top-24">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Billing options</h3>
            <Form.Item name="recurringType" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <div className="billing-options-container">
              <div 
                className={`billing-choice-card ${recurringType === '2' ? 'active' : ''}`}
                onClick={() => form.setFieldsValue({ recurringType: '2' })}
              >
                <div className="billing-choice-radio"></div>
                <div className="billing-choice-info">
                  <span className="billing-choice-title">Pay monthly</span>
                  <span className="billing-choice-price">$99 / month / member</span>
                </div>
              </div>

              <div 
                className={`billing-choice-card ${recurringType === '4' ? 'active' : ''}`}
                onClick={() => form.setFieldsValue({ recurringType: '4' })}
              >
                <div className="billing-choice-radio"></div>
                <div className="billing-choice-info">
                  <span className="billing-choice-title">Pay annually</span>
                  <span className="billing-choice-price">$999 / year / member</span>
                </div>
                <div className="save-badge">Save 17%</div>
              </div>
            </div>

            <div className="confirm-upgrade-box">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Confirm upgrade</h3>
              <div className="upgrade-price-display">
                ${finalTotal} <span className="upgrade-price-sub">/ {isYearly ? 'year' : 'month'}</span>
              </div>

              <div className="terms-checkbox-container">
                <Form.Item name="autoRenewal" valuePropName="checked" noStyle>
                  <Checkbox className="mt-1" />
                </Form.Item>
                <div className="terms-text">
                  Your AutoPane subscription will auto-renew each {isYearly ? 'year' : 'month'} at the above price per seat + taxes unless canceled. Cancel via the Billing tab prior to renewal to avoid future charges (<span className="terms-link">terms</span>).
                </div>
              </div>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="upgrade-button"
              >
                {submitLabel}
              </Button>

              <div className="contact-sales-link">
                <MessageOutlined />
                <span>Contact support</span>
              </div>
            </div>

            {isYearly && (
              <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex gap-3 items-start animate-fadeIn">
                <CheckCircleFilled className="text-green-500 mt-1" />
                <p className="text-green-700 text-xs font-medium leading-relaxed">
                  Great choice! The yearly plan includes 1 free month for the primary user, and additional seats are billed for 11 months only.
                </p>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default SubscriptionForm;

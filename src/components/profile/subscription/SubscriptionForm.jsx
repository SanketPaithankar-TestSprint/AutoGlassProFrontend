import React from "react";
import { Form, Input, InputNumber, Select, Button, Row, Col, Typography, Card, Divider } from "antd";
import { DollarOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { RECURRING_TYPE_OPTIONS } from "../../../constants/subscription";
import { COUNTRIES, getStatesOrProvinces, getCities, US_CITIES } from "../../../const/locations";

const { Title, Text } = Typography;

const SubscriptionForm = ({ initialValues = {}, onSubmit, loading, submitLabel = "Submit" }) => {
  const [form] = Form.useForm();

  // Watches for dynamic UI
  const recurringType = Form.useWatch("recurringType", form) || "2";
  const employeeCount = Form.useWatch("employeeCount", form) || 0;

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
        billingAddress: { country: "USA" },
        paymentInfo: {},
        ...initialValues,
      }}
      onFinish={onSubmit}
      scrollToFirstError
      className="subscription-form"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <DollarOutlined className="text-violet-500" /> Subscription Details
      </h2>

      {/* Recurring Type & Duration */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="recurringType" label="Recurring Type" rules={[{ required: true, message: 'Please select recurring type' }]}>
            <Select options={RECURRING_TYPE_OPTIONS} placeholder="Select..." />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="employeeCount" label="Employee Count" rules={[{ required: true, message: 'Please enter employee count' }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </Col>
      </Row>

      {/* Card Holder Name */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="cardHolderName" label="Card Holder Name" rules={[{ required: true, message: 'Please enter card holder name' }]}>
            <Input placeholder="John Doe" />
          </Form.Item>
        </Col>
      </Row>

      {/* Payment Info */}
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Payment Info</h2>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item 
            name={["paymentInfo", "cardNumber"]} 
            label="Card Number" 
            rules={[{ required: true, message: 'Please enter Card Number' }]}
            normalize={(value) => formatCardNumber(value)}
          > 
            <Input placeholder="0000 0000 0000 0000" maxLength={19} /> 
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item 
            name={["paymentInfo", "expiryDate"]} 
            label="Expiry (MM / YY)" 
            rules={[
              { required: true, message: 'Please enter Expiry (MM / YY)' },
              { pattern: /^\d{2} \/ \d{2}$/, message: 'Invalid format (MM / YY)' }
            ]}
            normalize={(value) => formatExpiry(value)}
          > 
            <Input placeholder="12 / 27" maxLength={7} /> 
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item 
            name={["paymentInfo", "cvv"]} 
            label="CVV" 
            rules={[{ required: true, message: 'Please enter CVV' }, { pattern: /^\d{3,4}$/, message: 'Invalid CVV' }]}
          > 
            <Input.Password placeholder="123" maxLength={4} /> 
          </Form.Item>
        </Col>
      </Row>

      {/* Billing Address */}
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Billing Address</h2>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name={["billingAddress", "customerName"]} label="Name" rules={[{ required: true, message: 'Please enter Name' }]}>
            <Input placeholder="John Doe" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name={["billingAddress", "streetNo"]} label="Street No" rules={[{ required: true, message: 'Please enter Street No' }]}>
            <Input placeholder="123" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item name={["billingAddress", "streetName"]} label="Street Name" rules={[{ required: true, message: 'Please enter Street Name' }]}>
            <Input placeholder="Main St" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name={["billingAddress", "country"]} label="Country" rules={[{ required: true }]}>
            <Select 
              options={COUNTRIES} 
              onChange={(val) => {
                form.setFieldsValue({ 
                  billingAddress: { 
                    ...form.getFieldValue("billingAddress"), 
                    country: val,
                    state: undefined, 
                    city: undefined 
                  } 
                });
              }} 
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name={["billingAddress", "state"]} label="State" rules={[{ required: true, message: 'Please select State' }]}>
            <Select 
              showSearch 
              optionFilterProp="label" 
              options={availableStates} 
              onChange={(val) => {
                form.setFieldsValue({ 
                  billingAddress: { 
                    ...form.getFieldValue("billingAddress"), 
                    state: val,
                    city: undefined 
                  } 
                });
              }}
              placeholder="Select State"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name={["billingAddress", "city"]} label="City" rules={[{ required: true, message: 'Please select or enter City' }]}>
            <Select 
              showSearch 
              optionFilterProp="label" 
              options={selectedState ? availableCities : allUSCities}
              onChange={handleCityChange}
              placeholder={selectedState ? "Select City" : "Search City (e.g. Austin)"}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {selectedState ? "Showing cities for selected state." : "Pro-tip: Start typing city name to auto-select state!"}
                    </Text>
                  </div>
                </>
              )}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name={["billingAddress", "zip"]} label="Postal Code" rules={[{ required: true, message: 'Please enter Postal Code' }]}>
            <Input placeholder="10001" />
          </Form.Item>
        </Col>
      </Row>

      {/* Contact Info (optional) */}
      <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">Contact Info <span className="text-sm font-normal text-gray-400">(optional)</span></h2>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="email" label="Email" rules={[{ type: "email", message: 'Invalid email' }]}> <Input placeholder="user@example.com" /> </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="phone" label="Phone"> <Input placeholder="1234567890" /> </Form.Item>
        </Col>
      </Row>

      {/* Pricing Summary */}
      <Card className="mt-8 bg-blue-50 border-blue-100 summary-card shadow-sm rounded-lg">
        <Title level={4} className="!mt-0 !mb-4 text-blue-900 border-b border-blue-200 pb-2">Pricing Summary</Title>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
            <span className="text-gray-600 font-medium">Selected Plan:</span>
            <span className="font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">{isYearly ? 'Yearly' : 'Monthly'}</span>
          </div>
          <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
            <span className="text-gray-600 font-medium">Plan Price ({isYearly ? 'per year' : 'per month'}):</span>
            <span className="font-semibold text-gray-800">${singleUserCost}</span>
          </div>
          {employeeCount > 0 && (
            <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
              <span className="text-gray-600 font-medium whitespace-nowrap">Employee Cost ({employeeCount} seat{employeeCount > 1 && 's'}):</span>
              <span className="font-semibold text-gray-800 inline-flex flex-col items-end leading-tight">
                <span>${totalEmployeeCost}</span>
                <span className="text-[10px] text-gray-400 font-normal">(${employeeCostPerUnit} / seat{isYearly && ' — 11 mos pricing'})</span>
              </span>
            </div>
          )}
          {isYearly && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start shadow-sm">
              <InfoCircleOutlined className="text-green-600 mt-0.5" />
              <Typography.Text className="text-green-700 text-xs font-semibold">
                Great choice! Yearly plan includes 1 free month for the single user, and employees are billed for 11 months only!
              </Typography.Text>
            </div>
          )}
          <Divider className="my-4 border-blue-200" />
          <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-600 text-white p-4 rounded-xl shadow-md mb-2 gap-2">
            <span className="text-lg font-bold">Final Total:</span>
            <span className="text-2xl font-extrabold tracking-wider">${finalTotal}</span>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 items-start shadow-sm">
            <InfoCircleOutlined className="text-amber-600 mt-1" />
            <div className="flex flex-col">
              <Text className="text-amber-800 font-bold text-sm">Need to make changes?</Text>
              <Text className="text-amber-700 text-xs">
                For any changes to your subscription or for canceling the service, please contact us at 
                <span className="font-bold text-amber-900"> support@autoglasspro.com </span> 
                at least <span className="font-semibold text-amber-900 underline decoration-amber-300">15 days in advance</span>.
              </Text>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center mt-10 pb-4">
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            style={{ 
              background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
              borderColor: 'transparent',
              color: '#ffffff',
            }} 
            className="h-12 w-full sm:w-auto sm:min-w-[240px] px-16 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all transform active:scale-95"
          >
            {submitLabel}
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export default SubscriptionForm;

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, App } from "antd";
import {
  getSubscriptionDetails,
  addSubscription,
  updateSubscription,
  activateSubscription,
  deactivateSubscription,
  getSubscriptionInvoices,
} from "../../../api/subscription";
import { getValidToken } from "../../../api/getValidToken";
import SubscriptionOverviewCard from "./SubscriptionOverviewCard";
import SubscriptionForm from "./SubscriptionForm";
import { Table, Tag, Button as AntButton, Result, Button } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";

const SubscriptionManagement = () => {
  const { notification, modal } = App.useApp();
  const queryClient = useQueryClient();
  const token = getValidToken();
  const [formVisible, setFormVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null });
  const formRef = useRef(null);

  // Scroll to form when it becomes visible
  useEffect(() => {
    if (formVisible && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formVisible]);

  // Fetch subscription details
  const {
    data: details,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscriptionDetails"],
    queryFn: () => getSubscriptionDetails(token),
    enabled: !!token,
  });

  // Fetch invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["subscriptionInvoices"],
    queryFn: () => getSubscriptionInvoices(token),
    enabled: !!token,
  });

  // ... (keeping mutations and handlers same)
  // Mutations
  const addMutation = useMutation({
    mutationFn: (payload) => addSubscription(token, payload),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription added" });
      setFormVisible(false);
      refetch();
      queryClient.invalidateQueries(["subscriptionInvoices"]);
    },
    onError: (err) => {
      const errorData = err.response?.data;
      let mainMsg = errorData?.message || err.message;
      let rawDesc = errorData?.details?.description || errorData?.details?.desc || mainMsg;
      let finalDesc = rawDesc;

      // Deep parse to find "desc" in stringified JSON (handles nested Valor errors)
      try {
        const jsonMatch = rawDesc.match(/\{.*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0].replace(/\\"/g, '"'));
          if (parsed.desc || parsed.description) {
            finalDesc = parsed.desc || parsed.description;
          }
        }
      } catch (e) {
        // Fallback to simpler regex if JSON parse fails
        const descMatch = rawDesc.match(/"desc"\s*:\s*"([^"]+)"/);
        if (descMatch) finalDesc = descMatch[1];
      }

      modal.error({
        title: "Subscription Error",
        content: (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700">The transaction could not be completed.</p>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-1">
              <span className="text-red-800 font-bold text-xs uppercase tracking-wider opacity-70">Error Reason</span>
              <span className="text-red-900 font-bold text-sm">
                {finalDesc}
              </span>
            </div>
          </div>
        ),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateSubscription(token, payload),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription updated" });
      setFormVisible(false);
      refetch();
      queryClient.invalidateQueries(["subscriptionInvoices"]);
    },
    onError: (err) => {
      const errorData = err.response?.data;
      let mainMsg = errorData?.message || err.message;
      let rawDesc = errorData?.details?.description || errorData?.details?.desc || mainMsg;
      let finalDesc = rawDesc;

      // Deep parse to find "desc" in stringified JSON
      try {
        const jsonMatch = rawDesc.match(/\{.*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0].replace(/\\"/g, '"'));
          if (parsed.desc || parsed.description) {
            finalDesc = parsed.desc || parsed.description;
          }
        }
      } catch (e) {
        const descMatch = rawDesc.match(/"desc"\s*:\s*"([^"]+)"/);
        if (descMatch) finalDesc = descMatch[1];
      }

      modal.error({
        title: "Update Error",
        content: (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700">The update could not be saved.</p>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-1">
              <span className="text-red-800 font-bold text-xs uppercase tracking-wider opacity-70">Error Reason</span>
              <span className="text-red-900 font-bold text-sm">
                {finalDesc}
              </span>
            </div>
          </div>
        ),
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => activateSubscription(token),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription activated" });
      refetch();
    },
    onError: (err) => notification.error({ message: "Failed to activate subscription", description: err.message }),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateSubscription(token),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription deactivated" });
      setConfirmModal({ open: false, action: null });
      refetch();
    },
    onError: (err) => notification.error({ message: "Failed to deactivate subscription", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSubscription(token),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription deleted" });
      setConfirmModal({ open: false, action: null });
      refetch();
    },
    onError: (err) => notification.error({ message: "Failed to delete subscription", description: err.message }),
  });

  // Handlers
  const handleAdd = () => {
    setFormVisible(true);
  };
  const handleActivate = () => activateMutation.mutate();
  const handleDeactivate = () => setConfirmModal({ open: true, action: "deactivate" });
  const handleDelete = () => setConfirmModal({ open: true, action: "delete" });

  const handleFormSubmit = (values) => {
    // Build the exact API payload
    const payload = {
      recurringType: values.recurringType,
      chargeUntil: values.duration?.toString() || "1",
      employeeCount: values.employeeCount || 0,
      cardHolderName: values.cardHolderName,
      paymentInfo: {
        ...values.paymentInfo,
        cardNumber: values.paymentInfo?.cardNumber?.replace(/\s/g, ""),
        expiryDate: values.paymentInfo?.expiryDate?.replace(/[^0-9]/g, ""),
      },
      billingAddress: values.billingAddress,
    };
    if (values.email) payload.email = values.email;
    if (values.phone) payload.phone = values.phone;
    
    addMutation.mutate(payload);
  };

  const handleConfirmOk = () => {
    if (confirmModal.action === "deactivate") deactivateMutation.mutate();
    if (confirmModal.action === "delete") deleteMutation.mutate();
  };

  const invoiceColumns = [
    {
      title: "Invoice #",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      render: (text) => <span className="font-semibold text-gray-700">{text || "N/A"}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amt) => <span className="text-blue-600 font-bold">${amt}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "PAID" ? "green" : "orange"} className="rounded-full px-3">
          {status || "PENDING"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <AntButton
          type="text"
          icon={<DownloadOutlined className="text-blue-500" />}
          onClick={() => window.open(record.invoiceUrl, "_blank")}
          disabled={!record.invoiceUrl}
        >
          Download
        </AntButton>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn px-4 md:px-0 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Subscription Dashboard</h2>
      </div>

      {isError ? (
        <div className="bg-white rounded-2xl p-12 border border-red-50 shadow-sm animate-fadeIn">
          <Result
            status={error?.response?.status === 403 ? "403" : "error"}
            title={error?.response?.status === 403 ? "Access Denied" : "Something went wrong"}
            subTitle={
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">
                  {error?.response?.data?.message || error?.message || "Failed to load subscription details."}
                </p>
                {error?.response?.data?.path && (
                  <p className="text-xs text-gray-400 font-mono">Path: {error.response.data.path}</p>
                )}
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="retry" 
                icon={<ReloadOutlined />} 
                onClick={() => refetch()}
                className="bg-blue-600"
              >
                Retry Request
              </Button>
            ]}
          />
        </div>
      ) : (
        <SubscriptionOverviewCard
          details={details}
          loading={isLoading}
          onAdd={handleAdd}
          onUpdate={handleAdd} // Fallback to handleAdd
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}

      {formVisible && (
        <div 
          ref={formRef} 
          className="mt-8 bg-white p-6 rounded-2xl border border-blue-100 animate-fadeIn scroll-mt-20"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Add New Subscription</h3>
            <AntButton type="text" onClick={() => setFormVisible(false)} className="text-gray-400 hover:text-gray-600">
              Close
            </AntButton>
          </div>
          <SubscriptionForm
            initialValues={{}} // Always empty or default
            onSubmit={handleFormSubmit}
            onCancel={() => setFormVisible(false)}
            loading={addMutation.isLoading}
            submitLabel="Complete Subscription"
          />
        </div>
      )}

      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          Invoice History
        </h3>
        <Table
          columns={invoiceColumns}
          dataSource={invoices || []}
          loading={isLoadingInvoices}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
          className="subscription-invoices-table"
        />
      </div>

      <Modal
        open={confirmModal.open}
        title={confirmModal.action === "deactivate" ? "Deactivate Subscription" : "Delete Subscription"}
        onOk={handleConfirmOk}
        onCancel={() => setConfirmModal({ open: false, action: null })}
        okButtonProps={{ danger: true, loading: deactivateMutation.isLoading || deleteMutation.isLoading }}
        okText={confirmModal.action === "deactivate" ? "Deactivate" : "Delete"}
        cancelText="Cancel"
      >
        Are you sure you want to {confirmModal.action} this subscription?
      </Modal>
    </div>
  );
};

export default SubscriptionManagement;

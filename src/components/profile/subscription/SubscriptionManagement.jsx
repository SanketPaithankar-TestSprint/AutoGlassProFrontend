import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, notification } from "antd";
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
import { Table, Tag, Button as AntButton } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const SubscriptionManagement = () => {
  const queryClient = useQueryClient();
  const token = getValidToken();
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState("add"); // 'add' or 'update'
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null });

  // Fetch subscription details
  const {
    data: details,
    isLoading,
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
    onError: (err) => notification.error({ message: "Failed to add subscription", description: err.message }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateSubscription(token, payload),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription updated" });
      setFormVisible(false);
      refetch();
      queryClient.invalidateQueries(["subscriptionInvoices"]);
    },
    onError: (err) => notification.error({ message: "Failed to update subscription", description: err.message }),
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
    setFormMode("add");
    setFormVisible(true);
  };
  const handleUpdate = () => {
    setFormMode("update");
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

    if (formMode === "add") addMutation.mutate(payload);
    else updateMutation.mutate(payload);
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Subscription</h2>
      </div>
      <SubscriptionOverviewCard
        details={details}
        loading={isLoading}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />

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
          className="subscription-invoices-table"
        />
      </div>

      <Modal
        open={formVisible}
        title={formMode === "add" ? "Add Subscription" : "Update Subscription"}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SubscriptionForm
          initialValues={formMode === "update" ? details : {}}
          onSubmit={handleFormSubmit}
          loading={addMutation.isLoading || updateMutation.isLoading}
          submitLabel={formMode === "add" ? "Add Subscription" : "Update Subscription"}
        />
      </Modal>
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

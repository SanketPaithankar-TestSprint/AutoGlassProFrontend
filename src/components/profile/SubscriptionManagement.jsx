import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, notification } from "antd";
import {
  getSubscriptionDetails,
  addSubscription,
  updateSubscription,
  activateSubscription,
  deactivateSubscription,
  deleteSubscription,
} from "../../api/subscription";
import { getValidToken } from "../../api/getValidToken";
import SubscriptionOverviewCard from "./SubscriptionOverviewCard";
import SubscriptionForm from "./SubscriptionForm";

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

  // Mutations
  const addMutation = useMutation({
    mutationFn: (payload) => addSubscription(token, payload),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription added" });
      setFormVisible(false);
      refetch();
    },
    onError: (err) => notification.error({ message: "Failed to add subscription", description: err.message }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateSubscription(token, payload),
    onSuccess: (res) => {
      notification.success({ message: res.msg || "Subscription updated" });
      setFormVisible(false);
      refetch();
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
    // Transform form values to API shape
    const payload = {
      ...values,
      isValidateCard: values.isValidateCard ? "1" : "0",
      subscriptionStartsFrom: values.subscriptionStartsFrom?.format("YYYY-MM-DD"),
      chargeOn: new Date().getDate().toString(), // Current day
      chargeUntil: values.recurringType === "2" ? "1" : "12", // 1 for Monthly, 12 for Yearly
    };
    if (formMode === "add") addMutation.mutate(payload);
    else updateMutation.mutate(payload);
  };

  const handleConfirmOk = () => {
    if (confirmModal.action === "deactivate") deactivateMutation.mutate();
    if (confirmModal.action === "delete") deleteMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <SubscriptionOverviewCard
        details={details}
        loading={isLoading}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />
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

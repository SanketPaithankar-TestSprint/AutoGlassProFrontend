import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVendorContacts, createVendorContact, updateVendorContact, deleteVendorContact } from "../../../api/vendorApi";
import { getValidToken } from "../../../api/getValidToken";
import { notification } from "antd";
import { useTranslation } from "react-i18next";

export const useVendors = () => {
    const queryClient = useQueryClient();
    const token = getValidToken();
    const { t } = useTranslation();

    const { data: vendors = [], isLoading, error } = useQuery({
        queryKey: ['vendors'],
        queryFn: () => getVendorContacts(token),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: (data) => createVendorContact(token, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            notification.success({ message: t('vendors.createdSuccess') || 'Vendor created successfully' });
        },
        onError: (err) => {
            notification.error({ message: t('vendors.createFailed') || 'Failed to create vendor', description: err.message });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateVendorContact(token, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            notification.success({ message: t('vendors.updatedSuccess') || 'Vendor updated successfully' });
        },
        onError: (err) => {
            notification.error({ message: t('vendors.updateFailed') || 'Failed to update vendor', description: err.message });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteVendorContact(token, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            notification.success({ message: t('vendors.deletedSuccess') || 'Vendor deleted successfully' });
        },
        onError: (err) => {
            notification.error({ message: t('vendors.deleteFailed') || 'Failed to delete vendor', description: err.message });
        }
    });

    return {
        vendors,
        isLoading,
        error,
        createVendor: createMutation.mutateAsync,
        updateVendor: updateMutation.mutateAsync,
        deleteVendor: deleteMutation.mutateAsync,
        isSaving: createMutation.isLoading || updateMutation.isLoading,
        isDeleting: deleteMutation.isLoading
    };
};

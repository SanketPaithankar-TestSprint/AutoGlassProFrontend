import React, { useState } from "react";
import urls from "../../config";
import { getValidToken } from "../../api/getValidToken";

// 1. Reusable Input Component to remove visual clutter
const FormInput = ({ label, name, value, onChange, required = false, type = "text", ...props }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
        <input
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            type={type}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
            placeholder={`Enter ${label}`}
            {...props}
        />
    </div>
);

export default function CustomerPanel({ prefill = {}, setCanShowQuotePanel, setPanel }) {
    // 2. Initialize state with defaults to avoid "uncontrolled to controlled" warnings
    const [formData, setFormData] = useState({
        firstName: prefill.firstName || "",
        lastName: prefill.lastName || "",
        email: prefill.email || "",
        phone: prefill.phone || "",
        alternatePhone: prefill.alternatePhone || "",
        addressLine1: prefill.addressLine1 || "",
        addressLine2: prefill.addressLine2 || "",
        city: prefill.city || "",
        state: prefill.state || "",
        postalCode: prefill.postalCode || "",
        country: prefill.country || "",
        preferredContactMethod: prefill.preferredContactMethod ? prefill.preferredContactMethod.toLowerCase() : "phone",
        notes: prefill.notes || "",
        vehicleYear: prefill.vehicleYear || prefill.year || "",
        vehicleMake: prefill.vehicleMake || prefill.make || "",
        vehicleModel: prefill.vehicleModel || prefill.model || "",
        vehicleStyle: prefill.vehicleStyle || prefill.body || "",
        licensePlateNumber: prefill.licensePlateNumber || "",
        vin: prefill.vin || "",
        vehicleNotes: prefill.vehicleNotes || "",
    });

    // 3. Consolidated Status State
    const [status, setStatus] = useState({ type: "idle", message: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Submitting..." });

        try {
            const token = await getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/customers/create-with-vehicle`, {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    vehicleYear: Number(formData.vehicleYear) || 0,
                }),
            });

            if (!response.ok) throw new Error(await response.text());

            const data = await response.json();

            if (data.customerId && data.vehicleId) {
                setStatus({ type: "success", message: "Customer created successfully!" });
                if (setCanShowQuotePanel) setCanShowQuotePanel(true);
                if (setPanel) setPanel("quote");
            } else {
                throw new Error("Invalid response from server.");
            }
        } catch (err) {
            setStatus({ type: "error", message: err.message || "Network error occurred." });
        }
    };

    return (
        <div className="mb-8 p-6 bg-white rounded-xl border border-violet-100 shadow-lg max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-violet-800">New Customer Profile</h3>
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">Draft</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} required type="email" />
                    <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} required type="tel" />
                    <FormInput label="Alt Phone" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} />

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Contact Method</label>
                        <select
                            name="preferredContactMethod"
                            value={formData.preferredContactMethod}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        >
                            <option value="phone">Phone</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 2: Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <FormInput label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
                    </div>
                    <FormInput label="Address Line 2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                    <FormInput label="City" name="city" value={formData.city} onChange={handleChange} required />
                    <FormInput label="State" name="state" value={formData.state} onChange={handleChange} required />
                    <FormInput label="Zip Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                    <FormInput label="Country" name="country" value={formData.country} onChange={handleChange} required />
                </div>

                <hr className="border-gray-100" />

                {/* Section 3: Vehicle Details */}
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vehicle Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Year" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} required type="number" />
                    <FormInput label="Make" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} required />
                    <FormInput label="Model" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} required />
                    <FormInput label="Style/Body" name="vehicleStyle" value={formData.vehicleStyle} onChange={handleChange} />
                    <FormInput label="License Plate" name="licensePlateNumber" value={formData.licensePlateNumber} onChange={handleChange} />
                    <FormInput label="VIN" name="vin" value={formData.vin} onChange={handleChange} />
                    <div className="md:col-span-3">
                        <FormInput label="Vehicle Notes" name="vehicleNotes" value={formData.vehicleNotes} onChange={handleChange} />
                    </div>
                </div>

                {/* Action Bar */}
                <div className="pt-4 border-t flex flex-col items-end gap-3">
                    {status.message && (
                        <div className={`text-sm font-medium ${status.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                            {status.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status.type === "loading"}
                        className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold shadow-md transition-all"
                    >
                        {status.type === "loading" ? "Processing..." : "Create Customer & Vehicle"}
                    </button>
                </div>
            </form>
        </div>
    );
}
import React, { useState } from "react";
import { getValidToken } from "../../api/getValidToken";

export default function CustomerPanel({ prefill }) {
    const [customer, setCustomer] = useState({
        // userId: 0,
        firstName: prefill?.firstName || "",
        lastName: prefill?.lastName || "",
        email: prefill?.email || "",
        phone: prefill?.phone || "",
        alternatePhone: prefill?.alternatePhone || "",
        addressLine1: prefill?.addressLine1 || "",
        addressLine2: prefill?.addressLine2 || "",
        city: prefill?.city || "",
        state: prefill?.state || "",
        postalCode: prefill?.postalCode || "",
        country: prefill?.country || "",
        preferredContactMethod: prefill?.preferredContactMethod || "",
        notes: prefill?.notes || "",
        vehicleYear: prefill?.vehicleYear || prefill?.year || "",
        vehicleMake: prefill?.vehicleMake || prefill?.make || "",
        vehicleModel: prefill?.vehicleModel || prefill?.model || "",
        vehicleStyle: prefill?.vehicleStyle || prefill?.body || "",
        licensePlateNumber: prefill?.licensePlateNumber || "",
        vin: prefill?.vin || "",
        vehicleNotes: prefill?.vehicleNotes || ""
    });
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerError, setCustomerError] = useState(null);
    const [customerSuccess, setCustomerSuccess] = useState(null);

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({ ...prev, [name]: value }));
    };

    const handleCustomerSubmit = async (e) => {
        e.preventDefault();
        setCustomerLoading(true);
        setCustomerError(null);
        setCustomerSuccess(null);
        try {
            const token = await getValidToken();
            const response = await fetch("http://localhost:8080/api/v1/customers/create-with-vehicle", {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...customer,
                    vehicleYear: Number(customer.vehicleYear) || 0
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                setCustomerError(errorText || "Failed to create customer.");
            } else {
                setCustomerSuccess("Customer created successfully!");
            }
        } catch (err) {
            setCustomerError("Network error. Please try again.");
        }
        setCustomerLoading(false);
    };

    return (
        <div className="mb-8 p-6 bg-white rounded-xl border border-violet-200 shadow-md max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-violet-700">Customer Information</h3>
            <form onSubmit={handleCustomerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="firstName" value={customer.firstName} onChange={handleCustomerChange} placeholder="First Name" className="border rounded px-3 py-2" required />
                <input name="lastName" value={customer.lastName} onChange={handleCustomerChange} placeholder="Last Name" className="border rounded px-3 py-2" required />
                <input name="email" value={customer.email} onChange={handleCustomerChange} placeholder="Email" className="border rounded px-3 py-2" required />
                <input name="phone" value={customer.phone} onChange={handleCustomerChange} placeholder="Phone" className="border rounded px-3 py-2" required />
                <input name="alternatePhone" value={customer.alternatePhone} onChange={handleCustomerChange} placeholder="Alternate Phone" className="border rounded px-3 py-2" />
                <input name="addressLine1" value={customer.addressLine1} onChange={handleCustomerChange} placeholder="Address Line 1" className="border rounded px-3 py-2" required />
                <input name="addressLine2" value={customer.addressLine2} onChange={handleCustomerChange} placeholder="Address Line 2" className="border rounded px-3 py-2" />
                <input name="city" value={customer.city} onChange={handleCustomerChange} placeholder="City" className="border rounded px-3 py-2" required />
                <input name="state" value={customer.state} onChange={handleCustomerChange} placeholder="State" className="border rounded px-3 py-2" required />
                <input name="postalCode" value={customer.postalCode} onChange={handleCustomerChange} placeholder="Postal Code" className="border rounded px-3 py-2" required />
                <input name="country" value={customer.country} onChange={handleCustomerChange} placeholder="Country" className="border rounded px-3 py-2" required />
                <select
                    name="preferredContactMethod"
                    value={customer.preferredContactMethod}
                    onChange={handleCustomerChange}
                    className="border rounded px-3 py-2"
                >
                    <option value="">Select Preferred Contact Method</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                </select>
                <input name="notes" value={customer.notes} onChange={handleCustomerChange} placeholder="Notes" className="border rounded px-3 py-2 md:col-span-2" />
                <input name="vehicleYear" value={customer.vehicleYear} onChange={handleCustomerChange} placeholder="Vehicle Year" className="border rounded px-3 py-2" required type="number" min="1900" max="2100" />
                <input name="vehicleMake" value={customer.vehicleMake} onChange={handleCustomerChange} placeholder="Vehicle Make" className="border rounded px-3 py-2" required />
                <input name="vehicleModel" value={customer.vehicleModel} onChange={handleCustomerChange} placeholder="Vehicle Model" className="border rounded px-3 py-2" required />
                <input name="vehicleStyle" value={customer.vehicleStyle} onChange={handleCustomerChange} placeholder="Vehicle Style" className="border rounded px-3 py-2" />
                <input name="licensePlateNumber" value={customer.licensePlateNumber} onChange={handleCustomerChange} placeholder="License Plate Number" className="border rounded px-3 py-2" />
                <input name="vin" value={customer.vin} onChange={handleCustomerChange} placeholder="VIN" className="border rounded px-3 py-2" />
                <input name="vehicleNotes" value={customer.vehicleNotes} onChange={handleCustomerChange} placeholder="Vehicle Notes" className="border rounded px-3 py-2 md:col-span-2" />
                <div className="md:col-span-2 flex flex-col gap-2 mt-2">
                    <button type="submit" disabled={customerLoading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:from-violet-400 hover:to-fuchsia-400 transition">
                        {customerLoading ? "Submitting..." : "Create Customer"}
                    </button>
                    {customerError && <div className="text-red-500 text-sm">{customerError}</div>}
                    {customerSuccess && <div className="text-green-600 text-sm">{customerSuccess}</div>}
                </div>
            </form>
        </div>
    );
}

import React, { useState } from "react";
import SearchByVin from "./SearchByvin";
import OrderPage from "./OrderPage";
import InvoiceForm from "./InvoiceForm";

export default function SearchByVinPage()
{
    const [vinData, setVinData] = useState(null);

    return (
        <div className=" mx-auto p-4 md:p-8 space-y-6">
            <h1 className="text-2xl font-semibold">Search by VIN</h1>

            {/* Inline VIN search */}
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                <SearchByVin
                    autoDecode
                    delayMs={500}
                    onDecoded={(data) => setVinData(data)}
                />
            </div>

            {/* When we have a successful decode, render Order + Invoice below */}
            {vinData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                        <OrderPage data={vinData} />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                        <InvoiceForm prefill={{
                            year: vinData?.year || "",
                            make: vinData?.make || "",
                            model: vinData?.model || "",
                            body: vinData?.body_type || vinData?.vehicle_type || "",
                            vin: vinData?.vin || ""
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}

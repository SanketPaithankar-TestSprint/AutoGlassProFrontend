import React, { useState } from "react";
import SearchByVin from "./SearchByvin";
import OrderPage from "../OrderPage";
import InvoiceForm from "../InvoiceForm";

export default function SearchByVinPage()
{
  const [vinData, setVinData] = useState(null);

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Main VIN search card */}
      <div
        className="
          rounded-2xl border border-slate-800
          bg-slate-900/70 backdrop-blur-lg
          shadow-xl shadow-slate-950/70
          p-4 md:p-6
        "
      >
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
            Search by VIN
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Enter a full 17-character VIN to decode vehicle details and prefill
            order and invoice information.
          </p>
        </div>

        {/* Inline VIN search */}
        <SearchByVin
          autoDecode
          delayMs={500}
          onDecoded={(data) => setVinData(data)}
        />
      </div>

      {/* When we have a successful decode, render Order + Invoice below */}
      {vinData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order section */}
          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900/70 backdrop-blur-lg
              shadow-xl shadow-slate-950/70
              p-4 md:p-6
            "
          >
            <h2 className="text-lg font-semibold text-slate-50 mb-3">
              Order Details
            </h2>
            <OrderPage data={vinData} />
          </div>

          {/* Invoice section */}
          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900/70 backdrop-blur-lg
              shadow-xl shadow-slate-950/70
              p-4 md:p-6
            "
          >
            <h2 className="text-lg font-semibold text-slate-50 mb-3">
              Invoice Preview
            </h2>
            <InvoiceForm
              prefill={{
                year: vinData?.year || "",
                make: vinData?.make || "",
                model: vinData?.model || "",
                body: vinData?.body_type || vinData?.vehicle_type || "",
                vin: vinData?.vin || "",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import SearchByVin from "./SearchByvin";
import OrderPage from "../OrderPage";
import InvoiceForm from "../InvoiceForm";

export default function SearchByVinPage()
{
  const [vinData, setVinData] = useState(null);

  return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 mx-auto p-4 md:p-8 space-y-6">
      {/* Main VIN search card */}
      <div
        className="
          rounded-2xl border border-slate-800
          bg-slate-900/70 backdrop-blur-lg
          shadow-xl shadow-slate-950/70
          p-4 md:p-6
          text-slate-50
        "
      >
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-semibold">
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
              text-slate-50
            "
          >
            <h2 className="text-lg font-semibold mb-3">
              Order Details
            </h2>
            <div className="text-slate-200 text-sm">
              <OrderPage data={vinData} />
            </div>
          </div>

          {/* Invoice section */}
          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900/70 backdrop-blur-lg
              shadow-xl shadow-slate-950/70
              p-4 md:p-6
              text-slate-50
            "
          >
            <h2 className="text-lg font-semibold mb-3">
              Invoice Preview
            </h2>
            <div className="text-slate-200 text-sm">
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
        </div>
      )}
    </div>
  );
}

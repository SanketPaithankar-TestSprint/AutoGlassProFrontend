import { useState } from "react";
import SearchByVin from "./SearchByvin";
import OrderPage from "../OrderPage";
import QuoteDetails from "../QuoteDetails";

export default function SearchByVinPage() {
  const [vinData, setVinData] = useState(null);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 mx-auto p-2 md:p-4 space-y-2">
      {/* Main VIN search card */}
      <div
        className="
          rounded-2xl border border-slate-800
          bg-slate-900/70 backdrop-blur-lg
          shadow-xl shadow-slate-950/70
          p-3
          text-slate-50
        "
      >
        <div className="mb-2">
          <h1 className="text-lg md:text-xl font-semibold">
            Search by VIN
          </h1>
        </div>

        {/* Inline VIN search */}
        <SearchByVin
          autoDecode
          delayMs={500}
          onDecoded={(data) => {
            setVinData(data);
          }}
        />
      </div>

      {/* When we have a successful decode, render Order + Invoice below */}
      {vinData && (
        <div className="flex flex-col gap-2">
          {/* Order section */}
          <div
            className="
              rounded-2xl border border-slate-800
              bg-slate-900/70 backdrop-blur-lg
              shadow-xl shadow-slate-950/70
              p-2
              text-slate-50
            "
          >
            <h2 className="text-base font-semibold mb-1">
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
              p-1
              text-slate-50
            "
          >
            <div className="text-slate-200 text-sm">
              <QuoteDetails
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

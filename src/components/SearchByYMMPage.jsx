import React, { useState } from "react";
import { message } from "antd";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "./CarGlassViewer";
import InvoiceForm from "./InvoiceForm";

const SearchByYMMPage = () =>
{
    const [modelId, setModelId] = useState(null); // Store the model ID
    const [selectedParts, setSelectedParts] = useState([]); // Store selected parts for the invoice
    const [vehicleInfo, setVehicleInfo] = useState({}); // Store vehicle info (year, make, model)

    // Handle adding a part to the invoice
    const handleAddPart = (part) =>
    {
        setSelectedParts((prevParts) =>
        {
            // Avoid duplicates
            if (prevParts.find((p) => p.code === part.code))
            {
                message.warning("Part already added to the invoice.");
                return prevParts;
            }
            return [...prevParts, part];
        });
    };

    // Handle removing a part from the invoice
    const handleRemovePart = (partCode) =>
    {
        setSelectedParts((prevParts) => prevParts.filter((p) => p.code !== partCode));
    };

    // Handle vehicle info update from SearchByYMM
    const handleVehicleInfoUpdate = (info) =>
    {
        setVehicleInfo(info);
    };

    return (
        <div style={{ padding: "24px" }}>
            <h1>Search by Year, Make, and Model</h1>

            {/* SearchByYMM Component */}
            <SearchByYMM
                onModelIdFetched={(id) => setModelId(id)} // Set the model ID
                onVehicleInfoUpdate={handleVehicleInfoUpdate} // Update vehicle info
            />

            {/* CarGlassViewer Component */}
            {modelId && (
                <div className="mt-8">
                    <CarGlassViewer
                        modelId={modelId}
                        onPartSelect={handleAddPart} // Add selected parts to the invoice
                    />
                </div>
            )}

            {/* InvoiceForm Component */}
            <div className="mt-8">
                <InvoiceForm
                    prefill={vehicleInfo} // Prefill vehicle info
                    parts={selectedParts} // Pass selected parts
                    onRemovePart={handleRemovePart} // Remove parts from the invoice
                />
            </div>
        </div>
    );
};

export default SearchByYMMPage;
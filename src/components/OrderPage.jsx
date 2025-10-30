import React from "react";
import { Tag } from "antd";

const Row = ({ label, value }) => (
    <div className="grid grid-cols-12 gap-3 py-2">
        <div className="col-span-4 md:col-span-3 text-gray-500">{label}</div>
        <div className="col-span-8 md:col-span-9 font-medium">{value ?? "-"}</div>
    </div>
);

export default function OrderPage({ data })
{
    if (!data)
    {
        debugger;
        return <div className="text-gray-500">Enter a VIN to view vehicle details.</div>;
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-1">Order</h2>
            <p className="text-gray-500 mb-4">Vehicle details decoded from VIN</p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <Tag>{data?.year ?? "—"}</Tag>
                <Tag>{data?.make ?? "—"}</Tag>
                <Tag>{data?.model ?? "—"}</Tag>
                {data?.drive_type && <Tag>{data.drive_type}</Tag>}
                {data?.fuel_type && <Tag>{data.fuel_type}</Tag>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                    <Row label="VIN" value={data?.vin} />
                    <Row label="Year" value={data?.year} />
                    <Row label="Make" value={data?.make} />
                    <Row label="Model" value={data?.model} />
                    <Row label="Body Type" value={data?.body_type} />
                    <Row label="Vehicle Type" value={data?.vehicle_type} />
                </div>
                <div>
                </div>
            </div>
        </div>
    );
}

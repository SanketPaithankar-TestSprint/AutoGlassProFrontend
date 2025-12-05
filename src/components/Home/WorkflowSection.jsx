import React from "react";
import {
    FileTextOutlined,
    CheckSquareOutlined,
    ToolOutlined,
    CreditCardOutlined
} from "@ant-design/icons";

const steps = [
    {
        icon: <FileTextOutlined className="text-4xl text-orange-400" />,
        title: "Create Quote",
        description: "Generate professional quotes with customer info, vehicle details, glass parts, labor costs, and automatic pricing calculations in minutes."
    },
    {
        icon: <CheckSquareOutlined className="text-4xl text-emerald-500" />,
        title: "Approve & Convert",
        description: "Customer reviews and accepts quote. System automatically converts to work order and schedules service with assigned technician."
    },
    {
        icon: <ToolOutlined className="text-4xl text-slate-400" />,
        title: "Execute Service",
        description: "Technicians complete work in field with before/after photo documentation, time logging, and customer signature confirmation."
    },
    {
        icon: <CreditCardOutlined className="text-4xl text-blue-500" />,
        title: "Invoice & Track",
        description: "Automatically generate invoices with payment tracking. Monitor partial payments, overdue invoices, and late fees all in one dashboard."
    }
];

const WorkflowSection = () => {
    return (
        <section className="py-16 px-4 max-w-7xl mx-auto bg-slate-50/50">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Workflow from Quote to Invoice
                </h2>
                <p className="text-slate-500 text-lg">
                    Complete lifecycle management of every automotive glass service
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 text-center group"
                    >
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-200">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                {step.icon}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {step.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WorkflowSection;

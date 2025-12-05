import React from "react";

const steps = [
    {
        number: "1",
        title: "Enter Customer & Vehicle",
        description: "Select or create customer, lookup vehicle by VIN or manual entry. All info auto-populated for accuracy."
    },
    {
        number: "2",
        title: "Select Glass Parts",
        description: "Browse NAGS-classified glass parts by vehicle compatibility. See real-time pricing and available inventory."
    },
    {
        number: "3",
        title: "Add Labor & Calculate",
        description: "Enter hourly rate and estimated hours. System auto-calculates totals with tax and discounts applied."
    },
    {
        number: "4",
        title: "Send or Convert",
        description: "Send professional quote to customer or convert directly to work order. Track status until invoice paid."
    }
];

const ProcessSection = () => {
    return (
        <section className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Simple 4-Step Process
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 text-center"
                    >
                        <div className="mb-6">
                            <div className="w-12 h-12 mx-auto rounded-full bg-[#1890ff] text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200">
                                {step.number}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 h-12 flex items-center justify-center">
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

export default ProcessSection;

import React from "react";
import { CheckOutlined } from "@ant-design/icons";

const models = [
    {
        icon: "🏪",
        title: "Shop Owners",
        description: "Manage your brick-and-mortar location with multiple staff members, handle billing, and scale your business.",
        features: [
            "Full platform access",
            "Unlimited employee management",
            "Multi-location support",
            "Advanced reporting"
        ]
    },
    {
        icon: "🚐",
        title: "Remote Installers",
        description: "Work independently or lead a mobile team. Generate quotes on-the-go and manage service delivery.",
        features: [
            "Mobile-responsive design",
            "Job scheduling",
            "Photo documentation",
            "Customer communication"
        ]
    },
    {
        icon: "👨‍💼",
        title: "Repair Shops",
        description: "Streamline auto glass repairs with professional documentation, team coordination, and customer management.",
        features: [
            "Customer tracking",
            "Vehicle history",
            "Team workflows",
            "Payment management"
        ]
    }
];

const BusinessModelsSection = () => {
    return (
        <section className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Built for Different Business Models
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {models.map((model, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 text-center flex flex-col h-full"
                    >
                        <div className="mb-6">
                            <div className="text-4xl bg-slate-50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center">
                                {model.icon}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            {model.title}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed mb-8 min-h-[60px]">
                            {model.description}
                        </p>

                        <div className="mt-auto text-left space-y-3">
                            {model.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckOutlined className="text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BusinessModelsSection;

import React from "react";
import {
    CarOutlined,
    DollarOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined,
    LockOutlined
} from "@ant-design/icons";

const features = [
    {
        icon: <CarOutlined className="text-2xl text-red-500" />,
        title: "VIN-Based Vehicle Lookup",
        description: "Instantly identify vehicles using 17-character VINs. Auto-populates year, make, model, and style for 100% accuracy through NHTSA VPIC API integration."
    },
    {
        icon: <DollarOutlined className="text-2xl text-amber-500" />,
        title: "Real-Time Pricing",
        description: "Access up-to-date glass part pricing integrated with supplier databases. Automatic calculations for parts, labor, tax, and discounts in seconds."
    },
    {
        icon: <FileTextOutlined className="text-2xl text-slate-400" />,
        title: "Professional Documents",
        description: "Generate branded quotes, work orders, and invoices with customized pricing breakdowns, terms, and professional formatting ready to send to customers."
    },
    {
        icon: <TeamOutlined className="text-2xl text-indigo-600" />,
        title: "Team Collaboration",
        description: "Manage unlimited employees with role-based access control. Technicians, managers, sales teams, and administrators all work from one platform."
    },
    {
        icon: <UserOutlined className="text-2xl text-blue-500" />,
        title: "Customer Management",
        description: "Maintain detailed customer profiles, vehicle history, and service records. Track quotes, work orders, and invoices per customer for relationship management."
    },
    {
        icon: <LockOutlined className="text-2xl text-orange-400" />,
        title: "Enterprise Security",
        description: "All data encrypted and stored securely in the cloud. Automatic backups, role-based access control, and compliance-ready infrastructure."
    }
];

const FeaturesSection = () => {
    return (
        <section className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Powerful Features Built for Your Business
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="mb-6">
                            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
                                {feature.icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {feature.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;

import React from "react";
import { CheckOutlined } from "@ant-design/icons";

const benefits = [
    {
        title: "Instant Accuracy",
        description: "VIN lookup eliminates data entry errors and ensures correct parts matching."
    },
    {
        title: "Time Savings",
        description: "Automated quote generation and calculations reduce admin work by 70%."
    },
    {
        title: "Revenue Growth",
        description: "Professional quotes and follow-up improve conversion rates and customer retention."
    },
    {
        title: "Better Control",
        description: "Track every job from quote to invoice with complete visibility and reporting."
    },
    {
        title: "Scalability",
        description: "Manage growing teams and multiple locations without complexity."
    }
];

const WhyChooseSection = () => {
    return (
        <section className="py-20 px-4 bg-cyan-50/50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left Column: Text */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            Why Choose AutoPaneAI?
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            AutoPaneAI is purpose-built for the automotive glass industry. We understand your business challenges and provide solutions tailored to your success.
                        </p>
                    </div>

                    {/* Right Column: Benefits List */}
                    <div className="space-y-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="mt-1">
                                    <CheckOutlined className="text-green-500 text-lg" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-800">{benefit.title}: </span>
                                    <span className="text-slate-600">{benefit.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseSection;

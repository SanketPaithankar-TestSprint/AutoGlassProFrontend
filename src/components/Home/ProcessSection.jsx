import React, { useEffect, useRef, useState } from "react";

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
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px"
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2
                    className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text mb-4 opacity-0"
                    style={isVisible ? {
                        animation: `fadeInUp 0.6s ease-out 0.3s forwards`,
                        backgroundImage: 'linear-gradient(90deg, #7E5CFE 0%, #d946ef 100%)'
                    } : {}}
                >
                    Simple 4-Step Process
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 transition-all duration-200 text-center opacity-0 group"
                        style={isVisible ? {
                            animation: `fadeInUp 0.6s ease-out ${0.5 + (index * 0.2)}s forwards`
                        } : {}}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ffffff';
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(126, 92, 254, 0.6)'; // Purple glow
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0'; // slate-200
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-200">
                            <div
                                className="w-12 h-12 mx-auto rounded-full text-white flex items-center justify-center text-xl font-bold shadow-lg"
                                style={{ backgroundColor: '#7E5CFE', boxShadow: '0 10px 15px -3px rgba(126, 92, 254, 0.3)' }}
                            >
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

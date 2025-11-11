import React from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";

const HeroSection = () =>
{
    return (
        <section className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-24 px-5 text-center max-h-screen relative overflow-hidden">
            <div className="flex justify-center z-[1]">
                <div className="w-full max-w-4xl mx-auto">
                    {/* Heading */}
                    <h1 className="text-4xl font-bold mb-4 md:text-5xl">
                        Ready to simplify your glass replacement quotes?
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg mb-6 md:text-xl">
                        Join thousands of auto glass shops already saving time and increasing profits.
                    </p>

                    {/* Button */}
                    <div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<LinkOutlined />}
                            className="!bg-violet-600 !border-violet-600 !text-base !rounded-full !py-3 !px-10 hover:!bg-violet-700 hover:!border-violet-700"
                            onClick={() =>
                            {
                                const el = document.getElementById("signup");
                                if (el)
                                {
                                    el.scrollIntoView({ behavior: "smooth" });
                                }
                            }}
                        >
                            Get Started Free
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

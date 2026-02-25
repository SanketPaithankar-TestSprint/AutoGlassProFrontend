import vinDecoderImg from '../assets/vin-decoder.png';
import priceEngineImg from '../assets/price-engine.png';
import autoCalcImg from '../assets/automatic-calculations.png';

export const sectionDetails = {
    "quoting-and-pricing": {
        title: "Precision Quoting: Win the Job and Maximize Profit.",
        description: "Dive deep into our comprehensive quoting and pricing features designed to eliminate errors and maximize your shop's profitability.",
        color: "from-blue-500 to-cyan-500",
        features: [
            {
                id: "vin-decoder",
                title: "VIN Decoder & Search",
                content: "Utilizing the NHTSA VPIC API, our VIN Decoder provides guaranteed accurate vehicle glass search. Simply enter the Year, Make, Model, Style, or scan the VIN to instantly retrieve precise vehicle details. We classify all parts using industry-standard NAGS codes (DB, DD, DQ, DR, DV, DW), ensuring you select the correct glass every single time. This eliminates guesswork, reduces ordering errors, and drastically cuts down on the time spent on the phone with suppliers.",
                image: vinDecoderImg,
                benefits: [
                    "Guaranteed accuracy with NHTSA VPIC API",
                    "Supports Year, Make, Model, Style, or direct VIN lookup",
                    "Industry-standard NAGS code classification",
                    "Eliminates ordering errors and supplier delays"
                ]
            },
            {
                id: "real-time-pricing",
                title: "Real-Time Price Engine",
                content: "Our Real-Time Price Engine seamlessly integrates with the NAGS database to provide up-to-the-minute part pricing. But we don't stop there—you can define your own custom labor cost entries, kit prices, and markup rules. This ensures that every quote you generate accurately reflects the current market values while strictly protecting your required profit margins.",
                image: priceEngineImg,
                benefits: [
                    "Live integration with NAGS pricing database",
                    "Customizable labor cost entries and installation kits",
                    "Flexible markup rules to protect strict margins",
                    "Always up-to-date with current market values"
                ]
            },
            {
                id: "automatic-calculations",
                title: "Automatic Calculations",
                content: "Say goodbye to manual math and calculator errors. APAI automatically applies your pre-configured custom labor rates, state or regional tax percentages, and customer-specific discounts. It instantly tallies the final sum, presenting the customer with a clear, professional, and mathematically flawless final price.",
                image: autoCalcImg,
                benefits: [
                    "Zero manual math or human calculation errors",
                    "Automatic application of shop-specific custom labor rates",
                    "Pre-configured tax rules and discount handling",
                    "Instant, clear, and professional final totals"
                ]
            },
            {
                id: "professional-documents",
                title: "Professional Documents",
                content: "First impressions matter. APAI generates beautifully branded, easy-to-read Quote documents in PDF format. Add your shop's logo, custom terms of service, and contact information. Once generated, customers can securely approve the quotes quickly via email or SMS directly from the platform, accelerating your sales cycle.",
                image: "https://placehold.co/600x400/F59E0B/FFFFFF?text=Pro+Documents",
                benefits: [
                    "Branded, professional, auto-generated PDF quotes",
                    "Customizable terms of service and shop logo integration",
                    "Secure digital approval via Email or SMS links",
                    "Accelerates and streamlines the sales and booking cycle"
                ]
            }
        ]
    },
    "work-order-and-field-service": {
        title: "Mobile Management: Empower Your Technicians, Anywhere.",
        description: "Built for the mobile service economy, APAI gives your remote installers and shop technicians the exact tools they need to complete jobs efficiently from any device.",
        color: "from-violet-500 to-fuchsia-500",
        features: [
            {
                id: "digital-work-order",
                title: "Digital Work Order",
                content: "When a customer approves a quote, it instantly and automatically converts into a detailed Digital Work Order. There's no double data entry. Technicians can access these work orders directly on their mobile phones, complete with pre-populated customer contact details, service location, and the precise list of NAGS glass parts and kits required for the installation.",
                image: "https://placehold.co/600x400/8B5CF6/FFFFFF?text=Digital+Work+Order",
                benefits: [
                    "Zero double entry; quotes instantly convert to work orders",
                    "Fully optimized for mobile viewing by technicians in the field",
                    "Customer details, location, and parts list all in one place",
                    "Reduces miscommunication between the front office and installers"
                ]
            },
            {
                id: "time-and-labor-tracking",
                title: "Time and Labor Tracking",
                content: "Accountability and profitability go hand-in-hand. With APAI, technicians can quickly tap to log their start and end times right inside the mobile app for each specific job. This data is automatically synced to the cloud, allowing shop owners to accurately track labor hours against the estimated job time and clearly understand their true labor costs and efficiency.",
                image: "https://placehold.co/600x400/A855F7/FFFFFF?text=Time+Tracking",
                benefits: [
                    "Simple one-tap mobile time logging for technicians",
                    "Track real labor hours vs. estimated job time",
                    "Invaluable data for calculating actual shop profitability",
                    "Eliminates paper timesheets and manual payroll entry"
                ]
            },
            {
                id: "photo-and-signature-capture",
                title: "Photo & Signature Capture",
                content: "Protect your shop from liability and streamline the checkout process. APAI's mobile interface allows technicians to easily snap and upload mandatory Before and After photos of the vehicle glass directly to the work order. Upon completion, technicians can present their phone to the customer to collect a digital signature, legally securing your records and confirming the job is done to their satisfaction.",
                image: "https://placehold.co/600x400/D946EF/FFFFFF?text=Photo+%26+Sign",
                benefits: [
                    "Direct mobile upload for Before/After liability photos",
                    "Instant digital customer signature capture on-site",
                    "All files automatically attached and saved to the cloud work order",
                    "Significantly reduces dispute risks and protects the shop"
                ]
            },
            {
                id: "role-based-access",
                title: "Role-Based Access",
                content: "Security and privacy are paramount when running a growing team. APAI features comprehensive role-based access control. You can customize exactly what each team member sees and can do. Assign your front desk as 'Admin', your remote workers as 'Mobile Technicians' with restricted financial views, and keep total control as the 'Shop Owner'.",
                image: "https://placehold.co/600x400/EC4899/FFFFFF?text=Role+Access",
                benefits: [
                    "Granular permission controls for every employee",
                    "Hide sensitive financial or pricing data from field technicians",
                    "Pre-built roles: Shop Owner, Admin, Mobile Tech",
                    "Easily scale and manage your team safely"
                ]
            }
        ]
    },
    "invoicing-and-payments": {
        title: "Financial Control: Simplify Billing and Accelerate Cash Flow.",
        description: "Turn completed jobs into paid invoices rapidly with robust financial tracking, seamless insurance claim management, and automated customer follow-ups.",
        color: "from-emerald-500 to-teal-500",
        features: [
            {
                id: "insurance-claim-tracking",
                title: "Insurance Claim Tracking",
                content: "Dealing with insurance shouldn't slow down your cash flow. APAI natively supports mixed-payment jobs. You can easily log critical insurance details directly on the invoice, including the carrier, the specific claim number, and the customer's deductible amount. This keeps all necessary billing information centralized and ready for payout reconciliation.",
                image: "https://placehold.co/600x400/10B981/FFFFFF?text=Insurance+Tracking",
                benefits: [
                    "Dedicated fields for Carrier and Claim Number",
                    "Split billing support for Customer Deductible vs. Insurance Payout",
                    "Centralized financial records for easy reconciliation",
                    "Professional documentation ready for insurance submission"
                ]
            },
            {
                id: "status-management",
                title: "Status Management",
                content: "Never lose track of who owes you money. APAI provides clear, color-coded status tracking for every single invoice: Draft, Unpaid, Partial Paid, Paid, and Overdue. Furthermore, you can set custom payment terms (like 'Due on Receipt' or 'Net 30') for commercial fleet accounts, giving your accounting team perfect clarity on outstanding receivables.",
                image: "https://placehold.co/600x400/059669/FFFFFF?text=Status+Tracking",
                benefits: [
                    "Instantly filter and view all 'Overdue' or 'Unpaid' jobs",
                    "Customizable payment terms for commercial accounts (Net 30/60)",
                    "Track 'Partial Paid' statuses for split payments",
                    "Clear financial dashboards for your accounting team"
                ]
            },
            {
                id: "automated-reminders",
                title: "Automated Reminders",
                content: "Stop chasing down late payments manually. APAI features an intelligent, automated follow-up system. Once an invoice crosses its due date and enters the 'Overdue' status, the platform automatically triggers polite, professional payment reminder emails to the customer. This hands-off approach significantly reduces your Days Sales Outstanding (DSO) and boosts your cash flow.",
                image: "https://placehold.co/600x400/34D399/FFFFFF?text=Auto+Reminders",
                benefits: [
                    "Zero-touch automated email follow-ups for late payments",
                    "Significantly decreases late payments and accelerates cash flow",
                    "Customizable reminder templates and schedules",
                    "Frees up your front desk from making awkward collection calls"
                ]
            },
            {
                id: "comprehensive-reporting",
                title: "Comprehensive Reporting",
                content: "Data is the key to scaling your auto glass shop. APAI's reporting suite gives you a bird's-eye view of your financial health. Generate detailed reports that analyze total revenue trends, individual job profitability, and even specific technician performance metrics. Make confident, data-driven decisions on where to invest your marketing or which accounts are your most valuable.",
                image: "https://placehold.co/600x400/047857/FFFFFF?text=Reporting%2BAnalytics",
                benefits: [
                    "Analyze true job profitability by factoring in exact labor/part costs",
                    "Track revenue trends over weeks, months, or years",
                    "Evaluate individual technician efficiency and performance",
                    "Exportable data for your CPA or accounting software"
                ]
            }
        ]
    },
    "customer-engagement-and-contact": {
        title: "Omnichannel Engagement: Connect and Convert on Autopilot.",
        description: "Be everywhere your customers are. APAI provides seamless, multi-channel communication tools—from embedded website widgets to live SMS chat—so you never miss a lead.",
        color: "from-amber-500 to-orange-500",
        features: [
            {
                id: "embeddable-custom-form",
                title: "Embeddable Custom Form",
                content: "Stop relying on clunky third-party form builders. APAI provides a beautiful, conversion-optimized Quote Request widget that you can embed directly into your auto glass shop's existing website. When a customer fills out this visual, step-by-step form (capturing their vehicle details and glass needs), the data flows instantly into your APAI dashboard as a hot new lead, complete with perfectly accurate NAGS part numbers already attached.",
                image: "https://placehold.co/600x400/F59E0B/FFFFFF?text=Custom+Form",
                benefits: [
                    "Easy drop-in embed code works on WordPress, Wix, Squarespace, etc.",
                    "Visual, step-by-step UI designed specifically to maximize conversions",
                    "Automatically pulls NAGS part numbers before you even speak to the client",
                    "All leads instantly populate your APAI dashboard for quick quoting"
                ]
            },
            {
                id: "live-customer-chat",
                title: "Live Customer Chat",
                content: "Customers expect instant answers. With APAI's integrated live chat service, you can engage with website visitors in real-time. Whether they are asking about availability or pricing, your front desk can answer them immediately from the centralized APAI dashboard, drastically increasing the chance of converting a browsing visitor into a booked appointment.",
                image: "https://placehold.co/600x400/D97706/FFFFFF?text=Live+Chat",
                benefits: [
                    "Engage website visitors instantly before they call a competitor",
                    "Manage all chats directly from the centralized APAI dashboard",
                    "Option to quickly transition chats into formal quotes",
                    "Improves customer satisfaction and builds immediate trust"
                ]
            },
            {
                id: "full-theme-customization",
                title: "Full Theme Customization",
                content: "Your brand is your reputation. APAI ensures that your embeddable widgets and customer-facing documents look like *your* company, not ours. You have full control over the visual theme: customize your primary colors, upload your shop logo, adjust font styling, and configure the map appearances to perfectly match your website's aesthetic.",
                image: "https://placehold.co/600x400/B45309/FFFFFF?text=Theme+Settings",
                benefits: [
                    "Match widget styling perfectly to your existing website brand",
                    "Upload custom logos for quotes, invoices, and the customer portal",
                    "Adjust primary colors, gradients, and font settings",
                    "Present a highly professional, cohesive image to every customer"
                ]
            }
        ]
    }
};

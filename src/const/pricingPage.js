const commonTierFeatures = [
  {
    label: "NAGS Data & VIN Decoding",
    description: "Access US NAGS Database, decode VINs instantly, and generate accurate auto glass quotes."
  },
  {
    label: "Job Dashboard & Invoices",
    description: "Manage all your jobs in one dashboard, track service status, and generate professional invoices."
  },
  {
    label: "Live Pricing Integration",
    description: "Connect directly with glass distributors for real-time pricing and availability checks."
  },
  {
    label: "AI Contact Chat",
    description: "Smart contact chat that use AI to follow up with leads and schedule appointments automatically."
  },
  {
    label: "Analytics & ADAS Reports",
    description: "View shop performance analytics and manage ADAS calibration reports efficiently."
  },
];

export const freeTierFeatures = [
  {
    label: "Full Professional Access",
    description: "Try the full Professional experience free for 30 days. No credit card required to start."
  },
  {
    label: "VIN & Vehicle Search",
    description: "Search parts by VIN or Year/Make/Model to find the exact glass needed."
  },
  {
    label: "Real Quotes & Live Pricing",
    description: "Create actionable quotes for customers using live pricing data from your suppliers."
  },
  {
    label: "Team Access & Requests",
    description: "Invite team members and use custom request forms to streamline your workflow."
  },
  {
    label: "Keep Data on Upgrade",
    description: "All your data, settings, and history are preserved when you upgrade to a paid plan."
  },
  ...commonTierFeatures,
];

export const professionalTierFeatures = [
  {
    label: "Unlimited Vehicle Search",
    description: "Unlimited access to VIN decoding and Year/Make/Model lookups for all your jobs."
  },
  {
    label: "AI-Assisted Quoting",
    description: "Let AI help you build quotes faster by suggesting parts and labor times."
  },
  {
    label: "Custom Request Forms",
    description: "Embed custom quote request forms on your own website to capture leads directly."
  },
  {
    label: "Branded Quotes",
    description: "Send professional, branded quotes featuring your shop's logo and custom terms."
  },
  {
    label: "Team Roles & Employee Management",
    description: "Add employees ($49.99/user/mo) and grant specific access rights (managed by superuser)."
  },
  ...commonTierFeatures.map(feature => {
    if (feature.label === "Job Dashboard & Invoices") {
      return { ...feature, label: "Unlimited Job Dashboard & Invoices" };
    }
    return feature;
  }),

];

export const enterpriseTierFeatures = [

  {
    label: "Dedicated Account Manager",
    description: "Your own personal point of contact for priority support and onboarding."
  },
  {
    label: "SSO & Advanced Security",
    description: "Single Sign-On (SSO) integration and advanced security controls for your team."
  },
  {
    label: "Custom Contracts & SLA",
    description: "Tailored contracts with guaranteed Service Level Agreements (SLA)."
  },

];
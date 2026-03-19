export const articles = [
  {
    id: "1",
    title: "Getting Started with Your Account",
    description: "Learn how to set up your account and configure basic settings.",
    category: "Getting Started",
    lastUpdated: "2026-03-15",
    content: `
# Getting Started with Your Account

Welcome! This guide will help you set up your account and get started.

## Step 1: Complete Your Profile
Navigate to Settings > Profile and fill in your information:
- Full Name
- Email Address
- Profile Picture
- Contact Information

## Step 2: Configure Preferences
Set up your preferences to customize your experience:
- Notification Settings
- Language & Region
- Privacy Settings

## Step 3: Explore the Dashboard
Familiarize yourself with the main features:
- Overview section for quick stats
- Navigation menu for different modules
- Quick actions toolbar

## Need More Help?
If you have additional questions, don't hesitate to reach out to our support team!
    `,
  },
  {
    id: "2",
    title: "Understanding Billing and Payments",
    description: "Complete guide to managing your subscription and payment methods.",
    category: "Billing",
    lastUpdated: "2026-03-10",
    content: `
# Understanding Billing and Payments

Learn how to manage your subscription and billing information.

## Payment Methods
You can add multiple payment methods:
- Credit/Debit Cards
- PayPal
- Bank Transfer

## Subscription Plans
We offer flexible plans to suit your needs:
- Basic Plan - $19/month
- Professional Plan - $49/month
- Enterprise Plan - Custom pricing

## Invoices and Receipts
Access your billing history anytime from the Billing section.
    `,
  },
  {
    id: "3",
    title: "Advanced Features Overview",
    description: "Explore powerful features to maximize your productivity.",
    category: "Features",
    lastUpdated: "2026-03-12",
    content: `
# Advanced Features Overview

Unlock the full potential of our platform with these advanced features.

## Automation
Set up automated workflows to save time and reduce manual work.

## Integrations
Connect with your favorite tools:
- Slack
- Google Workspace
- Microsoft Teams
- Salesforce

## Analytics
Get detailed insights into your usage and performance metrics.

## API Access
For developers: comprehensive API documentation available.
    `,
  },
  {
    id: "4",
    title: "Troubleshooting Common Issues",
    description: "Solutions to frequently encountered problems.",
    category: "Troubleshooting",
    lastUpdated: "2026-03-18",
    content: `
# Troubleshooting Common Issues

Quick solutions to common problems you might encounter.

## Login Issues
- Forgot password? Use the "Reset Password" link
- Account locked? Contact support after 3 failed attempts
- Two-factor authentication not working? Try backup codes

## Performance Issues
- Clear your browser cache
- Disable browser extensions temporarily
- Check your internet connection
- Try a different browser

## Data Sync Problems
- Refresh the page
- Check your internet connection
- Contact support if issue persists

## Payment Failures
- Verify card details are correct
- Ensure sufficient funds
- Check with your bank for restrictions
    `,
  },
  {
    id: "5",
    title: "Security Best Practices",
    description: "Keep your account secure with these recommendations.",
    category: "Getting Started",
    lastUpdated: "2026-03-14",
    content: `
# Security Best Practices

Protect your account with these security measures.

## Strong Passwords
- Use at least 12 characters
- Combine letters, numbers, and symbols
- Don't reuse passwords from other sites

## Two-Factor Authentication
Enable 2FA for an extra layer of security.

## Regular Security Audits
- Review login activity
- Update recovery information
- Remove unused sessions

## Report Suspicious Activity
Contact us immediately if you notice anything unusual.
    `,
  },
];

export const tickets = [
  {
    id: "TCK-2024-001",
    subject: "Unable to access billing section",
    category: "Billing",
    priority: "High",
    description:
      "I'm getting an error when trying to access the billing page. The page shows a 403 error.",
    status: "In Progress",
    createdAt: "2026-03-18T10:30:00Z",
    updatedAt: "2026-03-18T14:20:00Z",
    chatEnabled: true,
  },
  {
    id: "TCK-2024-002",
    subject: "Feature request: Dark mode",
    category: "Features",
    priority: "Low",
    description: "It would be great to have a dark mode option for the dashboard.",
    status: "Open",
    createdAt: "2026-03-17T09:15:00Z",
    updatedAt: "2026-03-17T09:15:00Z",
  },
  {
    id: "TCK-2024-003",
    subject: "Data export completed successfully",
    category: "Features",
    priority: "Medium",
    description: "Requested data export for Q1 2026 analytics.",
    status: "Resolved",
    createdAt: "2026-03-15T16:45:00Z",
    updatedAt: "2026-03-16T11:30:00Z",
  },
];

export const chatMessages = {
  "TCK-2024-001": [
    {
      id: "msg-1",
      sender: "support",
      message:
        "Hello! I'm Sarah from the support team. I've reviewed your ticket about the billing section access issue. Let me help you with that.",
      timestamp: "2026-03-18T14:20:00Z",
      agentName: "Sarah Mitchell",
    },
    {
      id: "msg-2",
      sender: "user",
      message:
        "Hi Sarah, thanks for getting back to me. Yes, every time I click on Billing, I get a 403 error.",
      timestamp: "2026-03-18T14:22:00Z",
    },
    {
      id: "msg-3",
      sender: "support",
      message:
        "I see the issue. It looks like there was a permission configuration error on our end. I've just updated your account permissions. Can you try accessing the billing section now?",
      timestamp: "2026-03-18T14:25:00Z",
      agentName: "Sarah Mitchell",
    },
    {
      id: "msg-4",
      sender: "user",
      message: "Let me check... Yes! It's working now. Thank you so much!",
      timestamp: "2026-03-18T14:26:00Z",
    },
    {
      id: "msg-5",
      sender: "support",
      message:
        "Great! I'm glad it's resolved. Is there anything else I can help you with today?",
      timestamp: "2026-03-18T14:27:00Z",
      agentName: "Sarah Mitchell",
    },
  ],
};

export const categories = [
  { name: "Getting Started", count: 12 },
  { name: "Billing", count: 8 },
  { name: "Features", count: 15 },
  { name: "Troubleshooting", count: 20 },
  { name: "Security", count: 7 },
];

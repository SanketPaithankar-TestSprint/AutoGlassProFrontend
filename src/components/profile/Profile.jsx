import React, { useEffect, useState } from "react";
import { getProfile } from "../../api/getProfile";
import { getValidToken } from "../../api/getValidToken";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = getValidToken();
                if (!token) throw new Error("No token found. Please login.");
                const res = await getProfile(token);
                setProfile(res.data);
            } catch (err) {
                setError(err.message || "Failed to fetch profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Format address helper
    const formatAddress = () => {
        if (!profile) return "-";
        const parts = [
            profile.addressLine1,
            profile.addressLine2,
            profile.city,
            profile.state,
            profile.postalCode,
            profile.country
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "-";
    };
    debugger;
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-12">
            <h1 className="text-3xl font-extrabold mb-6 text-violet-700 flex items-center gap-2">
                <span className="inline-block bg-violet-100 text-violet-700 rounded-full px-3 py-1 text-lg font-bold">Profile</span>
            </h1>
            {loading ? (
                <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading profile...</div>
            ) : error ? (
                <div className="text-center py-12 text-lg text-red-500">{error}</div>
            ) : profile ? (
                <div className="space-y-4">
                    {/* Business Information */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Business Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Business Name</span>
                                <span className="text-gray-900 font-medium">{profile.businessName || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Owner Name</span>
                                <span className="text-gray-900 font-medium">{profile.ownerName || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">User Type</span>
                                <span className="text-gray-900 font-medium">
                                    <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-sm">
                                        {profile.userType || "-"}
                                    </span>
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Business License</span>
                                <span className="text-gray-900 font-medium font-mono text-sm">{profile.businessLicenseNumber || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">EIN</span>
                                <span className="text-gray-900 font-medium font-mono text-sm">{profile.ein || "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                                <span className="text-gray-900 font-medium">{profile.email || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Phone</span>
                                <span className="text-gray-900 font-medium">{profile.phone || "-"}</span>
                            </div>
                            {profile.alternatePhone && (
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Alternate Phone</span>
                                    <span className="text-gray-900 font-medium">{profile.alternatePhone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Address</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Full Address</span>
                                <span className="text-gray-900 font-medium">{formatAddress()}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">City</span>
                                    <span className="text-gray-900 font-medium">{profile.city || "-"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">State</span>
                                    <span className="text-gray-900 font-medium">{profile.state || "-"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Postal Code</span>
                                    <span className="text-gray-900 font-medium">{profile.postalCode || "-"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Country</span>
                                    <span className="text-gray-900 font-medium">{profile.country || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Account Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">User ID</span>
                                <span className="text-gray-900 font-medium font-mono">{profile.userId || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Created At</span>
                                <span className="text-gray-900 font-medium">
                                    {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "-"}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Updated At</span>
                                <span className="text-gray-900 font-medium">
                                    {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Profile;

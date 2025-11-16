import React, { useEffect, useState } from "react";
import { getProfile } from "../../api/getProfile";
import { getValidToken } from "../../api/getValidToken";

const Profile = () =>
{
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() =>
    {
        const fetchProfile = async () =>
        {
            setLoading(true);
            setError(null);
            try
            {
                const token = getValidToken();
                if (!token) throw new Error("No token found. Please login.");
                const res = await getProfile(token);
                setProfile(res.data);
            } catch (err)
            {
                setError(err.message || "Failed to fetch profile.");
            } finally
            {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-12">
            <h1 className="text-3xl font-extrabold mb-6 text-violet-700 flex items-center gap-2">
                <span className="inline-block bg-violet-100 text-violet-700 rounded-full px-3 py-1 text-lg font-bold">Profile</span>
            </h1>
            {loading ? (
                <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading profile...</div>
            ) : error ? (
                <div className="text-center py-12 text-lg text-red-500">{error}</div>
            ) : profile ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">User ID:</span>
                        <span className="text-gray-900 break-all">{profile.userId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">Username:</span>
                        <span className="text-gray-900">{profile.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">Email:</span>
                        <span className="text-gray-900">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">First Name:</span>
                        <span className="text-gray-900">{profile.firstName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">Last Name:</span>
                        <span className="text-gray-900">{profile.lastName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">Phone:</span>
                        <span className="text-gray-900">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">Roles:</span>
                        <span className="text-gray-900">{Array.isArray(profile.roles) ? profile.roles.join(", ") : "-"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 w-32">Created At:</span>
                        <span className="text-gray-900">{profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "-"}</span>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Profile;

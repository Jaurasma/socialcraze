"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function ProfileData({ session }) {
  const supabase = createClientComponentClient();
  const user = session?.user;
  const [profileData, setProfileData] = useState(null);
  const [followers, setFollowers] = useState(null);

  const fetchProfileData = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id);

      if (error) throw error;

      const userProfile = profiles[0];

      setProfileData(userProfile);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
    try {
      const { count, error: followerCountError } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      if (followerCountError) throw followerCountError;
      setFollowers(count);
    } catch (error) {
      console.error("Error fetching follower count:", error);
      setError(error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [supabase, user]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-slate-900 border border-slate-600 rounded-md shadow-md">
      <div className="flex flex-col items-center text-slate-200">
        {/* Profile Header */}
        {profileData && (
          <div className="text-center">
            <h1 className="text-3xl font-semibold">
              {profileData.username}'s profile
            </h1>
            {profileData.bio && (
              <p className="mt-2 text-sm text-slate-400">{profileData.bio}</p>
            )}
            {profileData.website && (
              <a
                href={
                  profileData.website.startsWith("http")
                    ? profileData.website
                    : `http://${profileData.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-slate-400 hover:text-slate-300"
              >
                {profileData.website}
              </a>
            )}
            {/* Follower amount counter */}
            <div className="flex justify-center items-center mt-4">
              {followers !== null && (
                <div className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md border border-gray-700">
                  <p className="text-lg">{followers} followers</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ProfileData;

"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PostItem from "../home/PostItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const spinAnimation = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const scaleAnimation = `
@keyframes scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
`;

function ProfileViewerPostList({ session }) {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [followingStatus, setFollowingStatus] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [animating, setAnimating] = useState(false);

  const params = useSearchParams();
  const userId = params.get("userId");
  const user = session?.user.id;

  const formatTimestamp = (timestamp) => {
    const postDate = new Date(timestamp);
    const currentDate = new Date();

    if (
      postDate.getFullYear() === currentDate.getFullYear() &&
      postDate.getMonth() === currentDate.getMonth() &&
      postDate.getDate() === currentDate.getDate()
    ) {
      return postDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (currentDate - postDate < 365 * 24 * 60 * 60 * 1000) {
      return postDate.toLocaleString([], {
        day: "numeric",
        month: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return postDate.toLocaleDateString();
    }
  };

  const [profile, setProfile] = useState([]);

  const followUser = async () => {
    const { error } = await supabase
      .from("followers")
      .insert([{ follower_id: user, user_id: userId }])
      .select();

    if (error) {
      console.error("Error following user", error);
      setError(error);
      return;
    }
    setAnimating(true);
    handleRefresh();
  };

  const unfollowUser = async () => {
    const { data, error } = await supabase
      .from("followers")
      .delete()
      .match({ follower_id: user, user_id: userId });

    if (error) {
      console.error("Error unfollowing user", error);
      setError(error);
      return;
    }
    setAnimating(true);
    handleRefresh();
  };

  const fetchUserAndPosts = async () => {
    if (!userId) return;

    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      setError(userError);
      return;
    }

    setProfile(userData);
    try {
      const { count, error: followerCountError } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      if (followerCountError) throw followerCountError;
      setFollowers(count);
      setAnimating(false);
    } catch (error) {
      console.error("Error fetching follower count:", error);
      setError(error);
    }
    try {
      let { data: posts, error } = await supabase
        .from("posts")
        .select("*, profiles (username)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedPosts = posts.map((post) => ({
        ...post,
        created_at: formatTimestamp(post.created_at),
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error);
    }
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("follower_id", user);

      if (error) {
        console.error("Error checking follower status:", error);
        throw error;
      }

      if (data && data.length > 0) {
        setFollowingStatus(true);
      } else {
        setFollowingStatus(false);
      }
    } catch (error) {
      console.error("Error fetching follower status:", error);
      setError(error);
    }
  };

  const toggleFollow = async () => {
    if (!followingStatus) {
      setFollowingStatus(true);
      followUser();
    } else {
      setFollowingStatus(false);
      unfollowUser();
    }
  };

  useEffect(() => {
    if (userId) fetchUserAndPosts();
  }, [supabase, userId]);

  const handleRefresh = () => {
    fetchUserAndPosts();
  };

  const handleSpinnignRefresh = () => {
    setSpinning(true);
    fetchUserAndPosts().finally(() =>
      setTimeout(() => setSpinning(false), 790)
    );
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-2 bg-slate-900 border border-slate-600 rounded-md shadow-md">
      <div className="flex flex-col items-center text-slate-200">
        <style>{`${spinAnimation} ${scaleAnimation}`}</style>
        {/* Profile Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold">
            {profile.username}'s profile
          </h1>
          {profile.bio && (
            <p className="mt-2 text-sm text-slate-400">{profile.bio}</p>
          )}
          {profile.website && (
            <a
              href={
                profile.website.startsWith("http")
                  ? profile.website
                  : `http://${profile.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-slate-400 hover:text-slate-300"
            >
              {profile.website}
            </a>
          )}
          <div className="flex justify-center items-center mt-4">
            {followers !== null && (
              <div
                className={`bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md border border-gray-700 ${
                  animating ? "animate-scale" : ""
                }`}
                onAnimationEnd={() => setAnimating(false)}
              >
                <p className="text-lg">{followers} followers</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleFollow}
            className={`self-end font-semibold py-2 px-4 mt-4 mb-4 border rounded transition-colors duration-300 ${
              followingStatus
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-sky-400 hover:bg-green-400 text-black"
            }`}
          >
            {followingStatus ? "Unfollow" : "Follow"}
          </button>
        </div>

        <button
          onClick={handleSpinnignRefresh}
          className="self-end bg-gray-800 hover:bg-gray-700 text-white font-semibold border-gray-700 py-2 px-4 mt-4 mb-4 rounded-full h-10 w-10 flex items-center justify-center"
        >
          <FontAwesomeIcon
            icon={faSyncAlt}
            size="lg"
            className={`refresh-icon ${spinning ? "animate-spin" : ""}`}
          />
        </button>
        {error && <p className="text-red-500 mt-4">{error.message}</p>}

        {/* Posts List */}
        <div className="w-full">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostItem key={post.id} post={post} session={session} />
            ))
          ) : (
            <p className="text-slate-400">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileViewerPostList;

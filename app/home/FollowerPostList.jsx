// PostList.jsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PostItem from "./PostItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const spinAnimation = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

function FollowerPostList({ session }) {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const formatTimestamp = (timestamp) => {
    const postDate = new Date(timestamp);
    const currentDate = new Date();

    if (
      postDate.getFullYear() === currentDate.getFullYear() &&
      postDate.getMonth() === currentDate.getMonth() &&
      postDate.getDate() === currentDate.getDate()
    ) {
      // Post is from today, show only time
      return postDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (currentDate - postDate < 365 * 24 * 60 * 60 * 1000) {
      // Post is less than a year old, show dd/mm and hh/mm
      return postDate.toLocaleString([], {
        day: "numeric",
        month: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Post is more than a year old, show full date
      return postDate.toLocaleDateString();
    }
  };

  const fetchPosts = async () => {
    try {
      // Fetch the list of user IDs the current user is following
      let { data: following, error: followingError } = await supabase
        .from("followers")
        .select("user_id")
        .eq("follower_id", session.user.id);

      if (followingError) throw followingError;

      // Extract the user IDs from the 'following' data
      const followedUserIds = following.map((f) => f.user_id);

      // Now, fetch posts only from those followed users
      let { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*, profiles (username)")
        .in("user_id", followedUserIds) // Filter posts by followed user IDs
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const formattedPosts = posts.map((post) => ({
        ...post,
        created_at: formatTimestamp(post.created_at),
      }));
      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [supabase]);

  const handleRefresh = () => {
    setSpinning(true);
    fetchPosts().finally(() => setTimeout(() => setSpinning(false), 790)); // Reset spinning state after 1 second
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-2 bg-slate-900 border border-slate-600 rounded-md shadow-md">
      <div className="flex flex-col flex-wrap items-center">
        <div className="flex justify-between items-start w-full mb-4 p-2">
          <h1 className="text-3xl font-semibold text-slate-200">Posts</h1>
          <button
            onClick={handleRefresh}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold border-gray-700 rounded-full h-10 w-10 flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faSyncAlt}
              size="lg"
              className={`refresh-icon ${spinning ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error.message}</p>}
      </div>
      <div className="max-w-lg">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} session={session} />
        ))}
      </div>
    </div>
  );
}

export default FollowerPostList;

// ProfilePostList.jsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PostItem from "../home/PostItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

// Define a CSS animation for the refresh icon
const spinAnimation = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

function ProfilePostList({ session }) {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const user = session?.user;

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

  const fetchPosts = async () => {
    try {
      let { data: posts, error } = await supabase
        .from("posts")
        .select("*, profiles (username)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }); // Order by creation date, descending
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
  };

  useEffect(() => {
    fetchPosts();
  }, [supabase]);

  const handleRefresh = () => {
    setSpinning(true);

    fetchPosts().finally(() => setTimeout(() => setSpinning(false), 790));
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-2 bg-slate-900 border border-slate-600 rounded-md shadow-md">
      <div className="flex flex-col flex-wrap items-center">
        <div className="flex justify-between items-start w-full mb-4 p-2">
          <h1 className="text-3xl font-semibold text-slate-200">My Posts</h1>
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

export default ProfilePostList;

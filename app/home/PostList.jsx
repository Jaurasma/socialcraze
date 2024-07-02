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

function PostList({ session }) {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("recent");
  const [spinning, setSpinning] = useState(false);

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
      let query = supabase
        .from("posts")
        .select("*, profiles (username), likes (post_id)")
        .order("created_at", { ascending: false });

      let { data: posts, error } = await query;

      if (error) throw error;

      const postsWithLikeCounts = posts.map((post) => ({
        ...post,
        like_count: post.likes ? post.likes.length : 0,
        created_at: formatTimestamp(post.created_at),
      }));

      if (sortOption === "mostLiked") {
        postsWithLikeCounts.sort((a, b) => b.like_count - a.like_count);
      }

      setPosts(postsWithLikeCounts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortOption]);

  const handleRefresh = () => {
    setSpinning(true);
    fetchPosts().finally(() => setTimeout(() => setSpinning(false), 790)); // Reset spinning state after 1 second
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-2 bg-slate-900 border border-slate-600 rounded-md shadow-md">
      {/* Add the spin animation CSS to the document */}
      <style>{spinAnimation}</style>
      <div className="flex flex-col flex-wrap">
        <div className="flex justify-between items-start mb-4 p-2">
          <h1 className="text-3xl font-semibold text-slate-200">
            Recent Posts
          </h1>
          <div className="relative flex space-x-2 items-center">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="bg-gray-800 text-white font-semibold border border-gray-700 rounded h-10 p-2 z-10"
            >
              <option disabled>Sort by:</option>
              <option value="recent">Most Recent</option>
              <option value="mostLiked">Most Liked</option>
            </select>
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
        </div>
      </div>
      {error && <p className="text-red-500 mt-4">{error.message}</p>}
      {posts.map((post) => (
        <PostItem key={post.id} post={post} session={session} />
      ))}
    </div>
  );
}

export default PostList;

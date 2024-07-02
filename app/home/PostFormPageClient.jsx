"use client";
import React, { useState } from "react";
import PostForm from "./PostForm";
import PostList from "./PostList";
import FollowerPostList from "./FollowerPostList";
import Navbar from "../NavBar";

function PostFormPage({ session }) {
  const [showFollowerPosts, setShowFollowerPosts] = useState(false);

  return (
    <main>
      <Navbar session={session} />
      <PostForm session={session} />
      {/* Content switch */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          className="bg-sky-400 hover:bg-green-400 text-black font-semibold py-2 px-4 rounded shadow"
          onClick={() => setShowFollowerPosts(!showFollowerPosts)}
        >
          {showFollowerPosts ? "Show All Posts" : "Your Feed"}
        </button>
      </div>
      {showFollowerPosts ? (
        <FollowerPostList session={session} />
      ) : (
        <PostList session={session} />
      )}
    </main>
  );
}

export default PostFormPage;

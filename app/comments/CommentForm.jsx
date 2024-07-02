"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function CommentForm({ userId, postId, onCommentSubmit }) {
  const [content, setContent] = useState("");
  const supabase = createClientComponentClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === "") {
      alert("Please enter a comment.");
      return;
    }
    if (content.length > 200) {
      alert("Comment can be only 200 characters long.");
      return;
    }
    try {
      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .insert([{ user_id: userId, post_id: postId, content }])
        .select();

      if (commentError) throw error;

      // Retrieve current comment_amount from the database
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("comment_amount")
        .eq("id", postId)
        .single();

      if (postError) throw postError;

      const currentCommentAmount = postData?.comment_amount || 0;
      const updatedCommentAmount = currentCommentAmount + 1;
      // Update post's comment_amount by incrementing the current value
      const { data: updatedPostData, error: updatePostError } = await supabase
        .from("posts")
        .update({ comment_amount: updatedCommentAmount })
        .eq("id", postId)
        .select();

      if (updatePostError) throw updatePostError;

      onCommentSubmit();
      setContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Error submitting comment.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label className="text-slate-400 font-semibold block mb-2">
        Comment:
      </label>
      <textarea
        className="w-full p-2 border border-slate-600 mb-2 rounded-md text-white bg-black"
        name="content"
        rows="1"
        onChange={(e) => setContent(e.target.value)}
        value={content}
      ></textarea>
      {content && (
        <button
          className="bg-sky-400 hover:bg-green-400 text-black font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded items-center"
          type="submit"
        >
          Submit
        </button>
      )}
    </form>
  );
}

export default CommentForm;

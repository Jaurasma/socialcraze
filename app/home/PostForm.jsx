// PostForm.jsx
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

function PostForm({ session }) {
  const supabase = createClientComponentClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const user = session?.user;

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePostSubmit({ title, content });
  };

  const handlePostSubmit = async ({ title, content }) => {
    if (content.length > 280 || title.length > 280) {
      alert("Content or title cannot exceed 280 characters.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([{ user_id: user.id, title: title, content: content }])
        .select();

      if (error) throw error;
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Error submitting post.");
    }
  };
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-2 bg-slate-900 border border-slate-600 rounded-md shadow-md">
      <header className="text-center mb-6">
        <h2 className="text-3xl font-semibold text-slate-200">
          Share your thoughts
        </h2>
      </header>
      <main>
        <button
          className="bg-sky-400 hover:bg-green-400 text-black font-semibold hover:text-black py-2 px-4 border border-blue-500 hover:border-transparent rounded items-center"
          onClick={toggleFormVisibility}
        >
          {isFormVisible ? (
            <FontAwesomeIcon icon={faChevronUp} style={{ color: "#000000" }} />
          ) : (
            <FontAwesomeIcon
              icon={faChevronDown}
              style={{ color: "#000000" }}
            />
          )}
        </button>
        {isFormVisible && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <label className="text-slate-400 font-semibold block mb-2">
              Title:
            </label>
            <input
              className="w-full p-2 border border-slate-600 mb-4 rounded-md bg-black text-slate-200"
              type="text"
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
            <label className="text-slate-400 font-semibold block mb-2">
              Content:
            </label>
            <textarea
              className="w-full p-2 border border-slate-600 mb-4 rounded-md bg-black text-slate-200"
              name="content"
              rows="4"
              onChange={(e) => setContent(e.target.value)}
              value={content}
            ></textarea>
            {title && (
              <button
                className="bg-sky-400 hover:bg-green-400 text-black font-semibold py-2 px-4 rounded shadow"
                type="submit"
              >
                Post
              </button>
            )}
          </form>
        )}
      </main>
    </div>
  );
}

export default PostForm;

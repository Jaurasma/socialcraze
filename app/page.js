"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Main component function
export default function Login() {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // New state for error handling

  // Next.js router instance
  const router = useRouter();

  // Supabase client instance
  const supabase = createClientComponentClient();

  // Event handlers
  const handleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      router.refresh();
      if (error) throw error;
    } catch (error) {
      alert(error.message); // Set error state with the error message
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      // If sign-in is successful, navigate to "/home"
      router.push("/home");
    } catch (error) {
      setError(error.message);
    }
  };

  // JSX structure with Tailwind CSS classes
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 border border-slate-600 rounded-md shadow-md">
      <div className="flex flex-col justify-center items-center mb-4">
        <AnimatedHeader text="SocialCraze" />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <label className="block mb-2 font-semibold text-slate-200">Email:</label>
      <input
        className="w-full p-2 border border-slate-700 mb-4 rounded-md bg-black text-slate-200"
        type="text"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@email.com"
        value={email}
      />
      <label className="block mb-2 font-semibold text-slate-200">
        Password:
      </label>
      <input
        className="w-full p-2 border border-slate-700 mb-4 rounded-md bg-black text-slate-200"
        type="password"
        name="password"
        placeholder="********"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <div className="flex space-x-4">
        <button
          className="flex-1 bg-sky-400 hover:bg-green-400 text-gray-800 font-semibold py-2 px-4 border border-slate-950 rounded shadow"
          onClick={handleSignUp}
        >
          Sign up
        </button>
        <button
          className="flex-1 bg-sky-400 hover:bg-green-400 text-gray-800 font-semibold py-2 px-4 border border-slate-950 rounded shadow"
          onClick={handleSignIn}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

function AnimatedHeader({ text }) {
  useEffect(() => {
    const header = document.getElementById("animated-header");
    const textContent = header.innerText;
    header.innerHTML = "";

    Array.from(textContent).forEach((letter, index) => {
      const span = document.createElement("span");
      span.innerText = letter;
      span.style.opacity = "0";
      span.style.transition = "opacity 0.5s";
      span.style.transitionDelay = `${index * 0.1}s`;
      header.appendChild(span);
      setTimeout(() => {
        span.style.opacity = "1";
      }, 100);
    });
  }, []);

  return (
    <h1
      id="animated-header"
      className="text-3xl font-semibold text-orange-600 p-2 bg-orange-600 rounded-md shadow-md mb-2"
    >
      {text}
    </h1>
  );
}

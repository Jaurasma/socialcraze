"use client";
// Navbar.jsx
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

function Navbar({ session }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const user_id = session?.user.id;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const handleSearch = async (e) => {
    // e.preventDefault(); // Prevent the form from submitting in a traditional way
    let { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${searchQuery}%`)
      .limit(5);
    // .or(`full_name.ilike.%${searchQuery}%`); // Corrected OR condition

    if (error) {
      console.error("Error fetching profiles:", error);
      return;
    }
    setSearchResults(profiles);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigateToProfile = (profileId) => {
    // Assuming you have a route like '/profile/[id]' or a query-based route like '/profile_viewer'
    // Adjust the route as per your application's routing structure
    router.push(`/profile_viewer?userId=${profileId}`);
  };

  return (
    <nav>
      <div className="container mx-auto flex justify-between items-center">
        {/* Sidebar Trigger is not currently visible */}
        <div className="lg:hidden">
          <button
            id="sidebarToggle"
            className="text-black hover:bg-green-400 bg-sky-400 focus:outline-none"
            onClick={() =>
              document.getElementById("sidebar").classList.toggle("hidden")
            }
          >
            ☰
          </button>
        </div>

        {/* Sidebar */}
        <div
          id="sidebar"
          className="hidden lg:flex flex-col justify-start h-screen w-64 bg-gray-900 fixed top-0 left-0 py-4 px-6"
        >
          <div className="flex justify-between items-center break-words cursor-default mb-4">
            <Link legacyBehavior href="/home">
              <a className="text-white hover:text-green-400">Home</a>
            </Link>
            <button
              id="sidebarToggle"
              className="text-black hover:bg-green-400 bg-sky-400 px-2 py-1 rounded-md"
              onClick={() =>
                document.getElementById("sidebar").classList.toggle("hidden")
              }
            >
              ☰
            </button>
          </div>

          <div className="mb-4">
            <Link legacyBehavior href="/profile">
              <a className="text-white hover:text-green-400">Profile</a>
            </Link>
          </div>
          <div className="mb-4">
            <Link legacyBehavior href="/account">
              <a className="text-white hover:text-green-400">Update Account</a>
            </Link>
          </div>
          {/* Add more navigation links as needed */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const inputValue = e.target.value;
                setSearchQuery(inputValue);
                if (inputValue.trim() === "") {
                  // If the search query is empty (or only contains whitespace),
                  // clear the search results immediately
                  setSearchResults([]);
                } else {
                  // Otherwise, proceed with the search
                  handleSearch(inputValue);
                }
              }}
              placeholder="Search profiles..."
              className="text-input bg-black text-white border border-slate-600 rounded-md p-1 w-full"
            />

            {searchResults.length > 0 && (
              <ul className="mt-2 bg-gray-800 rounded-md shadow-lg">
                {searchResults.map((profile) => (
                  <li
                    key={profile.id}
                    className="p-2 border-b border-gray-700 last:border-0 hover:bg-green-400"
                  >
                    <button
                      onClick={() => navigateToProfile(profile.id)}
                      className="text-white hover:text-green-400 w-full text-left"
                    >
                      <div className="font-semibold truncate">
                        {profile.username}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {profile.full_name}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4">
            <button
              className="text-black hover:bg-red-500 bg-sky-400 px-2 py-1 rounded-md"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

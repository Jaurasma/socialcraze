import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ProfileData from "./ProfileData";
import ProfilePostList from "./ProfilePostList";
import Navbar from "../NavBar";
import PostForm from "../home/PostForm";

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main>
      <Navbar session={session} />
      <ProfileData session={session} />
      <PostForm session={session} />
      <ProfilePostList session={session} />
    </main>
  );
}

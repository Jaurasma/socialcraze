import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Navbar from "../NavBar";
import ProfileViewerPostList from "./ProfileViewerPostList";

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main>
      <Navbar session={session} />
      <ProfileViewerPostList session={session} />
    </main>
  );
}

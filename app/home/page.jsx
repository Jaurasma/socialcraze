// PostFormPage.jsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import PostFormPageClient from "./PostFormPageClient";
export default async function PostFormPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main>
      <PostFormPageClient session={session} />
    </main>
  );
}

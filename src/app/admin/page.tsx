"use client";
import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";

const Admin = () => {
  const [isLola, setIsLola] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const signIn = async () => {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          },
        });
        return;
      }

      const { data } = await supabase.auth.getUserIdentities();
      console.log(data);
      if (
        data?.identities[0]?.identity_data?.email === "lolansanchez@icloud.com"
      ) {
        setIsLola(true);
      } else {
        setIsLola(false);
      }
      setLoading(false);
    };
    signIn();
  }, []);

  if (loading) return <p>loading</p>;
  if (!isLola) return <p>you're not lola!</p>;

  return <></>;
};

export default Admin;

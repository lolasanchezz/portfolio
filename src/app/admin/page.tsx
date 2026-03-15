'use client'
import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";

const Admin = () => {
  const [isLola, setIsLola] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const signIn = async () => {
      const supabase = createClient();

      await supabase.auth.signInWithOAuth({
        provider: "github",
      });

      const { data } = await supabase.auth.getUserIdentities();

      if (data?.identities[0]?.identity_data?.email === "lolasanchez@icloud.com") {
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

export default Admin

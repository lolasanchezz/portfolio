"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "../supabase/client";
import styles from "./message.module.css";

export default function Message() {
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [identityUserId, setUserId] = useState("")
  const supabase = createClient();
  
  useEffect(() => {
    const signIn = async () => {
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
      const userId = await supabase.auth.getUserIdentities();
      if (!userId) {
        return;
      }
      setUserId(userId!.data!.identities[0].user_id);
      console.log(identityUserId);
      setSignedIn(true);
      if (!identityUserId) return;

      const { data, error } = await supabase
        .from("messages")
        .select()
        .eq("user_id", identityUserId);
      console.log(data)
      if (error) {
        console.error(error);
        return;
      }
      if (data && data.length > 0) {
        console.log(data)
        setMessage(data[0]?.message ?? "");
      } else {
        await supabase.from("messages").insert({ user_id: identityUserId });
      }
    };
    signIn();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <p>leave a message!</p>
        <p>signed in: {signedIn}</p>
      </div>
      <div className={styles.messageInput}>
        <input
          value={message}
          onChange={async (e) => {
            e.preventDefault();
            setMessage(e.target.value);
            await supabase
              .from('messages')
              .update({ text_value: message })
              .eq('user_id', identityUserId);
          }}
        />
      </div>
      <div className={styles.messageBoard}>
        <MovingText
          message={message}
          userid={identityUserId}
          supabase={supabase}
        />
      </div>
    </div>
  );
}

function MovingText(props: { message: string; userid: string; supabase: any }) {
  const intX = 500;
  const intY = 500;
  console.log(props.message);
  const [position, setPosition] = useState({ x: intX, y: intY });
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const handleMouseDown = (e: any) => {
    //makes the image dragging less buggy
    e.preventDefault();

    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = async (e: any) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - offset.current.x,
          y: e.clientY - offset.current.y,
        });

        await props.supabase
          .from("messages")
          .update({
            x: e.clientX - offset.current.x,
            y: e.clientY - offset.current.y,
          })
          .eq('user_id', props.userid);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <p
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: position.x + "px",
        top: position.y + "px",
        cursor: "grab",
        zIndex: 2,
        color: "black",
      }}
    >
      {props.message} -
    </p>
  );
}

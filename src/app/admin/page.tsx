"use client";
import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import styles from "./admin.module.css";
const Admin = () => {
  const [isLola, setIsLola] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exisProjects, setExisProjects] = useState(null as unknown as any[]);
  const [selProj, setSelProj] = useState(null as unknown as any);
  const [markdownText, setMarkdownText] = useState("");

  useEffect(() => {
    setMarkdownText(selProj?.body ?? "");
  }, [selProj]);

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
        const { data, error } = await supabase.from("projects").select();
        if (data == null) {
          return <p> error: {error.message}</p>;
        }
        console.log(data);
        setExisProjects(data!);
      } else {
        setIsLola(false);
      }
      setLoading(false);
    };
    signIn();
  }, []);

  if (loading) return <p>loading</p>;
  if (!isLola) return <p>you're not lola!</p>;

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1>admin dash</h1>
      </div>
      <div className={styles.body}>
        <div className={styles.exisProjs}>
          <p className={styles.button} onClick={() => {}}>
            edit existing projects
          </p>
          <div className={styles.exisProjsDiv}>
            {exisProjects.map((proj, index) => (
              <ExisProj key={proj?.id ?? index} project={proj} setProject={setSelProj} />
            ))}
          </div>
          <p className={styles.button}>make new project</p>
        </div>
        <div className = {styles.markdownEnterer}>
            <textarea
              className={styles.markdownInput}
              autoFocus
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
            />
        </div>
      </div>
    </div>
  );
};

const ExisProj = (props: { project: any, setProject: any}) => {
  return (
    <div className={styles.exisProjTile} onClick = {() => {props.setProject(props.project)}}>
      <h3>{props.project.name}</h3>
      <p>{props.project.desc}</p>
    </div>
  );
};

export default Admin;

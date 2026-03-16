"use client";
import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import styles from "./admin.module.css";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const Admin = () => {
  const [isLola, setIsLola] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exisProjects, setExisProjects] = useState(null as unknown as any[]);
  const [selProj, setSelProj] = useState(null as unknown as any);
  const [markdownText, setMarkdownText] = useState("");

  useEffect(() => {
    setMarkdownText(selProj?.body ?? "");
  }, [selProj]);
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
              <ExisProj
                key={proj?.id ?? index}
                project={proj}
                setProject={setSelProj}
              />
            ))}
          </div>
        </div>
        <div className={styles.markdownEnterer}>
          <textarea
            className={styles.markdownInput}
            autoFocus
            value={markdownText}
            onChange={(e) => setMarkdownText(e.target.value)}
          />
          <p
            className={styles.button}
            onClick={async () => {
              if (!selProj?.id) {
                console.error("No project selected");
                return;
              }
              console.log(selProj)
              const { data, error } = await supabase
                .from("projects")
                .update({ body: markdownText })
                .eq('id', selProj.id)
                .select()
               

              if (error) {
                console.error(error);
                return;
              }

              console.log(data)
            }}
          >
            submit
          </p>
        </div>
        <div className={styles.markdownViewer}>
          <Markdown rehypePlugins={[rehypeRaw]}>{markdownText}</Markdown>
        </div>
      </div>
    </div>
  );
};




const ExisProj = (props: { project: any; setProject: any }) => {
  return (
    <div
      className={styles.exisProjTile}
      onClick={() => {
        props.setProject(props.project);
      }}
    >
      <h3>{props.project.name}</h3>
      <p>{props.project.desc}</p>
    </div>
  );
};

export default Admin;

"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import styles from "./admin.module.css";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const Admin = () => {
  const [isLola, setIsLola] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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
        data?.identities[0]?.identity_data?.email === "lolansanchez@icloud.com" // YES i know this looks unsafe but dont worry theres a sql check as well within supabse
      ) {
        setIsLola(true);
      } else {
        setIsLola(false);
      }
      setLoading(false);
    };
    signIn();
  }, []);

  if (loading) return <div className={styles.load}>loading</div>;
  if (!isLola)
    return (
      <div className={styles.load}>
        <p>you're not lola!</p>
        <p className={styles.button} onClick={() => router.push("/")}>
          back
        </p>
      </div>
    );
  return <LolaAdmin supabase={supabase} />;
};





const LolaAdmin = ({ supabase }: { supabase: any }) => {
  const [exisProjects, setExisProjects] = useState([] as any[]);
  const [selProj, setSelProj] = useState(null as any);
  const [markdownText, setMarkdownText] = useState("");
  const [recUploadedPhotos, setRecUploadPhotos] = useState([] as string[]);

  function setSelProjWrapper(selProj) {
    setMarkdownText(selProj.body)
    setSelProj(selProj)
  }



  useEffect(() => {
    const signIn = async () => {
      const { data, error } = await supabase.from("projects").select();
      if (error != null) {
        return <p> error: {error.message}</p>;
      }
      console.log(data);
      setExisProjects(data!);

      const { data: images, error: error2 } = await supabase.storage
        .from("images")
        .list("", {
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error2 != null) {
        return <p> error: {error2.message}</p>;
      }
      console.log(images);
      setRecUploadPhotos(
        images.map((img: any) => {
          return img.name;
        }),
      );
    };
    signIn();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1>admin dash</h1>
      </div>
      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.exisProjs}>
            {selProj? (<div className = {styles.selectedProject}>
              <p>selectedProject:</p>
            <ExisProj project={selProj} setProject={selProj}/>
            </div>) : <></>}
            <ExisProjs exisProjects={exisProjects} setSelProj={setSelProjWrapper} />
            <PrevImages exisImages={recUploadedPhotos} />
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
                console.log(selProj);
                const { data, error } = await supabase
                  .from("projects")
                  .update({ body: markdownText })
                  .eq("id", selProj.id)
                  .select();

                if (error) {
                  console.error(error);
                  return;
                }

                console.log(data);
              }}
            >
              submit
            </p>
            <form>
              <label htmlFor="imageUpload">upload image</label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const ext = file.name.split(".").pop() ?? "bin";
                  const baseName = file.name
                    .replace(/\.[^/.]+$/, "")
                    .replace(/\s+/g, "-");
                  await supabase.storage
                    .from("images")
                    .upload(baseName + "." + ext, file, { upsert: true });

                  setRecUploadPhotos((prev) => [...prev, baseName + "." + ext]);
                }}
              />
            </form>
          </div>
        </div>
        <div className={styles.markdownViewer}>
          <Markdown
            rehypePlugins={[rehypeRaw]}
            components={{
              img(props) {
                const { src, alt, width, height } = props;
                const parsedWidth =
                  typeof width === "number" ? width : Number(width);
                const parsedHeight =
                  typeof height === "number" ? height : Number(height);

                const hasValidSrc =
                  typeof src === "string" && src.trim().length > 0;
                const hasValidWidth =
                  Number.isFinite(parsedWidth) && parsedWidth > 0;

                const hasValidHeight =
                  Number.isFinite(parsedHeight) && parsedHeight > 0;

                if (!hasValidSrc) {
                  console.log("returned null");
                  return;
                }

                if (hasValidWidth && hasValidHeight) {
                  return (
                    <NextImage
                      src={src.trim()}
                      alt={alt ?? ""}
                      width={parsedWidth}
                      height={parsedHeight}
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  );
                } else {
                  console.log("invalid width");
                }
              },
            }}
          >
            {markdownText}
          </Markdown>
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
        console.log(props.project);
      }}
    >
      <h3>{props.project.name}</h3>
      <p>{props.project.desc}</p>
    </div>
  );
};

const ExisProjs = (props: { exisProjects: any; setSelProj: any }) => {
  const [showing, setShowing] = useState(false);
  return (
    <div>
      <p
        onClick={() => {
          setShowing(!showing);
        }}
        className={styles.dropdown}
      >
        {" "}
        {showing ? "⌄" : ">"} projects
      </p>
      {showing ? (
        <div className={styles.exisProjsDiv}>
          {props.exisProjects.map((proj, index) => (
            <ExisProj
              key={proj?.id ?? index}
              project={proj}
              setProject={props.setSelProj}
            />
          ))}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

const PrevImages = (props: { exisImages: string[] }) => {
  const [showing, setShowing] = useState(false);
  return (
    <>
      <div>
        <p
          onClick={() => {
            setShowing(!showing);
          }}
          className={styles.dropdown}
        >
          {" "}
          {showing ? "⌄" : ">"} previous images
        </p>
        {showing ? (
          <div className={styles.previousImages}>
            <p>link to database:</p>
            <p>
              {process.env.NEXT_PUBLIC_SUPABASE_URL +
                "/storage/v1/object/public/images/"}
            </p>
            <p>previously uploaded images:</p>
            {props.exisImages.map((val, i) => {
              return <p key={i}>{val}</p>;
            })}
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Admin;

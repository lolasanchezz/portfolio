"use client";

import Link from "next/link";
import { useState } from "react";
import type { PostData, ProjectData } from "../data";
import PostsEditor from "./PostsEditor";
import ProjectsEditor from "./ProjectsEditor";
import styles from "./admin.module.css";

export default function Editor(props: {
  projects: ProjectData[];
  posts: PostData[];
}) {
  const [tab, setTab] = useState<"projects" | "blogs">("projects");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>editor</h1>
        <nav className={styles.tabs}>
          {(["projects", "blogs"] as const).map((o) => (
            <button key={o} className={tab === o ? styles.active : ""} onClick={() => setTab(o)}>
              {o}
            </button>
          ))}
        </nav>
        <span className={styles.note}>local only - saves straight to /content and /public</span>
        <Link href="/" className={styles.note}>
          back to site
        </Link>
      </header>
      {/* both stay mounted so switching tabs doesn't throw away unsaved edits */}
      <div hidden={tab !== "projects"}>
        <ProjectsEditor initial={props.projects} />
      </div>
      <div hidden={tab !== "blogs"}>
        <PostsEditor initial={props.posts} />
      </div>
    </div>
  );
}

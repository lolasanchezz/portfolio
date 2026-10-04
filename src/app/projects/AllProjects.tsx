"use client";
import styles from "./projects.module.css";
import Sphere from "../three-scrips/Sphere";
import { ProjectData } from "./indProject";

import { useRouter } from "next/navigation";

export default function AllProjects(props: { projects: ProjectData[] }) {
  const projData = props.projects;
  const router = useRouter();

  const Project = (props: { proj: ProjectData; index: number }) => {
    const open = () => router.push(`/projects/${props.proj.shortname}`);
    return (
      <>
        {props.proj.favorite ? (
          <div className={styles.favProjRow} onClick={open}>
            <h1>
              {props.index + 1}. {props.proj.shortname}
            </h1>
            <p>{props.proj.desc}</p>
          </div>
        ) : (
          <div className={styles.projCont} onClick={open}>
            <h2> • {props.proj.name}</h2>
            <p>{props.proj.desc}</p>
          </div>
        )}
      </>
    );
  };

  const favProjects = projData.filter((o) => o.favorite === true);
  const projs = projData.filter((o) => o.favorite === false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p onClick={() => router.push("/")} className={styles.back}>
          back
        </p>
        <h1>projects</h1>
        <Sphere width={75} height={75} />
      </div>
      <div className={styles.main}>
        <div className={styles.favoritesCont}>
          <h4>favorites</h4>
          {favProjects.map((data, i) => (
            <Project key={data.id} index={i} proj={data} />
          ))}
          <hr></hr>
          {projs.map((data, i) => (
            <Project key={data.id} index={i} proj={data} />
          ))}
        </div>
      </div>
    </div>
  );
}

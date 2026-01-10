"use client";
import styles from "./projects.module.css";
import Sphere from "../three-scrips/Sphere";
import { ReactElement, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { IndProject, SecondProject } from "./indProject";

export default function Projects() {
 

  const [visibleProj, setProj] = useState<JSX.Element | null>(null);

  const Project = (props: {
    index: number;
    projName: string;
    desc: string;
    component: () => JSX.Element;
    setProject: any;
  }) => {
    return (
      <div className={styles.projCont} onClick={() => setProj(props.component)}>
        <h2> • {props.projName}</h2>
        <p>{props.desc}</p>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.back}>back</p>
         <h1>projects</h1>
        <Sphere width={75} height={75} />
      </div>
      {visibleProj ? (
        visibleProj
      ) : (
        <div className={styles.main}>
          <div className={styles.favoritesCont}>
            <h4>favorites</h4>
            <div className={styles.favProjRow}>
              <h1>1. ntwatch</h1>
              <p>packets and processes - wireshark + netstat</p>
            </div>
            <div
              className={styles.favProjRow}
            >
              <h1>2. journalcli</h1>
              <p>encrypted journal in the terminal</p>
            </div>
            <hr></hr>
            <Project
              index={2}
              projName="graph the sec"
              desc="security and exchange commission data graphed"
              component={() => <IndProject name = {'sec'} goBackFunc={setProj} />} 
              setProject={setProj}
            />
          </div>
        </div>
      )}
    </div>
  );
}

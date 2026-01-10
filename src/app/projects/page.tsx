"use client";
import styles from "./projects.module.css";
import Sphere from "../three-scrips/Sphere";
import { ReactElement, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { SecProject, SecondProject } from "./indProject";

export default function Projects() {
  const base = {
    color: "black",
    textDecoration: "none",
  };
  const hoverSty = {
    color: "blue",
    textDecoration: "underline",
    cursor: "pointer",
  };
  const [hoverStyle, setHover] = useState([base, base, base, base, base, base]);
  const setHoverStyle = (i: number, hover: boolean) => {
    let tmp = [...hoverStyle];
    if (hover) {
      tmp[i] = hoverSty;
      console.log("hover");
    } else {
      tmp[i] = base;
      console.log("no hover");
    }
    setHover(tmp);
  };

  const [visibleProj, setProj] = useState<JSX.Element | null>(null);

  const Project = (props: {
  index: number;
  projName: string;
  desc: string;
  component: () => JSX.Element
  setProject: any;
}) => {
  return (
    <div
      onMouseEnter={() => setHoverStyle(props.index, true)}
      onMouseLeave={() => setHoverStyle(props.index, false)}
      className={styles.projCont}
      onClick={() => setProj(props.component)}
    >
      <h2 style={hoverStyle[props.index]}> • {props.projName}</h2>
      <p style={hoverStyle[props.index]}>{props.desc}</p>
    </div>
  );
};






  return (
    <div className={styles.page}>
       
      <div className={styles.header}>
        <h1>projects</h1>
        <Sphere width={75} height={75} />
      </div>
       {visibleProj}
      <div className={styles.favoritesCont}>
        <h4>favorites</h4>
        <div
          onMouseEnter={() => setHoverStyle(0, true)}
          onMouseLeave={() => setHoverStyle(0, false)}
          className={styles.favProjRow}
        >
          <h1 style={hoverStyle[0]}>1. ntwatch</h1>
          <p style={hoverStyle[0]}>
            packets and processes - wireshark + netstat
          </p>
        </div>
        <div
          onMouseEnter={() => setHoverStyle(1, true)}
          onMouseLeave={() => setHoverStyle(1, false)}
          className={styles.favProjRow}
        >
          <h1 style={hoverStyle[1]}>2. journalcli</h1>
          <p style={hoverStyle[1]}>encrypted journal in the terminal</p>
        </div>
        <hr></hr>
        <Project
          index={2}
          projName="graph the sec"
          desc="security and exchange commission data graphed"
  component={() => <SecProject goBackFunc={setProj}/>}  // Pass as function
          setProject={setProj}
        />
      </div>
    </div>
  );
}

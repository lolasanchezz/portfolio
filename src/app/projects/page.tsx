"use client";
import styles from "./projects.module.css";
import Sphere from "../three-scrips/Sphere";
import { useState } from "react";

export default function Projects() {
  const base = {
    color: "black",
    textDecoration: "none",
  };
  const hoverSty = { color: "blue", textDecoration: "underline", cursor: "pointer"};
  const [hoverStyle, setHover] = useState([base, base]);
  const setHoverStyle = (i: number, hover: boolean) => {
    let tmp = [...hoverStyle];
    if (hover) {
      tmp[i] = hoverSty
      console.log("hover");
    } else {
      tmp[i] = base
      console.log("no hover");
    }
    setHover(tmp);
  };
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>projects</h1>
        <Sphere width={75} height={75} />
      </div>
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
      </div>
    </div>
  );
}

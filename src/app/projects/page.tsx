"use client";
import styles from "./projects.module.css";
import Sphere from "../three-scrips/Sphere";
import { ReactElement, useState, useEffect } from "react";
import { JSX } from "react/jsx-runtime";
import { IndProject } from "./indProject";

import { useRouter } from "next/navigation";
import getJson5 from "../getJson";

export default function Projects() {
  const [projData, setProjData] = useState<any[]>([]);
  useEffect(() => {
    getJson5("projects.json5").then((val) => {
      setProjData(val)
    })
  }, []);

  const router = useRouter();
  const [visibleProj, setProj] = useState<JSX.Element | null>(null);
  const Project = (props: {
    index: number;
    name: string;
    desc: string;
    longName: string;
    setProject: any;
    favorite?: boolean;
  }) => {
    return (
      <>
        {props.favorite ? (
          <div
            className={styles.favProjRow}
            key={props.index}
            onClick={() =>
              setProj(
                <IndProject goBackFunc={props.setProject} name={props.name} />,
              )
            }
          >
            <h1>
              {props.index + 1}. {props.name}
            </h1>
            <p>{props.desc}</p>
          </div>
        ) : (
          <div
            className={styles.projCont}
            key={props.index}
            onClick={() =>
              setProj(
                <IndProject goBackFunc={props.setProject} name={props.name} />,
              )
            }
          >
            <h2> • {props.longName}</h2>
            <p>{props.desc}</p>
          </div>
        )}
      </>
    );
  };

  const favProjects = projData.filter(
    (o: { favorite: boolean }) => o.favorite === true,
  );
  const projs = projData.filter(
    (o: { favorite: boolean }) => o.favorite === false,
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p onClick={() => router.push("/")} className={styles.back}>
          back
        </p>
        <h1>projects</h1>
        <Sphere width={75} height={75} />
      </div>
      {visibleProj ? (
        visibleProj
      ) : (
        <div className={styles.main}>
          <div className={styles.favoritesCont}>
            <h4>favorites</h4>
            {favProjects.map(
              (
                data: { shortname: string; name: string; desc: string },
                index: number,
              ) => (
                <Project
                  index={index}
                  name={data.shortname}
                  longName={data.name}
                  desc={data.desc}
                  setProject={setProj}
                  favorite={true}
                />
              ),
            )}
            <hr></hr>
            {projs.map(
              (
                data: { shortname: string; name: string; desc: string },
                index: number,
              ) => (
                <Project
                  index={index}
                  name={data.shortname}
                  longName={data.name}
                  desc={data.desc}
                  setProject={setProj}
                ></Project>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

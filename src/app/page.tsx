"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Torus from "./three-scrips/Torus"
import Sphere from "./three-scrips/Sphere"
import { useRouter } from 'next/navigation';

export default function Main() {
    const router = useRouter();
    
  return (
    <div className={styles.page}>
      <div className = {styles.header}>
        <h1>lola sanchez</h1>
      </div>
      <main className={styles.main}>
        <div className={styles.threecontainer}>
        <Torus width={300} height = {300}></Torus>
        <p onClick = {() => router.push("/about")} className = {styles.button}>about</p>
        </div>
        <div className = {styles.threecontainer}>
          <Sphere width = {300} height = {300}></Sphere>
          <p onClick = {() => router.push("/projects")} className = {styles.button}>projects</p>
        </div>
      </main>
    </div>
  );
}
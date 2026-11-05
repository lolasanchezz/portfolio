import Image from "next/image";
import Link from "next/link";
import { formatDate, PostData, ProjectData } from "../data";
import styles from "./cards.module.css";

// badge colors - anything not listed falls back to the accent purple
const tagColors: Record<string, string> = {
  golang: "#00add8",
  c: "#283593",
  typescript: "#3178c6",
  "next.js": "#000000",
};

export const Tags = (props: { tags?: string[] }) =>
  props.tags?.length ? (
    <ul className={styles.tags}>
      {props.tags.map((tag) => (
        <li key={tag} style={{ background: tagColors[tag] ?? "var(--accent)" }}>
          {tag}
        </li>
      ))}
    </ul>
  ) : null;

export const ProjectCard = (props: { proj: ProjectData }) => {
  const thumb = props.proj.images[0];
  return (
    <Link href={`/projects/${props.proj.shortname}`} className={styles.projectCard}>
      <Tags tags={props.proj.tags} />
      <h3>{props.proj.name}</h3>
      <p>{props.proj.desc}</p>
      {thumb && (
        <div className={styles.thumb}>
          <Image
            src={`/images/${props.proj.shortname}/${thumb.src}`}
            alt={thumb.subtitle}
            fill
            sizes="(max-width: 800px) 100vw, 33vw"
          />
        </div>
      )}
    </Link>
  );
};

export const PostRow = (props: { post: PostData }) => (
  <Link href={`/blog/${props.post.slug}`} className={styles.postRow}>
    <p className={styles.date}>
      {formatDate(props.post.date)}
      {props.post.draft && " · draft"}
    </p>
    <h3>{props.post.title}</h3>
    <p>{props.post.desc}</p>
  </Link>
);

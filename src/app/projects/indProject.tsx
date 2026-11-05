import Image from "next/image";
import Markdown from "react-markdown";
import Banner from "../components/Banner";
import { Tags } from "../components/Cards";
import { ProjectData } from "../data";
import styles from "./indProject.module.css";

export const IndProject = (props: { project: ProjectData }) => {
  const data = props.project;

  return (
    <div className={styles.page}>
      <Banner
        compact
        title={data.name}
        subtitle={data.desc}
        back={{ href: "/projects", text: "projects" }}
      />

      <div className={styles.meta}>
        <Tags tags={data.tags} />
        <div className={styles.links}>
          {data.links.gh && <a href={data.links.gh}>github</a>}
          {data.links.demo && <a href={data.links.demo}>demo</a>}
        </div>
      </div>

      <div className={styles.images}>
        {data.images.map((img) => (
          <figure key={img.src}>
            <Image
              src={`/images/${data.shortname}/${img.src}`}
              alt={img.subtitle}
              width={1200}
              height={Math.round(1200 * img.asp)}
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <figcaption>{img.subtitle}</figcaption>
          </figure>
        ))}
      </div>

      <div className={styles.text}>
        {data.text.map((block, i) => (
          <section key={i}>
            {block.header && <h2>{block.header}</h2>}
            <Markdown>{block.body}</Markdown>
          </section>
        ))}
      </div>
    </div>
  );
};

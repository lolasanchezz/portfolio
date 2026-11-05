import Banner from "../components/Banner";
import { ProjectCard } from "../components/Cards";
import { getProjects } from "../data";
import styles from "./projects.module.css";

export default async function Projects() {
  // favorites first, otherwise sort by `order` in content/projects
  const projects = (await getProjects()).sort((a, b) => Number(b.favorite) - Number(a.favorite));
  return (
    <div className={styles.page}>
      <Banner compact title="projects" subtitle="things i've made" back={{ href: "/", text: "home" }} />
      <div className={styles.grid}>
        {projects.map((proj) => (
          <ProjectCard key={proj.shortname} proj={proj} />
        ))}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import getJson5 from "../../getJson";
import { IndProject, ProjectData } from "../indProject";
import styles from "../projects.module.css";

export async function generateStaticParams() {
  const projData: ProjectData[] = await getJson5("projects.json5");
  return projData.map((o) => ({ project: o.shortname }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  const projData: ProjectData[] = await getJson5("projects.json5");
  const data = projData.find((o) => o.shortname === decodeURIComponent(project));
  if (!data) notFound();

  return (
    <div className={styles.page}>
      <IndProject project={data} />
    </div>
  );
}

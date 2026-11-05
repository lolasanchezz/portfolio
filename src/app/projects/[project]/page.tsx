import { notFound } from "next/navigation";
import { getProject, getProjects } from "../../data";
import { IndProject } from "../indProject";


export async function generateStaticParams() {
  const projData = await getProjects();
  return projData.map((o) => ({ project: o.shortname }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  const data = await getProject(decodeURIComponent(project));
  if (!data) notFound();

  return <IndProject project={data} />;
}

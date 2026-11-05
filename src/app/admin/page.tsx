import { notFound } from "next/navigation";
import { getPosts, getProjects } from "../data";
import Editor from "./Editor";

export const metadata = { title: "editor - lola sanchez", robots: { index: false } };

// local-only content editor - 404s in any production build
export default async function Admin() {
  if (process.env.NODE_ENV !== "development") notFound();

  // dev mode, so getPosts includes drafts
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return <Editor projects={projects} posts={posts} />;
}

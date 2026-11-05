import { existsSync, promises as fs } from "fs";
import matter from "gray-matter";
import getJson5 from "./getJson";

// projects and posts are markdown files in /content - frontmatter up top, writing below
export type ProjectMeta = {
  name: string;
  desc: string;
  order: number; // position on the projects page, favorites still go first
  favorite: boolean;
  tags?: string[];
  links: { gh: string; demo: string };
  images: { src: string; subtitle: string; asp: number }[];
};

export type ProjectData = ProjectMeta & {
  shortname: string; // the file name
  body: string;
  text: { header: string; body: string }[]; // body split up on its "## " headers
};

export type PostMeta = {
  title: string;
  date: string; // yyyy-mm-dd
  desc: string;
  tags?: string[];
  draft?: boolean;
};

export type PostData = PostMeta & { slug: string; body: string };

export const contentDir = (kind: "projects" | "blogs") => `${process.cwd()}/content/${kind}`;

// every <name>.md in a content folder, parsed
async function readContent(kind: "projects" | "blogs") {
  const dir = contentDir(kind);
  const files = (await fs.readdir(dir)).filter((o) => o.endsWith(".md"));
  return Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(await fs.readFile(`${dir}/${file}`, "utf-8"));
      return { name: file.slice(0, -3), data, body: content.trim() };
    }),
  );
}

// each "## header" starts a new section on the project page
export function sections(md: string) {
  const parts = md.split(/^## (.+)$/m);
  const out = parts[0].trim() ? [{ header: "", body: parts[0].trim() }] : [];
  for (let i = 1; i < parts.length; i += 2) out.push({ header: parts[i].trim(), body: parts[i + 1].trim() });
  return out;
}

export const getSite = (): Promise<SiteData> => getJson5("site.json5");

export async function getProjects(): Promise<ProjectData[]> {
  const files = await readContent("projects");
  return files
    .map(({ name, data, body }) => {
      const meta = data as ProjectMeta;
      return {
        ...meta,
        images: meta.images ?? [],
        links: meta.links ?? { gh: "", demo: "" },
        shortname: name,
        body,
        text: sections(body),
      };
    })
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
}

export async function getProject(shortname: string) {
  const projects = await getProjects();
  return projects.find((o) => o.shortname === shortname);
}

// yaml reads an unquoted 2026-10-29 as a Date
const toDate = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? ""));

// drafts show up in `npm run dev` but never in a production build
export async function getPosts(): Promise<PostData[]> {
  const files = await readContent("blogs");
  return files
    .map(({ name, data, body }) => ({ ...(data as PostMeta), date: toDate(data.date), slug: name, body }))
    .filter((o) => !o.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  return (await getPosts()).find((o) => o.slug === slug);
}

export type SiteData = {
  name: string;
  greeting: string;
  currently: string;
  headline: { text: string; link: { text: string; href: string } };
  about: string[];
  contact: { label: string; text: string; href: string }[];
};

// the art pieces from the figma file live in /public/art - skip any that haven't been exported yet
export const publicAsset = (path: string) =>
  existsSync(`${process.cwd()}/public${path}`) ? path : null;

export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

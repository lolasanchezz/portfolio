"use server";

import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { contentDir, type PostMeta, type ProjectMeta } from "../data";

// everything in here writes straight to /content and /public, so it only works under `npm run dev`
function assertLocal() {
  if (process.env.NODE_ENV !== "development") throw new Error("the editor only runs locally");
}

const imagesDir = path.join(process.cwd(), "public/images");
const exists = (p: string) => fs.access(p).then(() => true, () => false);

const validName = (name: string) => /^[a-z0-9_-]+$/.test(name);

type Entry<T> = { name: string; meta: T; body: string };

// writes one <name>.md per entry and deletes the files in `removed` (deleted or renamed away)
async function writeEntries<T extends object>(kind: "projects" | "blogs", entries: Entry<T>[], removed: string[]) {
  for (const o of entries) {
    if (!validName(o.name)) throw new Error(`bad file name "${o.name}" - use a-z, 0-9, - and _`);
  }
  if (new Set(entries.map((o) => o.name)).size !== entries.length) {
    throw new Error("two entries have the same file name");
  }

  const dir = contentDir(kind);
  const names = new Set(entries.map((o) => o.name));
  for (const name of removed) {
    if (validName(name) && !names.has(name)) await fs.rm(path.join(dir, `${name}.md`), { force: true });
  }
  for (const o of entries) {
    // yaml can't write undefined, so drop empty optional fields first
    const meta = JSON.parse(JSON.stringify(o.meta));
    await fs.writeFile(path.join(dir, `${o.name}.md`), matter.stringify(o.body.trim() + "\n", meta));
  }
  revalidatePath("/", "layout");
}

// renames: [old shortname, new shortname] - moves the image folder along with the project
export async function saveProjects(entries: Entry<ProjectMeta>[], removed: string[], renames: [string, string][]) {
  assertLocal();
  if (entries.some((o) => o.name === "blog")) throw new Error(`"blog" is taken by the blog's image folder`);
  await writeEntries("projects", entries, removed);

  const skipped: string[] = [];
  for (const [from, to] of renames) {
    const src = path.join(imagesDir, from);
    const dest = path.join(imagesDir, to);
    if (!validName(from) || !validName(to) || !(await exists(src))) continue;
    if (await exists(dest)) skipped.push(`${from} -> ${to}`);
    else await fs.rename(src, dest);
  }
  return { skipped };
}

export async function savePosts(entries: Entry<PostMeta>[], removed: string[]) {
  assertLocal();
  for (const o of entries) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.meta.date)) throw new Error(`bad date on "${o.name}" - use yyyy-mm-dd`);
  }
  await writeEntries("blogs", entries, removed);
}

const MAX_BYTES = 1024 * 1024; // anything bigger gets squeezed down to fit

// re-encodes an image as webp until it's under MAX_BYTES, keeping it as big as it can: at full
// size first (webp alone often does it), then scaled down. returns null for things it shouldn't
// touch (gifs would lose their animation, svgs are already tiny)
async function shrink(input: Buffer, type: string) {
  if (type === "image/gif" || type === "image/svg+xml") return null;
  // sized by its longest side, so it doesn't matter whether a phone photo is stored sideways
  const { width = 0, height = 0 } = await sharp(input).metadata();
  let side = Math.max(width, height);
  for (let tries = 0; tries < 6 && side > 64; tries++) {
    const out = await sharp(input)
      .rotate() // bakes in the phone's orientation flag, since re-encoding drops it
      .resize({ width: side, height: side, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    if (out.length <= MAX_BYTES) return out;
    // file size roughly tracks pixel count, so jump straight to about the right size (aiming a
    // little under) instead of creeping down
    side = Math.round(side * Math.min(0.9, Math.sqrt(MAX_BYTES / out.length) * 0.92));
  }
  throw new Error("couldn't get that image under 1mb");
}

// drops a file into public/images/<folder>/ and returns the name it was saved as. images over
// 1mb are shrunk to fit first (and saved as .webp)
export async function uploadImage(form: FormData) {
  assertLocal();
  const file = form.get("file");
  const folder = String(form.get("folder"));
  if (!(file instanceof File)) throw new Error("no file");
  if (!validName(folder)) throw new Error(`bad folder "${folder}"`);

  let name = path.basename(file.name).replace(/[^a-z0-9._-]/gi, "-");
  let data: Buffer = Buffer.from(await file.arrayBuffer());
  if (data.length > MAX_BYTES) {
    const small = await shrink(data, file.type);
    if (small) {
      data = small;
      name = name.replace(/\.[^.]*$/, "") + ".webp";
    }
  }

  const dir = path.join(imagesDir, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), data);
  return name;
}

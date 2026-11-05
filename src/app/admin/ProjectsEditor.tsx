"use client";

import { useState } from "react";
import type { ProjectData, ProjectMeta } from "../data";
import { saveProjects, uploadImage } from "./actions";
import { cleanTags, errorText, Field, ListButtons, MarkdownField, move, SaveBar, Sidebar, splitTags } from "./fields";
import styles from "./admin.module.css";
import { restoredNote, useLocalDraft } from "./useLocalDraft";

// `orig` is the file name on disk, so a rename can take the old file + image folder with it
type Draft = ProjectMeta & { shortname: string; body: string; orig?: string };

const blank = (): Draft => ({
  shortname: "",
  name: "new project",
  desc: "",
  order: 0,
  favorite: false,
  tags: [],
  links: { gh: "", demo: "" },
  images: [],
  body: "## Summary\n\n",
});

// height / width, the same ratio indProject uses to size each image
const aspectOf = (file: File) =>
  new Promise<number>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(Math.round((img.naturalHeight / img.naturalWidth) * 100) / 100);
    img.onerror = () => resolve(0.75);
    img.src = URL.createObjectURL(file);
  });

export default function ProjectsEditor(props: { initial: ProjectData[] }) {
  const [projects, setProjects] = useState<Draft[]>(() =>
    props.initial.map(({ text, ...o }) => ({ ...o, orig: o.shortname })),
  );
  const [removed, setRemoved] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // every keystroke is copied to localStorage until it's saved to disk
  const discard = useLocalDraft("admin-draft:projects", { projects, removed }, dirty, (draft, at) => {
    setProjects(draft.projects);
    setRemoved(draft.removed);
    setDirty(true);
    setStatus(restoredNote(at));
  });

  const proj = projects[selected];
  // images live in the folder named after the saved file
  const folder = proj?.orig && proj.orig === proj.shortname ? proj.shortname : null;

  const edit = (fn: (p: Draft) => Draft) => {
    setProjects((list) => list.map((o, i) => (i === selected ? fn(o) : o)));
    setDirty(true);
    setStatus("");
  };

  const add = () => {
    setProjects([...projects, blank()]);
    setSelected(projects.length);
    setDirty(true);
  };

  const reorder = (i: number, by: number) => {
    setProjects(move(projects, i, by));
    if (selected === i) setSelected(Math.min(Math.max(i + by, 0), projects.length - 1));
    else if (selected === i + by) setSelected(i);
    setDirty(true);
  };

  const remove = () => {
    if (!confirm(`delete "${proj.name}"? this removes its markdown file (its images stay in public/images)`)) return;
    if (proj.orig) setRemoved([...removed, proj.orig]);
    setProjects(projects.filter((_, i) => i !== selected));
    setSelected(Math.max(0, selected - 1));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const renames = projects
        .filter((o) => o.orig && o.orig !== o.shortname)
        .map((o) => [o.orig, o.shortname] as [string, string]);
      // the sidebar order becomes each file's `order`
      const entries = projects.map(({ shortname, body, orig, ...meta }, i) => ({
        name: shortname,
        body,
        meta: { ...meta, order: i + 1, tags: cleanTags(meta.tags) },
      }));
      const { skipped } = await saveProjects(entries, [...removed, ...renames.map(([from]) => from)], renames);
      setProjects((list) => list.map((o) => ({ ...o, orig: o.shortname })));
      setRemoved([]);
      setDirty(false);
      setStatus(skipped.length ? `saved, but couldn't move image folders: ${skipped.join(", ")}` : "saved");
    } catch (e) {
      setStatus(`error: ${errorText(e)}`);
    }
    setSaving(false);
  };

  const upload = async (files: File[]) => {
    if (!files.length) return;
    if (!folder) return setStatus("save the project before adding images");
    try {
      for (const file of files) {
        const form = new FormData();
        form.set("file", file);
        form.set("folder", folder);
        const [src, asp] = await Promise.all([uploadImage(form), aspectOf(file)]);
        edit((p) => ({ ...p, images: [...p.images, { src, subtitle: "", asp }] }));
      }
      setStatus("uploaded - remember to save");
    } catch (e) {
      setStatus(`error: ${errorText(e)}`);
    }
  };

  const editImage = (i: number, change: Partial<Draft["images"][number]>) =>
    edit((p) => ({ ...p, images: p.images.map((o, j) => (j === i ? { ...o, ...change } : o)) }));

  return (
    <div className={styles.split}>
      <Sidebar
        items={projects.map((o) => ({ label: `${o.favorite ? "★ " : ""}${o.name}`, sub: `${o.shortname}.md` }))}
        selected={selected}
        onSelect={setSelected}
        onAdd={add}
        addLabel="+ new project"
        onMove={reorder}
      />

      <section className={styles.form}>
        <SaveBar dirty={dirty} status={status} saving={saving} onSave={save} onDiscard={discard} />
        {!proj ? (
          <p className={styles.note}>no projects - add one on the left</p>
        ) : (
          <>
            <div className={styles.row}>
              <Field label="name" value={proj.name} onChange={(v) => edit((p) => ({ ...p, name: v }))} />
              <Field
                label="shortname (url, file + image folder)"
                value={proj.shortname}
                placeholder="my-project"
                onChange={(v) => edit((p) => ({ ...p, shortname: v.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
              />
            </div>
            <Field label="description" value={proj.desc} onChange={(v) => edit((p) => ({ ...p, desc: v }))} />
            <div className={styles.row}>
              <Field
                label="tags (comma separated)"
                value={(proj.tags ?? []).join(", ")}
                onChange={(v) => edit((p) => ({ ...p, tags: splitTags(v) }))}
              />
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={proj.favorite}
                  onChange={(e) => edit((p) => ({ ...p, favorite: e.target.checked }))}
                />
                favorite (shows first)
              </label>
            </div>
            <div className={styles.row}>
              <Field
                label="github link"
                value={proj.links.gh}
                onChange={(v) => edit((p) => ({ ...p, links: { ...p.links, gh: v } }))}
              />
              <Field
                label="demo link"
                value={proj.links.demo}
                onChange={(v) => edit((p) => ({ ...p, links: { ...p.links, demo: v } }))}
              />
            </div>

            <h2>gallery</h2>
            <div className={styles.images}>
              {proj.images.map((img, i) => (
                <div key={i} className={styles.block}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/${proj.orig ?? proj.shortname}/${img.src}`} alt={img.subtitle} />
                  <div className={styles.blockHead}>
                    <Field label="file" value={img.src} onChange={(v) => editImage(i, { src: v })} />
                    <ListButtons
                      onMove={(by) => edit((p) => ({ ...p, images: move(p.images, i, by) }))}
                      onRemove={() => edit((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                    />
                  </div>
                  <div className={styles.row}>
                    <Field label="caption" value={img.subtitle} onChange={(v) => editImage(i, { subtitle: v })} />
                    <Field
                      label="aspect (h / w)"
                      type="number"
                      value={String(img.asp)}
                      onChange={(v) => editImage(i, { asp: Number(v) })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <label className={styles.add}>
              + upload images
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  upload(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
            </label>

            <h2>writeup</h2>
            <MarkdownField
              value={proj.body}
              onChange={(v) => edit((p) => ({ ...p, body: v }))}
              folder={folder}
              onStatus={setStatus}
              hint={`each "## header" is a section`}
            />

            <div className={styles.footer}>
              {proj.orig && (
                <a href={`/projects/${proj.orig}`} target="_blank" className={styles.note}>
                  view saved page ↗
                </a>
              )}
              <button type="button" className={styles.danger} onClick={remove}>
                delete project
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

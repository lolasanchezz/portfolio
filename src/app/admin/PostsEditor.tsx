"use client";

import { useState } from "react";
import type { PostData } from "../data";
import { savePosts } from "./actions";
import { cleanTags, errorText, Field, MarkdownField, SaveBar, Sidebar, splitTags } from "./fields";
import styles from "./admin.module.css";
import { restoredNote, useLocalDraft } from "./useLocalDraft";

// `orig` is the file name on disk, so a rename can clear out the old file
type Draft = PostData & { orig?: string };

const today = () => new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd

export default function PostsEditor(props: { initial: PostData[] }) {
  const [posts, setPosts] = useState<Draft[]>(() => props.initial.map((o) => ({ ...o, orig: o.slug })));
  const [removed, setRemoved] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // every keystroke is copied to localStorage until it's saved to disk
  const discard = useLocalDraft("admin-draft:posts", { posts, removed }, dirty, (draft, at) => {
    setPosts(draft.posts);
    setRemoved(draft.removed);
    setDirty(true);
    setStatus(restoredNote(at));
  });

  const post = posts[selected];

  const edit = (fn: (p: Draft) => Draft) => {
    setPosts((list) => list.map((o, i) => (i === selected ? fn(o) : o)));
    setDirty(true);
    setStatus("");
  };

  const add = () => {
    const slug = `new-post-${posts.length + 1}`;
    setPosts([{ slug, title: "new post", date: today(), desc: "", tags: [], draft: true, body: "" }, ...posts]);
    setSelected(0);
    setDirty(true);
  };

  const remove = () => {
    if (!confirm(`delete "${post.title}"? this removes its markdown file`)) return;
    if (post.orig) setRemoved([...removed, post.orig]);
    setPosts(posts.filter((_, i) => i !== selected));
    setSelected(Math.max(0, selected - 1));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const renamed = posts.filter((o) => o.orig && o.orig !== o.slug).map((o) => o.orig!);
      const entries = posts.map(({ slug, body, orig, ...meta }) => ({
        name: slug,
        body,
        meta: { ...meta, tags: cleanTags(meta.tags), draft: meta.draft || undefined },
      }));
      await savePosts(entries, [...removed, ...renamed]);
      setPosts((list) => list.map((o) => ({ ...o, orig: o.slug })));
      setRemoved([]);
      setDirty(false);
      setStatus("saved");
    } catch (e) {
      setStatus(`error: ${errorText(e)}`);
    }
    setSaving(false);
  };

  return (
    <div className={styles.split}>
      <Sidebar
        items={posts.map((o) => ({ label: o.title, sub: `${o.date}${o.draft ? " · draft" : ""}` }))}
        selected={selected}
        onSelect={setSelected}
        onAdd={add}
        addLabel="+ new post"
      />

      <section className={styles.form}>
        <SaveBar dirty={dirty} status={status} saving={saving} onSave={save} onDiscard={discard} />
        {!post ? (
          <p className={styles.note}>no posts yet - add one on the left</p>
        ) : (
          <>
            <div className={styles.row}>
              <Field label="title" value={post.title} onChange={(v) => edit((p) => ({ ...p, title: v }))} />
              <Field
                label="slug (url + file name)"
                value={post.slug}
                onChange={(v) => edit((p) => ({ ...p, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
              />
            </div>
            <Field label="description" value={post.desc} onChange={(v) => edit((p) => ({ ...p, desc: v }))} />
            <div className={styles.row}>
              <Field label="date" type="date" value={post.date} onChange={(v) => edit((p) => ({ ...p, date: v }))} />
              <Field
                label="tags (comma separated)"
                value={(post.tags ?? []).join(", ")}
                onChange={(v) => edit((p) => ({ ...p, tags: splitTags(v) }))}
              />
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={!!post.draft}
                  onChange={(e) => edit((p) => ({ ...p, draft: e.target.checked }))}
                />
                draft (local only)
              </label>
            </div>

            <MarkdownField
              value={post.body}
              onChange={(v) => edit((p) => ({ ...p, body: v }))}
              folder="blog"
              onStatus={setStatus}
            />

            <div className={styles.footer}>
              {post.orig && (
                <a href={`/blog/${post.orig}`} target="_blank" className={styles.note}>
                  view saved post ↗
                </a>
              )}
              <button type="button" className={styles.danger} onClick={remove}>
                delete post
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

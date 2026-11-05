"use client";

import { useRef } from "react";
import Markdown from "react-markdown";
import blogStyles from "../blog/blog.module.css";
import { uploadImage } from "./actions";
import styles from "./admin.module.css";

// shared bits for both editors

export const move = <T,>(list: T[], i: number, by: number) => {
  const j = i + by;
  if (j < 0 || j >= list.length) return list;
  const out = [...list];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};

export const ListButtons = (props: { onMove: (by: number) => void; onRemove: () => void }) => (
  <span className={styles.listButtons}>
    <button type="button" onClick={() => props.onMove(-1)} title="move up">
      ↑
    </button>
    <button type="button" onClick={() => props.onMove(1)} title="move down">
      ↓
    </button>
    <button type="button" onClick={props.onRemove} title="remove">
      ✕
    </button>
  </span>
);

export function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className={styles.field}>
      <span>{props.label}</span>
      {props.area ? (
        <textarea
          value={props.value}
          rows={5}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <input
          type={props.type ?? "text"}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
    </label>
  );
}

// tags are edited as "a, b, c" - empties get dropped on save
export const splitTags = (v: string) => v.split(",").map((o) => o.trim());
export const cleanTags = (tags?: string[]) => tags?.filter(Boolean);

export const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function SaveBar(props: {
  dirty: boolean;
  status: string;
  onSave: () => void;
  saving: boolean;
  onDiscard?: () => void;
}) {
  return (
    <div className={styles.saveBar}>
      <span className={styles.note}>
        {props.status || (props.dirty ? "unsaved changes (kept in this browser)" : "all saved")}
      </span>
      {props.dirty && props.onDiscard && (
        <button
          type="button"
          className={styles.discard}
          disabled={props.saving}
          onClick={() => confirm("throw away every unsaved change and go back to what's on disk?") && props.onDiscard!()}
        >
          discard changes
        </button>
      )}
      <button type="button" className={styles.save} disabled={!props.dirty || props.saving} onClick={props.onSave}>
        {props.saving ? "saving..." : "save"}
      </button>
    </div>
  );
}

// markdown textarea with a live preview - "+ image" uploads to public/images/<folder> and
// drops the markdown for it at the cursor
export function MarkdownField(props: {
  value: string;
  onChange: (v: string) => void;
  folder: string | null; // null when there's nowhere to upload to yet
  onStatus: (msg: string) => void;
  hint?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const upload = async (files: File[]) => {
    const area = ref.current;
    if (!files.length || !area) return;
    if (!props.folder) return props.onStatus("save first so the images have a folder to go in");
    try {
      const names = await Promise.all(
        files.map((file) => {
          const form = new FormData();
          form.set("file", file);
          form.set("folder", props.folder!);
          return uploadImage(form);
        }),
      );
      const md = names.map((o) => `![](/images/${props.folder}/${o})`).join("\n");
      const at = area.selectionStart;
      props.onChange(props.value.slice(0, at) + md + props.value.slice(at));
    } catch (e) {
      props.onStatus(`error: ${errorText(e)}`);
    }
  };

  return (
    <div className={styles.markdown}>
      <div className={styles.field}>
        <span>
          markdown{props.hint && ` - ${props.hint}`}
          <label className={styles.inlineAdd}>
            + image
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
        </span>
        <textarea ref={ref} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
      </div>
      <div className={`${styles.preview} ${blogStyles.body}`}>
        <Markdown>{props.value}</Markdown>
      </div>
    </div>
  );
}

// the sidebar list - `onMove` adds ↑ ↓ buttons for things whose order matters
export function Sidebar(props: {
  items: { label: string; sub?: string }[];
  selected: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  addLabel: string;
  onMove?: (i: number, by: number) => void;
}) {
  return (
    <aside className={styles.sidebar}>
      {props.items.map((o, i) => (
        <div key={i} className={`${styles.item} ${i === props.selected ? styles.active : ""}`}>
          <button type="button" onClick={() => props.onSelect(i)}>
            {o.label || "untitled"}
            {o.sub && <small>{o.sub}</small>}
          </button>
          {props.onMove && (
            <span className={styles.listButtons}>
              <button type="button" title="move up" onClick={() => props.onMove!(i, -1)}>
                ↑
              </button>
              <button type="button" title="move down" onClick={() => props.onMove!(i, 1)}>
                ↓
              </button>
            </span>
          )}
        </div>
      ))}
      <button type="button" className={styles.add} onClick={props.onAdd}>
        {props.addLabel}
      </button>
    </aside>
  );
}

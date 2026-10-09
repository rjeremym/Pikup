import { useSessionRevision } from "@/lib/session-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ChevronUp, Plus, Trash2, Undo2, X } from "lucide-react";
import { PageHeader } from "@/components/section-layout";
import { Notice } from "@/components/form-bits";
import {
  UP_NEXT_LIMIT,
  getBacklog,
  saveBacklog,
  type BacklogItem,
  type Lane,
} from "@/lib/intentions";
import { TOPICS, addTopic, getTopics } from "@/lib/tracker";

const NEW_TOPIC = "__new";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intentions/backlog")({
  head: () => ({
    meta: [
      { title: "Product backlog — Pikup" },
      {
        name: "description",
        content: "Everything you mean to build, with the next few items up front.",
      },
    ],
  }),
  component: BacklogPage,
});

function BacklogPage() {
  const revision = useSessionRevision();
  const [items, setItems] = useState<BacklogItem[] | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState<string[]>(TOPICS);
  /** null while picking from the list; a string while typing a new topic */
  const [newTopic, setNewTopic] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [removed, setRemoved] = useState<{ item: BacklogItem; index: number } | null>(null);

  useEffect(() => {
    setItems(getBacklog());
    setTopics(getTopics());
  }, [revision]);

  const commit = (next: BacklogItem[]) => {
    saveBacklog(next);
    setItems(next);
  };

  const lane = (l: Lane) => items?.filter((i) => i.lane === l) ?? [];
  const upNextFull = lane("next").length >= UP_NEXT_LIMIT;

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t || !items) return;
    let itemTopic = topic || undefined;
    if (newTopic?.trim()) {
      itemTopic = addTopic(newTopic);
      setTopics(getTopics());
      setTopic(itemTopic);
      setNewTopic(null);
    }
    const item: BacklogItem = {
      id: crypto.randomUUID(),
      title: t,
      topic: itemTopic,
      lane: "later",
    };
    commit([...items, item]);
    setTitle("");
    setJustAdded(item.id);
    setRemoved(null);
  };

  /** moving between lanes puts the item at the bottom of its new lane */
  const moveTo = (id: string, to: Lane) => {
    if (!items) return;
    const item = items.find((i) => i.id === id)!;
    commit([...items.filter((i) => i.id !== id), { ...item, lane: to }]);
  };

  /** swap with the item above it in the same lane */
  const raise = (id: string) => {
    if (!items) return;
    const index = items.findIndex((i) => i.id === id);
    const item = items[index]!;
    let above = index - 1;
    while (above >= 0 && items[above]!.lane !== item.lane) above--;
    if (above < 0) return;
    const next = [...items];
    next[index] = next[above]!;
    next[above] = item;
    commit(next);
  };

  const remove = (id: string) => {
    if (!items) return;
    const index = items.findIndex((i) => i.id === id);
    setRemoved({ item: items[index]!, index });
    commit(items.filter((i) => i.id !== id));
  };

  const undo = () => {
    if (!items || !removed) return;
    const next = [...items];
    next.splice(removed.index, 0, removed.item);
    commit(next);
    setRemoved(null);
  };

  const row = (item: BacklogItem, i: number) => (
    <ItemRow
      key={item.id}
      item={item}
      first={i === 0}
      highlight={item.id === justAdded}
      upNextFull={upNextFull}
      onMove={moveTo}
      onRaise={raise}
      onRemove={remove}
    />
  );

  return (
    <>
      <PageHeader
        title="Product backlog"
        lead="Everything you mean to build. Keep the next few up front, so a session never starts with “what now?”"
      >
        <Link to="/intentions/goals" className="sketch-link">
          Goals
        </Link>
      </PageHeader>

      <form
        onSubmit={add}
        className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-pencil/50 bg-card/70 p-3"
      >
        <label htmlFor="item-title" className="sr-only">
          New backlog item
        </label>
        <input
          id="item-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add an item, e.g. “Add a search box to the trail list”"
          maxLength={100}
          className="sketch-input min-w-[14rem] flex-1"
        />
        <label htmlFor="item-topic" className="sr-only">
          {newTopic === null ? "Topic" : "New topic name"}
        </label>
        {newTopic === null ? (
          <select
            id="item-topic"
            value={topic}
            onChange={(e) => {
              if (e.target.value === NEW_TOPIC) {
                setNewTopic("");
              } else {
                setTopic(e.target.value);
              }
            }}
            className="sketch-input w-auto"
          >
            <option value="">No topic</option>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
            <option value={NEW_TOPIC}>+ New topic…</option>
          </select>
        ) : (
          <span className="relative inline-flex">
            <input
              id="item-topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setNewTopic(null);
              }}
              placeholder="New topic, e.g. Audio"
              maxLength={24}
              autoFocus
              className="sketch-input w-44 pr-9"
            />
            <button
              type="button"
              onClick={() => setNewTopic(null)}
              aria-label="Cancel new topic"
              title="Cancel new topic"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
        )}
        <button type="submit" disabled={!title.trim()} className="sketch-btn-primary text-xl">
          <Plus className="h-5 w-5" aria-hidden /> Add
        </button>
        <p className="w-full px-1 text-xs text-muted-foreground">
          New items land at the bottom of <strong>Later</strong>. Move them up when they matter.
          Pick <strong>+ New topic…</strong> to add your own tag.
        </p>
      </form>

      {removed && (
        <Notice className="mt-4">
          Deleted “{removed.item.title}”.{" "}
          <button
            type="button"
            onClick={undo}
            className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-dotted underline-offset-2"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo
          </button>
        </Notice>
      )}

      {items && (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <LaneCard
            id="lane-next"
            title="Up next"
            count={`${lane("next").length}/${UP_NEXT_LIMIT}`}
            hint={
              upNextFull
                ? "Full. Finish one or send it back to Later before pulling in more."
                : "Your next few sessions. Keep it short."
            }
            tape="bg-accent/50"
            empty="Nothing queued. Pull something up from Later."
          >
            {lane("next").map(row)}
          </LaneCard>

          <LaneCard
            id="lane-later"
            title="Later"
            count={String(lane("later").length)}
            hint="Everything else, most important first."
            tape="bg-washi"
            empty="The backlog is empty. Add an idea above."
          >
            {lane("later").map(row)}
          </LaneCard>

          {lane("done").length > 0 && (
            <details className="md:col-span-2">
              <summary className="hand cursor-pointer text-2xl text-muted-foreground hover:text-foreground">
                Done ({lane("done").length})
              </summary>
              <ul className="mt-3 grid gap-2 md:grid-cols-2">{lane("done").map(row)}</ul>
            </details>
          )}
        </div>
      )}
    </>
  );
}

function LaneCard({
  id,
  title,
  count,
  hint,
  tape,
  empty,
  children,
}: {
  id: string;
  title: string;
  count: string;
  hint: string;
  tape: string;
  empty: string;
  children: ReactNode[];
}) {
  return (
    <section aria-labelledby={id} className="paper-card relative min-w-0 px-3 pt-9 pb-5 sm:px-5">
      <div className={cn("absolute -top-3 left-8 h-7 w-24 -rotate-2 rounded-sm", tape)} />
      <div className="flex items-baseline justify-between gap-2">
        <h2 id={id} className="hand text-3xl">
          {title}
        </h2>
        <span className="text-sm font-semibold text-muted-foreground">{count}</span>
      </div>
      <p className="text-sm text-muted-foreground">{hint}</p>
      {children.length ? (
        <ul className="mt-4 space-y-2">{children}</ul>
      ) : (
        <p className="mt-4 rounded-xl border-2 border-dashed border-pencil/30 px-4 py-6 text-center text-sm text-muted-foreground italic">
          {empty}
        </p>
      )}
    </section>
  );
}

function ItemRow({
  item,
  first,
  highlight,
  upNextFull,
  onMove,
  onRaise,
  onRemove,
}: {
  item: BacklogItem;
  first: boolean;
  highlight: boolean;
  upNextFull: boolean;
  onMove: (id: string, to: Lane) => void;
  onRaise: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const done = item.lane === "done";
  const checkboxId = `item-${item.id}`;
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 border-pencil/30 bg-card px-3 py-2.5 transition-shadow",
        highlight && "border-accent-foreground/50 ring-4 ring-accent/40",
      )}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={done}
        onChange={() => onMove(item.id, done ? "later" : "done")}
        className="mt-1 h-5 w-5 shrink-0 accent-primary"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            "cursor-pointer leading-snug break-words",
            done && "text-muted-foreground line-through",
          )}
        >
          {item.title}
        </label>
        {item.topic && (
          <span className="mt-1 block text-xs text-muted-foreground">#{item.topic}</span>
        )}
      </div>
      {!done && (
        <div className="flex shrink-0 items-center">
          <IconButton label="Move up" onClick={() => onRaise(item.id)} disabled={first}>
            <ChevronUp className="h-4 w-4" />
          </IconButton>
          {/* words, not arrows: lanes sit side by side on desktop but stack on phones */}
          {item.lane === "later" ? (
            <button
              type="button"
              onClick={() => onMove(item.id, "next")}
              disabled={upNextFull}
              title={upNextFull ? "Up next is full" : "Move to Up next"}
              className="sketch-chip mx-1 text-xs disabled:pointer-events-none disabled:opacity-40"
            >
              Do next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onMove(item.id, "later")}
              title="Send back to Later"
              className="sketch-chip mx-1 text-xs"
            >
              Later
            </button>
          )}
        </div>
      )}
      <IconButton label={`Delete “${item.title}”`} onClick={() => onRemove(item.id)}>
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </li>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

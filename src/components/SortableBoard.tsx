import { useState, type FormEvent } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { LiquidGlass } from "./LiquidGlass";
import { GripIcon, PlusIcon, TrashIcon } from "./icons";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Item = { id: string; text: string };

const DEFAULT_ITEMS: Item[] = [
  { id: "seed-1", text: "Rediseñar el hero con el nuevo material de vidrio" },
  { id: "seed-2", text: "Migrar el blog a MDX" },
  { id: "seed-3", text: "Modo presentación para el roadmap" },
  { id: "seed-4", text: "Optimizar imágenes con AVIF" },
  { id: "seed-5", text: "Panel de métricas en vivo" },
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

function SortableRow({ item, onRemove }: { item: Item; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      className={`row ${isDragging ? "row-ghost" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="drag-handle"
        aria-label="Reordenar"
        {...attributes}
        {...listeners}
      >
        <GripIcon className="text-lg" />
      </button>

      <span className="row-text">{item.text}</span>

      <button
        type="button"
        className="row-remove"
        aria-label={`Borrar "${item.text}"`}
        onClick={() => onRemove(item.id)}
      >
        <TrashIcon className="text-base" />
      </button>
    </li>
  );
}

function RowContent({ text }: { text: string }) {
  return (
    <>
      <span className="drag-handle" aria-hidden>
        <GripIcon className="text-lg" />
      </span>
      <span className="row-text">{text}</span>
    </>
  );
}

export function SortableBoard() {
  const [items, setItems] = useLocalStorage<Item[]>("lg-board-v1", DEFAULT_ITEMS);
  const [draft, setDraft] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeItem = items.find((i) => i.id === activeId) ?? null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === active.id);
      const to = prev.findIndex((i) => i.id === over.id);
      return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
    });
  }

  function onDragCancel(_event: DragCancelEvent) {
    setActiveId(null);
  }

  function addItem(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: uid(), text }]);
    setDraft("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <LiquidGlass
      radius={36}
      blur={14}
      tint={0.08}
      refract={16}
      edge={44}
      interactive
      className="flex h-full flex-col gap-5 p-6 sm:p-8"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="pill">drag &amp; drop</span>
          <span className="hint">
            {items.length} {items.length === 1 ? "idea" : "ideas"}
          </span>
        </div>
        <span className="hint hidden sm:block">arrastrá desde ⠿ para ordenar</span>
      </header>

      <form onSubmit={addItem} className="flex gap-2">
        <input
          className="glass-input"
          placeholder="Nueva idea…"
          value={draft}
          maxLength={90}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Nueva idea"
        />
        <button type="submit" className="glass-btn glass-btn-add" aria-label="Agregar idea">
          <PlusIcon className="text-xl" />
        </button>
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.length > 0 ? (
            <ul className="flex flex-1 flex-col gap-2.5">
              {items.map((item) => (
                <SortableRow key={item.id} item={item} onRemove={removeItem} />
              ))}
            </ul>
          ) : (
            <p className="empty">Sin ideas por acá — agregá la primera arriba.</p>
          )}
        </SortableContext>

        <DragOverlay
          dropAnimation={{ duration: 220, easing: "cubic-bezier(0.18, 1, 0.4, 1)" }}
        >
          {activeItem ? (
            <div className="row row-overlay">
              <RowContent text={activeItem.text} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <p className="hint text-center">el orden se guarda solo · probá con teclado usando Tab</p>
    </LiquidGlass>
  );
}

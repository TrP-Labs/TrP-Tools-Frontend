"use client"
import { IconCaretUpFilled, IconCaretDownFilled } from '@tabler/icons-react';
import { useState, useRef, useEffect, useCallback } from 'react';

type displaysettings = {
  [key: string]: { id: string; display: string; order?: number };
};

export default function LargeDropdown({ currentSelection, selection, effect } : {currentSelection : string, selection: displaysettings, effect : (value: string) => void}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentSelection)
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(currentSelection);
  }, [currentSelection]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const previousSelectionRef = useRef(currentSelection);

  useEffect(() => {
    if (selected !== previousSelectionRef.current) {
      previousSelectionRef.current = selected;
      effect(selected)
    }
  }, [selected, effect]);



  const handleSelection = useCallback((id: string) => {
    setSelected(id);
    setOpen(false);
  }, []);

  const entries = Object.entries(selection);
  const hasOrdering = entries.some(([, value]) => typeof value.order === "number");
  const orderedEntries = hasOrdering
    ? [...entries].sort(([, a], [, b]) => {
        const orderA = typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
        const orderB = typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
        if (orderA === orderB) {
          return 0;
        }
        return orderA - orderB;
      })
    : entries;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="px-4 py-2 bg-[var(--foreground)] text-[var(--text)] rounded-sm hover:brightness-110 transition flex cursor-pointer"
      >
        {selection[selected]?.display || 'Select an option'}
        {open ? <IconCaretUpFilled stroke={0.5} /> : <IconCaretDownFilled stroke={0.5} />}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-[var(--background-muted)] text-[var(--text)] rounded-sm shadow-lg z-10">
          {orderedEntries.map(([key, { id, display }]) => (
            <button
              type="button"
              className={`block w-full text-left px-4 py-2 hover:bg-[var(--foreground)] rounded-sm ${selected === id ? 'bg-[var(--background-secondary-muted)]' : 'cursor-pointer bg-none'}`}
              key={key}
              onClick={() => handleSelection(id)}
            >
              {display}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

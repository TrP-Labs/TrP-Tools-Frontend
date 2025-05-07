"use client"
import { IconCaretUpFilled, IconCaretDownFilled } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';

type displaysettings = {
  [key: string]: { id: string; display: string };
};

export default function LargeDropdown({ currentSelection, selection, effect } : {currentSelection : string, selection: displaysettings, effect : Function}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentSelection)
  const menuRef = useRef<HTMLDivElement>(null);

  let lastCheckedSelected = currentSelection

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (selected !== lastCheckedSelected) {
      lastCheckedSelected = selected
      effect(selected)
    }
  })

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="px-4 py-2 bg-[#393939] text-white rounded-sm hover:brightness-110 transition flex cursor-pointer"
      >
        {selection[selected].display}
        {open ? <IconCaretUpFilled stroke={0.5} /> : <IconCaretDownFilled stroke={0.5} />}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-[#393939] text-white rounded-sm shadow-lg z-10">
          {Object.entries(selection).map(([key, { id, display }]) => {
             return <button 
             className={`block w-full text-left px-4 py-2 hover:bg-[#4d4d4d] rounded-sm ${selected === id ? 'bg-[#4d4d4d]' : 'cursor-pointer bg-none'}`} 
             key={key}
             onClick={() => {setSelected(id); setOpen(false)}}
             >{display}</button>
          })}
        </div>
      )}
    </div>
  );
}

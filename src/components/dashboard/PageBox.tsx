"use client";
import React from 'react';

interface PageBoxProps {
  children: React.ReactNode;
  className?: string;
}

const PageBox: React.FC<PageBoxProps> = ({ children, className }) => {
  return (
    <section
      className={['rounded-lg shadow-md p-6 mb-6 bg-[var(--background-secondary)', className].filter(Boolean).join(' ')}
      data-testid="page-box"
    >
      {children}
    </section>
  );
};

export default PageBox;

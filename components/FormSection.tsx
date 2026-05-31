import React from "react";

interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormSection({
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div
      className={`bg-slate-50/50 p-3 rounded-lg border border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
}

import React from "react";
import { TEMPLATE_SECTIONS } from "../data/templates";
import type { TemplateName } from "../types";

interface TemplateDropdownProps {
  value: TemplateName | null;
  onChange: (template: TemplateName | null) => void;
}

const templateNames = Object.keys(TEMPLATE_SECTIONS) as TemplateName[];

export const TemplateDropdown: React.FC<TemplateDropdownProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val === "" ? null : (val as TemplateName));
  };

  return (
    <select
      value={value ?? ""}
      onChange={handleChange}
      style={{
        padding: "10px 14px",
        fontSize: 14,
        fontFamily: "var(--font)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--bg-input)",
        color: "var(--text-primary)",
        cursor: "pointer",
        width: "100%",
        outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23737373' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
      }}
    >
      <option value="">Select a template...</option>
      {templateNames.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  );
};

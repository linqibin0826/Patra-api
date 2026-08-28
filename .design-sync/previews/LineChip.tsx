import { LineChip } from "patra-learn";
import { LINES } from "patra-learn/src/content/lines";

const open = LINES.filter((l) => l.status === "open");
const planned = LINES.filter((l) => l.status === "planned");

export const OpenLines = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    {open.map((l) => (
      <LineChip key={l.id} line={l} />
    ))}
  </div>
);

export const PlannedLines = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    {planned.map((l) => (
      <LineChip key={l.id} line={l} />
    ))}
  </div>
);

export const ShortLabels = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    {open.map((l) => (
      <LineChip key={l.id} line={l} label={l.name.split(" · ")[0]} />
    ))}
  </div>
);

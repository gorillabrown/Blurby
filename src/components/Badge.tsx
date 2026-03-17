export default function Badge({ children, color = "#888" }) {
  return (
    <span
      className="badge"
      style={{ background: `${color}18`, color }}
    >
      {children}
    </span>
  );
}

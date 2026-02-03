// src/app/hrm/layout.jsx
export default function HRMLayout({ children }) {
  return (
    <div className="flex">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}

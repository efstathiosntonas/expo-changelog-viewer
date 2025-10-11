import { SidebarContent } from './SidebarContent';

export function Sidebar() {
  return (
    <aside
      aria-label="Module selection sidebar"
      className="hidden md:block w-[600px] border-r bg-muted/40 h-screen"
      role="complementary"
    >
      <nav aria-label="Module filters and selection">
        <SidebarContent />
      </nav>
    </aside>
  );
}

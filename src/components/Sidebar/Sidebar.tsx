import { SidebarContent } from './SidebarContent';

export function Sidebar() {
  return (
    <aside className="hidden md:block w-80 border-r bg-muted/40 h-screen flex flex-col">
      <SidebarContent />
    </aside>
  );
}

import { SidebarContent } from './SidebarContent';

export function Sidebar() {
  return (
    <aside className="hidden md:block w-[600px] border-r bg-muted/40 h-screen">
      <SidebarContent />
    </aside>
  );
}

import { AdminBottomNav } from "./AdminBottomNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1 pb-24">{children}</div>
      <AdminBottomNav />
    </div>
  );
}

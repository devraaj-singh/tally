import AppHeader from "@/components/AppHeader";
import ClientDateSync from "@/components/ClientDateSync";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ClientDateSync />
      <AppHeader />
      <div className="mx-auto max-w-md pb-[calc(4.5rem+env(safe-area-inset-bottom))]">{children}</div>
      <BottomNav />
    </>
  );
}

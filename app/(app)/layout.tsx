import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto max-w-md pb-[calc(4.5rem+env(safe-area-inset-bottom))]">{children}</div>
      <BottomNav />
    </>
  );
}

import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 shadow-sm md:shadow-none md:bg-transparent md:dark:bg-transparent overflow-hidden relative transition-colors duration-300 md:p-6 pb-20 md:pb-6">
          <div className="h-full w-full md:bg-white md:dark:bg-gray-900 md:rounded-3xl md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-800 overflow-y-auto">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

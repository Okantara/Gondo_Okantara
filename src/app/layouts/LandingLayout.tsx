import { Outlet } from "react-router-dom";
import { Navbar } from "../landing/Navbar";
import { Footer } from "../landing/Footer";

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

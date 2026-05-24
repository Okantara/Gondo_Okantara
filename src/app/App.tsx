import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// LANDING
import Home from "./landing/Home";
import { Products } from "./landing/Products";
import { Gallery } from "./landing/Gallery";
import { Marketplace } from "./landing/Marketplace";
import { FormKemitraan } from "./landing/GabungMitra";

// Kasir
import { LoginKasirPage } from "./Kasir/LoginKasir";
import { Order } from "./Kasir/Order";

// ADMIN
import { LoginPage } from "./admin/LoginPage";
import { DashboardHome } from "./admin/DashboardHome";
import { KatalogPage } from "./admin/KatalogPage";
import { ProductsPage } from "./admin/ProductsPage";
import { ProfilePage } from "./admin/ProfilePage";
import { KeunggulanProduk } from "./admin/Keunggulanproduk";
import { MitraManagementPage } from "./admin/MitraManagementPage";
import { MitraPage } from "./admin/MitraPage";
import { SlidesPage } from "./admin/SlidesPage";

// LAYOUT
import { LandingLayout } from "./layouts/LandingLayout";
import { DashboardLayout } from "./admin/DashboardLayout";

// UTILS
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          {/* ================= LANDING ================= */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/katalog" element={<Products />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/mitra-kerja" element={<Marketplace />} />
            <Route path="/gabung-mitra" element={<FormKemitraan />} />
            {/* ================= KASIR PROTECTED ================= */}
            <Route element={<ProtectedRoute />}>
              <Route path="/kasir" element={<Order />} />
            </Route>
          </Route>

          {/* ================= LOGIN ================= */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/kasir/login" element={<LoginKasirPage />} />

          {/* ================= ADMIN PROTECTED ================= */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="Galerry" element={<ProductsPage />} />
              <Route path="Katalog" element={<KatalogPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="keunggulan-produk" element={<KeunggulanProduk />} />
              <Route path="slides" element={<SlidesPage />} />
              <Route path="MitraPage" element={<MitraPage />} />
              <Route
                path="mitra-management"
                element={<MitraManagementPage />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

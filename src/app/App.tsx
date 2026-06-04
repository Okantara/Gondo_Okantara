import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// LANDING
import Home from "./landing/Home";
import { Products } from "./landing/Products";
import { Gallery } from "./landing/Gallery";
import { Marketplace } from "./landing/Marketplace";
import { FormKemitraan } from "./landing/GabungMitra";

// Kasir
import { Order } from "./Kasir/Order";
import { KasirDashboard } from "./Kasir/KasirDashboard";
import { KasirLayout } from "./Kasir/KasirLayout";

// ADMIN
import { DashboardHome } from "./admin/DashboardHome";
import { KatalogPage } from "./admin/KatalogPage";
import { ProductsPage } from "./admin/ProductsPage";
import { ProfilePage } from "./admin/ProfilePage";
import { KeunggulanProduk } from "./admin/Keunggulanproduk";
import { MitraManagementPage } from "./admin/MitraManagementPage";
import { MitraPage } from "./admin/MitraPage";
import { SlidesPage } from "./admin/SlidesPage";
import { MetodePembayaranPage } from "./admin/PembayaranPage";
import { PasswordManagementPage } from "./admin/PasswordManagementPage";

// AUTH
import { UnifiedLoginPage } from "./auth/UnifiedLoginPage";

// LAYOUT
import { LandingLayout } from "./layouts/LandingLayout";
import { DashboardLayout } from "./admin/DashboardLayout";

// UTILS
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";
import { TrackingWrapper } from "./components/TrackingWrapper";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TrackingWrapper>
          <ScrollToTop />

          <Routes>
            {/* ================= LANDING ================= */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/katalog" element={<Products />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/mitra-kerja" element={<Marketplace />} />
              <Route path="/gabung-mitra" element={<FormKemitraan />} />
            </Route>

            {/* ================= LOGIN PAGES ================= */}
            {/* Unified login yang dapat diakses dari kedua path */}
            <Route path="/login" element={<UnifiedLoginPage mode="auto" />} />
            <Route
              path="/admin/login"
              element={<UnifiedLoginPage mode="admin" />}
            />
            <Route
              path="/kasir/login"
              element={<UnifiedLoginPage mode="kasir" />}
            />

            {/* ================= KASIR PROTECTED ================= */}
            <Route element={<ProtectedRoute requiredRole="kasir" />}>
              <Route path="/kasir" element={<KasirLayout />}>
                <Route index element={<KasirDashboard />} />
                <Route path="order" element={<Order />} />
              </Route>
            </Route>

            {/* ================= ADMIN PROTECTED ================= */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="Galerry" element={<ProductsPage />} />
                <Route path="Katalog" element={<KatalogPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                  path="keunggulan-produk"
                  element={<KeunggulanProduk />}
                />
                <Route path="slides" element={<SlidesPage />} />
                <Route path="MitraPage" element={<MitraPage />} />
                <Route
                  path="mitra-management"
                  element={<MitraManagementPage />}
                />
                <Route
                  path="metode-pembayaran"
                  element={<MetodePembayaranPage />}
                />
                <Route
                  path="password-management"
                  element={<PasswordManagementPage />}
                />
              </Route>
            </Route>
          </Routes>
        </TrackingWrapper>
      </BrowserRouter>
    </AuthProvider>
  );
}

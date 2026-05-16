import { ImagePlay, ShoppingBasket, Image, Handshake } from "lucide-react";

export function DashboardHome() {
  const stats = [
    {
      title: "Image Slider",
      value: "3",
      icon: ImagePlay,
      color: "bg-blue-500",
    },
    {
      title: "Katalog Produk",
      value: "20",
      icon: ShoppingBasket,
      color: "bg-green-500",
    },
    {
      title: "Varian Abon",
      value: "10",
      icon: Image,
      color: "bg-purple-500",
    },
    {
      title: "Mitra Kerja",
      value: "20",
      icon: Handshake,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang di admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Aktivitas Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Pesanan baru #12345</p>
              <p className="text-sm text-gray-600">2 menit yang lalu</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Produk "Sepatu Nike" diupdate</p>
              <p className="text-sm text-gray-600">15 menit yang lalu</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">5 foto ditambahkan ke galeri</p>
              <p className="text-sm text-gray-600">1 jam yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

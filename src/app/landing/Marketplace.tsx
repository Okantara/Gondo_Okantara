const marketplaces = [
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1763747958224-7726941b0b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    logo: "https://images.unsplash.com/photo-1764184661156-e8803cef9b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export function Marketplace() {
  return (
    <section className="py-20 bg-linear-to-br from-[#FFF8F0] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">
            Mitra Kerja
          </h2>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-center ">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {marketplaces.map((marketplace, index) => (
              <div key={index} className="flex flex-col items-center">
                <img
                  src={marketplace.logo}
                  className="w-20 h-20 object-cover rounded-full mb-4"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

const formFields = [
  {
    name: "namaLengkap",
    label: "Nama Lengkap",
    type: "text",
    placeholder: "Masukkan nama lengkap",
  },
  {
    name: "whatsapp",
    label: "Nomor WhatsApp",
    type: "tel",
    placeholder: "08xxxxxxxxxx",
  },
  {
    name: "alamat",
    label: "Alamat Lengkap",
    type: "textarea",
    placeholder: "Masukkan alamat lengkap",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "email@example.com",
  },
];

export function FormKemitraan() {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    whatsapp: "",
    alamat: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    formFields.forEach((field) => {
      const value = formData[field.name as keyof typeof formData];

      if (!value || value.trim() === "") {
        newErrors[field.name] = "Wajib diisi";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    const { error } = await supabase.from("kontak").insert({
      nama_lengkap: formData.namaLengkap,
      whatsapp: formData.whatsapp,
      alamat: formData.alamat,
      email: formData.email,
    });

    setLoading(false);

    if (error) {
      console.error("Gagal mengirim data:", error);
      alert("Gagal mengirim pendaftaran!");
      return;
    }

    alert("Pendaftaran kemitraan berhasil dikirim!");

    setFormData({
      namaLengkap: "",
      whatsapp: "",
      alamat: "",
      email: "",
    });
  };

  return (
    <section
      id="kemitraan"
      className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-20 pb-10"
    >
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Isi Data
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label} <span className="text-red-500">*</span>
                {errors[field.name] && (
                  <span className="text-red-500 text-xs ml-2">
                    ({errors[field.name]})
                  </span>
                )}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={2}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition ${
                    errors[field.name]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition ${
                    errors[field.name]
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition duration-300"
          >
            {loading ? "Mengirim..." : "Bermitra"}
          </button>
        </form>
      </div>
    </section>
  );
}

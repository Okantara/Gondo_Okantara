import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Phone, Mail, MapPin, Image, Trash2, Upload } from "lucide-react";

interface ProfileData {
  id?: string;
  businessName: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  description: string;
  socialMedia: {
    facebook: string;
    instagram: string;
  };
  logo: string;
}

const emptyProfile: ProfileData = {
  businessName: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  description: "",
  socialMedia: {
    facebook: "",
    instagram: "",
  },
  logo: "",
};

export function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfile);
  const [editData, setEditData] = useState<ProfileData>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profile_data")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Gagal mengambil profil:", error);
      setLoading(false);
      return;
    }

    const mappedData: ProfileData = {
      id: data.id,
      businessName: data.business_name || "",
      whatsapp: data.whatsapp || "",
      email: data.email || "",
      address: data.address || "",
      city: data.city || "",
      province: data.province || "",
      postalCode: data.postal_code || "",
      description: data.description || "",
      socialMedia: {
        facebook: data.facebook || "",
        instagram: data.instagram || "",
      },
      logo: data.logo || "",
    };

    setProfileData(mappedData);
    setEditData(mappedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUploadLogo = async (file: File) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      alert("Format logo harus JPG, PNG, atau WEBP");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran logo maksimal 2MB");
      return;
    }

    setUploadingLogo(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("gondo-okantara")
      .upload(`profile-logo/${fileName}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Gagal upload logo:", uploadError);
      alert("Gagal upload logo");
      setUploadingLogo(false);
      return;
    }

    const { data } = supabase.storage
      .from("gondo-okantara")
      .getPublicUrl(`profile-logo/${fileName}`);

    setEditData((prev) => ({
      ...prev,
      logo: data.publicUrl,
    }));

    setUploadingLogo(false);
  };

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleDeleteLogo = () => {
    setEditData({
      ...editData,
      logo: "",
    });
  };

  const handleSave = async () => {
    if (!editData.id) return;

    const { error } = await supabase
      .from("profile_data")
      .update({
        business_name: editData.businessName,
        whatsapp: editData.whatsapp,
        email: editData.email,
        address: editData.address,
        city: editData.city,
        province: editData.province,
        postal_code: editData.postalCode,
        description: editData.description,
        facebook: editData.socialMedia.facebook,
        instagram: editData.socialMedia.instagram,
        logo: editData.logo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editData.id);

    if (error) {
      console.error("Gagal menyimpan profil:", error);
      alert("Gagal menyimpan profil");
      return;
    }

    setProfileData(editData);
    setIsEditing(false);
    alert("Profil berhasil disimpan");
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profil Toko</h1>

        {!isEditing && (
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informasi Bisnis
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Bisnis
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.businessName}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        businessName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>

                {isEditing ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informasi Kontak
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline mr-2" size={16} />
                  WhatsApp
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.whatsapp}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        whatsapp: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.whatsapp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </label>

                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <MapPin className="inline mr-2" size={20} />
              Alamat
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Lengkap
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.city}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.province}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          province: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.province}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pos
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.postalCode}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.postalCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <Image className="inline mr-2" size={20} />
              Logo Bisnis
            </h2>

            <div className="flex justify-center mb-4">
              {(isEditing ? editData.logo : profileData.logo) ? (
                <img
                  src={isEditing ? editData.logo : profileData.logo}
                  alt={profileData.businessName || "Logo bisnis"}
                  className="w-32 h-32 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                  Logo
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload size={18} />
                  {uploadingLogo ? "Mengupload..." : "Upload Logo"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadLogo(file);
                    }}
                    className="hidden"
                  />
                </label>

                {editData.logo && (
                  <button
                    type="button"
                    onClick={handleDeleteLogo}
                    className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} />
                    Hapus Logo
                  </button>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Format JPG, PNG, WEBP. Maksimal 2MB.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                {profileData.logo ? "Logo aktif digunakan" : "Belum ada logo"}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Media Sosial
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.socialMedia.facebook}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialMedia: {
                          ...editData.socialMedia,
                          facebook: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.socialMedia.facebook}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={editData.socialMedia.instagram}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        socialMedia: {
                          ...editData.socialMedia,
                          instagram: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.socialMedia.instagram}
                  </p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={uploadingLogo}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                Simpan Perubahan
              </button>

              <button
                onClick={handleCancel}
                disabled={uploadingLogo}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

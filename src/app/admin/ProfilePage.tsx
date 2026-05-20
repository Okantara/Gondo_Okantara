import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Phone, Mail, MapPin } from "lucide-react";

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
};

export function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfile);
  const [editData, setEditData] = useState<ProfileData>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profile_data")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error(error);
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
      };

      setProfileData(mappedData);
      setEditData(mappedData);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
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
      })
      .eq("id", editData.id);

    if (error) {
      console.error(error);
      return;
    }

    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
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
                      setEditData({ ...editData, businessName: e.target.value })
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
                      setEditData({ ...editData, description: e.target.value })
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
                      setEditData({ ...editData, whatsapp: e.target.value })
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
                      setEditData({ ...editData, email: e.target.value })
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
                      setEditData({ ...editData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.city}
                      onChange={(e) =>
                        setEditData({ ...editData, city: e.target.value })
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
                        setEditData({ ...editData, province: e.target.value })
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
                      setEditData({ ...editData, postalCode: e.target.value })
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
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={20} />
                Simpan Perubahan
              </button>

              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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

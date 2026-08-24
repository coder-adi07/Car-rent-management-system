import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import driverService from '../../services/driver.service';
import { getImageUrl } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';

const DriverEditProfile = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    profileImage: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    experienceYears: 0,
    street: '',
    city: 'ঢাকা',
    district: 'ঢাকা',
    postalCode: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: 'স্ত্রী',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await driverService.getDriverMe();
        if (res.success && res.data?.driver) {
          const d = res.data.driver;
          setFormData({
            fullName: d.fullName || d.user?.name || '',
            phone: d.phone || d.user?.phone || '',
            email: d.email || d.user?.email || '',
            profileImage: d.profileImage || '',
            dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split('T')[0] : '',
            licenseNumber: d.licenseNumber || '',
            licenseExpiryDate: d.licenseExpiryDate ? d.licenseExpiryDate.split('T')[0] : '',
            experienceYears: d.experienceYears || 0,
            street: d.address?.street || '',
            city: d.address?.city || 'ঢাকা',
            district: d.address?.district || 'ঢাকা',
            postalCode: d.address?.postalCode || '',
            emergencyName: d.emergencyContact?.name || '',
            emergencyPhone: d.emergencyContact?.phone || '',
            emergencyRelationship: d.emergencyContact?.relationship || 'পরিবার',
          });
        }
      } catch (err) {
        setErrorMsg(err.message || 'ড্রাইভার তথ্য লোড করতে ব্যর্থ হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, profileImage: compressedDataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      profileImage: formData.profileImage,
      dateOfBirth: formData.dateOfBirth || null,
      licenseNumber: formData.licenseNumber,
      licenseExpiryDate: formData.licenseExpiryDate || null,
      experienceYears: Number(formData.experienceYears) || 0,
      address: {
        street: formData.street,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
      },
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelationship,
      },
    };

    try {
      const res = await driverService.updateDriverMe(payload);
      if (res.success) {
        await refreshUser();
        navigate('/driver/dashboard', {
          state: { message: 'আপনার ড্রাইভার প্রোফাইল ও ছবি সফলভাবে আপডেট করা হয়েছে!' },
          replace: true,
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = getImageUrl(formData.profileImage) || formData.profileImage;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/driver/dashboard"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← ড্যাশবোর্ডে ফিরে যান
          </Link>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full uppercase">
            👨‍✈️ ড্রাইভার প্রোফাইল এডিটর
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">✏️ প্রোফাইল সম্পাদনা করুন (Edit Driver Profile)</h1>
            <p className="text-xs text-gray-500 mt-1">
              আপনার ড্রাইভারের ছবি, নাম, বিআরটিএ লাইসেন্স তথ্য ও যোগাযোগের সকল তথ্য আপডেট করুন।
            </p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <span>✅</span> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
              <p className="text-sm text-gray-600 mt-4 font-medium">প্রোফাইল তথ্য লোড হচ্ছে...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Section */}
              <div className="p-5 bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow">
                <div className="relative group flex-shrink-0">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-800 flex items-center justify-center shadow-lg">
                    {previewSrc ? (
                      <img src={previewSrc} alt="Driver Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👨‍✈️</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <h3 className="text-base font-bold text-emerald-300">🖼️ ড্রাইভারের ছবি পরিবর্তন</h3>
                  <p className="text-xs text-gray-300">
                    আপনার স্পষ্ট ও পেশাদার ছবি আপলোড করুন অথবা ডাইরেক্ট ইমেজের লিঙ্ক দিন।
                  </p>

                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleChange}
                      placeholder="অথবা ছবিURL দিন (যেমন: uploads/profiles/drivers/driver_01.jpg)"
                      className="w-full px-3 py-2 bg-slate-800 text-gray-100 border border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <span>👤</span> ব্যক্তিগত তথ্য
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">পূর্ণ নাম *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ফোন নম্বর *</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ইমেইল ঠিকানা</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">জন্ম তারিখ</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Driving & License Info */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <span>🆔</span> ড্রাইভিং লাইসেন্স ও অভিজ্ঞতা
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">লাইসেন্স নম্বর *</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">লাইসেন্স মেয়াদের তারিখ *</label>
                    <input
                      type="date"
                      name="licenseExpiryDate"
                      required
                      value={formData.licenseExpiryDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">অভিজ্ঞতা (বছরে) *</label>
                    <input
                      type="number"
                      name="experienceYears"
                      min="0"
                      required
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <span>📍</span> বর্তমান ঠিকানা
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">রাস্তা / বাসা / এলাকা</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="যেমন: ৪৫ মিরপুর রোড"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">শহর (City)</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">জেলা (District)</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <span>🚨</span> জরুরি যোগাযোগ (Emergency Contact)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">যোগাযোগকারীর নাম</label>
                    <input
                      type="text"
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleChange}
                      placeholder="যেমন: সালমা বেগম"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ফোন নম্বর</label>
                    <input
                      type="text"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      placeholder="যেমন: 01911-XXXXXX"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">সম্পর্ক (Relationship)</label>
                    <input
                      type="text"
                      name="emergencyRelationship"
                      value={formData.emergencyRelationship}
                      onChange={handleChange}
                      placeholder="যেমন: স্ত্রী / বাবা / ভাই"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>💾 প্রোফাইল সংরক্ষণ করুন</span>
                  )}
                </button>

                <Link
                  to="/driver/dashboard"
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 font-semibold text-sm rounded-2xl hover:bg-gray-200 transition"
                >
                  বাতিল করুন
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DriverEditProfile;

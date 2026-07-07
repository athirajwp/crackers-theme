import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

const Swal = window.Swal;

export default function AdminBranding() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSlots, setSavingSlots] = useState({});

  // Form parameters
  const [formData, setFormData] = useState({
    instagram_link: '', whatsapp_link: '', youtube_link: '', twitter_link: '', facebook_link: '',
    promo_code_1: '', promo_value_1: '',
    promo_code_2: '', promo_value_2: '',
    promo_code_3: '', promo_value_3: '',
    promo_code_4: '', promo_value_4: '',
    promo_code_5: '', promo_value_5: '',
    admin_theme: 'theme_1',
    terms_conditions: '', about_us: '',
    about_us_badge: '', about_us_title: '',
    license_name: '', license_no: '', store_map_iframe: '',
    marquee_alert_1: '', marquee_alert_2: '', marquee_alert_3: '',
    marquee_alert_4: '', marquee_alert_5: '', marquee_alert_6: '',
  });

  // Uploaded files
  const [images, setImages] = useState({
    store_logo: null,
    store_favicon: null,
    slider_image_1: null,
    slider_image_2: null,
    slider_image_3: null,
    aboutus_image_1: null,
    gallery_image_1: null,
    gallery_image_2: null,
    gallery_image_3: null,
    gallery_image_4: null,
    gallery_image_5: null,
    gallery_image_6: null,
    gallery_image_7: null,
    gallery_image_8: null,
    gallery_image_9: null,
    gallery_image_10: null,
  });

  // Paths returned by API
  const [imagePaths, setImagePaths] = useState({});

  const fetchBranding = () => {
    setLoading(true);
    fetch('/api/admin/branding')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.settings) {
          setFormData((prev) => ({
            ...prev,
            ...data.settings,
          }));
          const paths = {
            store_logo: data.settings.store_logo,
            store_favicon: data.settings.store_favicon,
            slider_image_1: data.settings.slider_image_1,
            slider_image_2: data.settings.slider_image_2,
            slider_image_3: data.settings.slider_image_3,
            aboutus_image_1: data.settings.aboutus_image_1,
          };
          for (let i = 1; i <= 10; i++) {
            paths[`gallery_image_${i}`] = data.settings[`gallery_image_${i}`];
          }
          setImagePaths(paths);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load branding settings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setImages((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const saveImageSlot = async (key) => {
    if (!images[key]) {
      Swal.fire({
        icon: 'warning',
        title: 'No file selected',
        text: 'Please select an image file first before saving.',
      });
      return;
    }

    setSavingSlots((prev) => ({ ...prev, [key]: true }));

    const postData = new FormData();
    postData.append(key, images[key]);

    try {
      const res = await fetch('/api/admin/branding/update', {
        method: 'POST',
        body: postData,
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Slot Saved!',
          text: 'Image has been uploaded successfully.',
          showConfirmButton: false,
          timer: 1500,
        });
        setImages((prev) => ({ ...prev, [key]: null }));
        fetchBranding();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: data.error || 'Failed to upload image.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred during upload.',
      });
    } finally {
      setSavingSlots((prev) => ({ ...prev, [key]: false }));
    }
  };

  const removeImageSlot = async (key) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the image in this slot.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    });

    if (!result.isConfirmed) return;

    setSavingSlots((prev) => ({ ...prev, [key]: true }));

    const postData = new FormData();
    postData.append('remove_image_key', key);

    try {
      const res = await fetch('/api/admin/branding/update', {
        method: 'POST',
        body: postData,
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Image slot has been cleared.',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchBranding();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to remove image.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while removing.',
      });
    } finally {
      setSavingSlots((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const postData = new FormData();
    Object.keys(formData).forEach((key) => {
      postData.append(key, formData[key] || '');
    });

    Object.keys(images).forEach((key) => {
      if (images[key]) {
        postData.append(key, images[key]);
      }
    });

    try {
      const res = await fetch('/api/admin/branding/update', {
        method: 'POST',
        body: postData,
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Branding Saved!',
          text: 'Branding customizations have been updated.',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchBranding();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: data.error || 'Failed to update branding options.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update branding config.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
          <p className="text-sm font-semibold text-slate-500">Loading custom themes & brandings...</p>
        </div>
      </AdminLayout>
    );
  }

  const themes = [
    { value: 'theme_1', label: 'Theme 1: Crimson / Gold' },
    { value: 'theme_2', label: 'Theme 2: Indigo / Amber' },
    { value: 'theme_3', label: 'Theme 3: Emerald / Orange' },
    { value: 'theme_4', label: 'Theme 4: Purple / Yellow' },
    { value: 'theme_5', label: 'Theme 5: Teal / Rose' },
    { value: 'theme_6', label: 'Theme 6: Cyan / Red' },
    { value: 'theme_7', label: 'Theme 7: Green / Amber' },
    { value: 'theme_8', label: 'Theme 8: Pink / Teal' },
    { value: 'theme_9', label: 'Theme 9: Slate / Amber' },
    { value: 'theme_10', label: 'Theme 10: Indigo / Orange' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 select-none text-slate-800 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Storefront Branding & Themes</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none font-semibold">
            Customize slider banners, alert lists, company summaries, and social media handles
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 text-xs font-semibold">
          
          {/* Active theme color selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Store Active Theme
            </h3>
            <div className="max-w-xs space-y-1.5">
              <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">
                Visual Styling Palette
              </label>
              <select
                name="admin_theme"
                value={formData.admin_theme}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all"
              >
                {themes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logo & Favicon Customization */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Store logo & favicon
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Store Logo */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">
                  Store Logo Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="store_logo"
                  onChange={handleFileChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none transition-all"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveImageSlot('store_logo')}
                    disabled={savingSlots.store_logo}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    {savingSlots.store_logo ? 'Saving...' : 'Save Logo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImageSlot('store_logo')}
                    disabled={!imagePaths.store_logo || savingSlots.store_logo}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    Remove
                  </button>
                </div>
                {imagePaths.store_logo && (
                  <div className="w-full h-24 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2">
                    <img
                      src={imagePaths.store_logo.startsWith('data:') || imagePaths.store_logo.startsWith('http') ? imagePaths.store_logo : `/${imagePaths.store_logo}`}
                      alt="Store Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                {!imagePaths.store_logo && (
                  <div className="w-full h-24 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold">
                    No Custom Logo (Displays default icon)
                  </div>
                )}
              </div>

              {/* Store Favicon */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">
                  Browser Favicon (.ico / .png)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="store_favicon"
                  onChange={handleFileChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none transition-all"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveImageSlot('store_favicon')}
                    disabled={savingSlots.store_favicon}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    {savingSlots.store_favicon ? 'Saving...' : 'Save Favicon'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImageSlot('store_favicon')}
                    disabled={!imagePaths.store_favicon || savingSlots.store_favicon}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    Remove
                  </button>
                </div>
                {imagePaths.store_favicon && (
                  <div className="w-full h-24 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2">
                    <img
                      src={imagePaths.store_favicon.startsWith('data:') || imagePaths.store_favicon.startsWith('http') ? imagePaths.store_favicon : `/${imagePaths.store_favicon}`}
                      alt="Store Favicon"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                )}
                {!imagePaths.store_favicon && (
                  <div className="w-full h-24 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold">
                    No Custom Favicon
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alert Scrollers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Scrolling Marquee Header Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Alert Bar Text #{idx}
                  </label>
                  <input
                    type="text"
                    name={`marquee_alert_${idx}`}
                    value={formData[`marquee_alert_${idx}`] || ''}
                    onChange={handleChange}
                    placeholder={`e.g. Alert text here`}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Banner Images */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Promotional Slides (Carousel Banners)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => {
                const key = `slider_image_${idx}`;
                return (
                  <div key={idx} className="space-y-3">
                    <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">
                      Promotion Banner #{idx}
                    </label>
                      <input
                        type="file"
                        accept="image/*"
                        name={key}
                        onChange={handleFileChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none transition-all"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveImageSlot(key)}
                          disabled={savingSlots[key]}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                        >
                          {savingSlots[key] ? 'Saving...' : 'Save Slot'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImageSlot(key)}
                          disabled={!imagePaths[key] || savingSlots[key]}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    {imagePaths[key] && (
                      <div className="w-full h-24 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                        <img
                          src={imagePaths[key].startsWith('data:') || imagePaths[key].startsWith('http') ? imagePaths[key] : `/${imagePaths[key]}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* About Us Gallery Images */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              About Us Gallery Images (Up to 10 Images)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                const key = `gallery_image_${idx}`;
                return (
                  <div key={idx} className="space-y-3">
                    <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">
                      Gallery Image #{idx}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      name={key}
                      onChange={handleFileChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-2.5 py-1 text-[11px] font-semibold outline-none transition-all"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => saveImageSlot(key)}
                        disabled={savingSlots[key]}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-bold py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all shadow-sm border border-emerald-700/10"
                      >
                        {savingSlots[key] ? 'Saving...' : 'Save Slot'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImageSlot(key)}
                        disabled={!imagePaths[key] || savingSlots[key]}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-bold py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all shadow-sm border border-rose-700/10"
                      >
                        Remove
                      </button>
                    </div>
                    {imagePaths[key] && (
                      <div className="w-full h-20 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                        <img
                          src={imagePaths[key].startsWith('data:') || imagePaths[key].startsWith('http') ? imagePaths[key] : `/${imagePaths[key]}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!imagePaths[key] && (
                      <div className="w-full h-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold">
                        Empty
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map & About text content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                About us & licenses
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Badge subtitle
                    </label>
                    <input
                      type="text"
                      name="about_us_badge"
                      value={formData.about_us_badge}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Heading Title
                    </label>
                    <input
                      type="text"
                      name="about_us_title"
                      value={formData.about_us_title}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Rich Text Biography
                  </label>
                  <textarea
                    rows="6"
                    name="about_us"
                    value={formData.about_us}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all resize-none font-mono"
                  />
                </div>

                {/* About Us Banner Image */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    About Us Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="aboutus_image_1"
                    onChange={handleFileChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none transition-all"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveImageSlot('aboutus_image_1')}
                      disabled={savingSlots.aboutus_image_1}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                    >
                      {savingSlots.aboutus_image_1 ? 'Saving...' : 'Save Slot'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImageSlot('aboutus_image_1')}
                      disabled={!imagePaths.aboutus_image_1 || savingSlots.aboutus_image_1}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                    >
                      Remove
                    </button>
                  </div>
                  {imagePaths.aboutus_image_1 && (
                    <div className="w-full h-28 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner mt-1.5">
                      <img
                        src={imagePaths.aboutus_image_1.startsWith('data:') || imagePaths.aboutus_image_1.startsWith('http') ? imagePaths.aboutus_image_1 : `/${imagePaths.aboutus_image_1}`}
                        alt="About Us Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!imagePaths.aboutus_image_1 && (
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">
                      No image uploaded — default placeholder will be used.
                    </p>
                  )}
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      License holder
                    </label>
                    <input
                      type="text"
                      name="license_name"
                      value={formData.license_name || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="license_no"
                      value={formData.license_no || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Terms & Conditions & Location Map
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Terms & Booking Guidelines
                  </label>
                  <textarea
                    rows="6"
                    name="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all resize-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    Google Maps embed iframe link
                  </label>
                  <input
                    type="text"
                    name="store_map_iframe"
                    value={formData.store_map_iframe}
                    onChange={handleChange}
                    placeholder="e.g. https://google.com/maps/embed/..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social links handles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Social Media Coordinate channels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {['whatsapp', 'youtube', 'instagram', 'facebook', 'twitter'].map((channel) => {
                const key = `${channel}_link`;
                return (
                  <div key={channel} className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                      <i className={`fa-brands fa-${channel === 'twitter' ? 'x-twitter' : channel} text-slate-450`}></i>
                      <span>{channel} Link</span>
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleChange}
                      placeholder={`https://${channel}.com/...`}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-crimson-400 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all placeholder-slate-400"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end select-none">
            <button
              type="submit"
              disabled={saving}
              className="bg-crimson-600 hover:bg-crimson-500 text-white font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md shadow-crimson-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : 'Save Branding & Customizations'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

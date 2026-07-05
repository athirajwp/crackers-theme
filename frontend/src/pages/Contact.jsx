import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Contact() {
  const { settings } = useStore();

  return (
    <div className="relative text-slate-800 select-none bg-slate-50/50 pb-16">
      {/* 1. Dark Hero Page Banner with Breadcrumb */}
      <section className="relative bg-crimson-600 py-16 border-b border-crimson-700 shadow-inner">
        <div className="container mx-auto px-4 text-center space-y-3 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Contact Us
          </h2>
          <div className="flex justify-center items-center gap-2 text-xs font-extrabold text-slate-350 uppercase tracking-widest">
            <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <i className="fa-solid fa-chevron-right text-[8px] text-slate-450"></i>
            <span className="text-gold-500">Contact</span>
          </div>
        </div>
      </section>

      {/* 2. Main Content Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-10">

          {/* Section Title */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-gold-50 border border-gold-200 text-gold-800 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
              <i className="fa-solid fa-envelope text-gold-600"></i> Get In Touch
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              How to Contact Us
            </h3>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              Have questions about our products, pricing, or delivery? We'd love to hear from you. Reach out to us through any of the channels below.
            </p>
          </div>

          {/* Two-Column: Contact Info + Google Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* Left Column: Contact Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <i className="fa-solid fa-location-dot text-lg text-crimson-600"></i>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Our Address</h4>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                    {settings.store_address || 'Virudhunagar to Sivakasi Main Road, Sivakasi, Tamil Nadu - 626189'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <i className="fa-solid fa-phone text-lg text-crimson-600"></i>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Phone Numbers</h4>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                    <a href={`tel:${settings.store_phone}`} className="hover:text-gold-600 transition-colors block">
                      {settings.store_phone || '+91 9998887776'}
                    </a>
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <i className="fa-brands fa-whatsapp text-lg text-white"></i>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">WhatsApp Booking</h4>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                    <a
                      href={`https://wa.me/${settings.store_whatsapp || '919998887776'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-emerald-600 transition-colors"
                    >
                      +{settings.store_whatsapp || '91 9998887776'}
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <i className="fa-solid fa-envelope text-lg text-crimson-600"></i>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Email Address</h4>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                    <a href={`mailto:${settings.store_email}`} className="hover:text-gold-600 transition-colors">
                      {settings.store_email || 'crackershop@gmail.com'}
                    </a>
                  </p>
                </div>
              </div>

              {/* License Info */}
              {(settings.license_name || settings.license_no) && (
                <div className="border-t border-slate-200 pt-5 mt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <i className="fa-solid fa-scale-balanced text-lg text-crimson-600"></i>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">License Details</h4>
                      {settings.license_name && (
                        <p className="text-xs text-slate-500 font-semibold">
                          Name: <strong className="text-slate-800 font-black">{settings.license_name}</strong>
                        </p>
                      )}
                      {settings.license_no && (
                        <p className="text-xs text-slate-500 font-semibold">
                          No: <strong className="text-slate-800 font-black font-mono">{settings.license_no}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Embedded Google Map */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[350px]">
              {settings.store_map_iframe ? (
                <div dangerouslySetInnerHTML={{ __html: settings.store_map_iframe }} className="w-full h-full min-h-[350px] [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[350px]" />
              ) : (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31484.78768782782!2d77.78440079999999!3d9.4475475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cee41fe51a8d%3A0xe964a2754897f1f!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1717830000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '350px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location Map"
                ></iframe>
              )}
            </div>
          </div>

          {/* Bottom: Working Hours & Quick CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center mb-4 text-crimson-600">
                <i className="fa-solid fa-clock text-sm"></i>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Working Hours</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Monday – Saturday: 9:00 AM to 8:00 PM<br />
                Sunday: 10:00 AM to 6:00 PM
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center mb-4 text-crimson-600">
                <i className="fa-solid fa-truck-fast text-sm"></i>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Delivery Area</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                We deliver across Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, and Telangana via trusted lorry transport.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center mb-4 text-crimson-600">
                <i className="fa-solid fa-shield-halved text-sm"></i>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Safe & Legal</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                All products are PESO certified and comply with Supreme Court guidelines for safe and legal fireworks.
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          {(settings.facebook_link || settings.instagram_link || settings.youtube_link || settings.whatsapp_link || settings.twitter_link) && (
            <div className="border-t border-slate-100 pt-8 space-y-5">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black text-crimson-600 uppercase tracking-widest">Follow Us</span>
                <h4 className="text-sm font-black text-slate-800 tracking-tight">Connect on Social Media</h4>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {settings.facebook_link && (
                  <a
                    href={settings.facebook_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#1877F2] hover:bg-[#1565d8] text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <i className="fa-brands fa-facebook text-base"></i>
                    <span>Facebook</span>
                  </a>
                )}
                {settings.instagram_link && (
                  <a
                    href={settings.instagram_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <i className="fa-brands fa-instagram text-base"></i>
                    <span>Instagram</span>
                  </a>
                )}
                {settings.youtube_link && (
                  <a
                    href={settings.youtube_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <i className="fa-brands fa-youtube text-base"></i>
                    <span>YouTube</span>
                  </a>
                )}
                {settings.whatsapp_link && (
                  <a
                    href={settings.whatsapp_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <i className="fa-brands fa-whatsapp text-base"></i>
                    <span>WhatsApp</span>
                  </a>
                )}
                {settings.twitter_link && (
                  <a
                    href={settings.twitter_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <i className="fa-brands fa-x-twitter text-base"></i>
                    <span>X / Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

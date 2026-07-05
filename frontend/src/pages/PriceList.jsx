import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function PriceList() {
  const { categories, settings, loading } = useStore();

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  // Inject html2pdf script dynamically if not present
  useEffect(() => {
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const downloadPDF = () => {
    if (!window.html2pdf) {
      window.Swal.fire({
        title: 'Loading PDF Compiler...',
        text: 'The PDF compilation engine is loading, please try again in a moment.',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // Display premium SweetAlert compilator loader
    window.Swal.fire({
      title: 'Generating PDF...',
      text: 'Compiling wholesale registry sheets, please wait...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        window.Swal.showLoading();
      },
    });

    const element = document.getElementById('price-list-document');
    const cleanStoreName = (settings.store_name || 'Cracker_Demo')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

    const opt = {
      margin: [0.4, 0.3, 0.4, 0.3],
      filename: `${cleanStoreName}_wholesale_price_list.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        window.Swal.fire({
          title: 'Compilation Complete!',
          text: 'Wholesale Price List downloaded successfully.',
          icon: 'success',
          confirmButtonColor: '#e51d1d',
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error('PDF Compilation Error:', err);
        window.Swal.fire({
          title: 'Generation Failed!',
          text: 'Unable to compile PDF client-side. Please use the Print List option.',
          icon: 'error',
          confirmButtonColor: '#e51d1d',
        });
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <i className="fa-solid fa-spinner animate-spin text-3xl text-crimson-600"></i>
        <p className="text-sm font-semibold text-slate-500">Loading price list...</p>
      </div>
    );
  }

  let sno = 1;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 select-none">
      {/* Header control bar (Hidden during print) */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-8 gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-list-check text-crimson-600"></i> Wholesale Price List
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Official Price Registry - Flat {settings.discount_percent}% Discount Applied
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Download PDF button */}
          <button
            onClick={downloadPDF}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-crimson-50 border border-crimson-200 hover:bg-crimson-100 text-crimson-750 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <i className="fa-solid fa-file-pdf text-crimson-650"></i> Download PDF
          </button>
          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 hover:border-slate-355 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <i className="fa-solid fa-print text-slate-500"></i> Print List
          </button>
          {/* Order Now button */}
          <Link
            to="/"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-crimson-600 to-crimson-500 hover:from-crimson-700 hover:to-crimson-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow transition-all hover:scale-105 active:scale-95 text-center"
          >
            <i className="fa-solid fa-basket-shopping"></i> Order Online Now
          </Link>
        </div>
      </div>

      {/* Official Printable Invoice/Price Registry Document */}
      <div
        id="price-list-document"
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden print:border-0 print:shadow-none print:p-0"
      >
        {/* Header Branding (Visible on Print and Screen) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-crimson-700 uppercase leading-none">
              {settings.store_name}
            </h1>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase font-bold mt-1.5">
              Premium Sivakasi Fireworks Wholesale Price List
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold space-y-1">
            <div>
              <i className="fa-solid fa-phone text-crimson-600 mr-1.5 text-[10px]"></i>
              <strong>Phone:</strong> {settings.store_phone}
            </div>
            <div>
              <i className="fa-solid fa-envelope text-crimson-600 mr-1.5 text-[10px]"></i>
              <strong>Email:</strong> {settings.store_email}
            </div>
            <div>
              <i className="fa-solid fa-map-marker-alt text-crimson-600 mr-1.5 text-[10px]"></i>
              <strong>Address:</strong> {settings.store_address}
            </div>
          </div>
        </div>

        {/* Table Registry Container */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner print:border-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 font-extrabold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-3 sm:px-4 w-12 text-center">S.No</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4 w-32 text-center">Pack / Box size</th>
                <th className="py-3 px-4 w-24 text-right">MRP (₹)</th>
                <th className="py-3 px-4 w-24 text-right">Discount ({settings.discount_percent}% Off)</th>
                <th className="py-3 px-4 w-28 text-right pr-6 font-bold">Net Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-semibold text-slate-600">
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-100/60 font-black text-slate-700 text-[10px] uppercase tracking-wider border-y border-slate-200">
                    <td colSpan={6} className="py-3.5 px-4">
                      <i className="fa-solid fa-circle-chevron-right text-crimson-600 mr-2 text-[9px]"></i>
                      {category.name}
                    </td>
                  </tr>

                  {/* Product Rows */}
                  {category.products.map((product) => {
                    const currentSno = sno++;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-400">
                          {currentSno}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{product.name}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500 font-bold">
                          {product.pack_size}
                        </td>
                        <td className="py-3 px-4 text-right line-through text-slate-400 font-mono">
                          ₹{formatCurrency(product.mrp)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-mono">
                          ₹{formatCurrency(product.mrp * (settings.discount_percent / 100))}
                        </td>
                        <td className="py-3 px-4 text-right pr-6 font-extrabold text-crimson-600 font-mono">
                          ₹{formatCurrency(product.selling_price)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

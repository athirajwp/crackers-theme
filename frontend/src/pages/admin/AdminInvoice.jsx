import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function AdminInvoice() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load invoice:', err);
        setLoading(false);
      });
  }, [id]);

  const formatCurrency = (val) => {
    return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white space-y-4">
        <i className="fa-solid fa-spinner animate-spin text-3xl text-slate-900"></i>
        <p className="text-sm font-semibold text-slate-500">Preparing invoice print template...</p>
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="text-center py-20 bg-white">
        <h2 className="text-xl font-bold text-rose-600">Invoice Not Found!</h2>
      </div>
    );
  }

  const { order, settings = {
    store_name: 'Cracker Demo',
    store_address: 'Virudhunagar to Sivakasi Main Road, Sivakasi.',
    store_phone: '+91 7010619528',
    store_email: 'crackerdemo@gmail.com'
  } } = data;

  const printStyles = `
    body {
      font-family: 'Courier New', Courier, monospace, Arial, sans-serif;
      background: #ffffff;
      color: #000000;
      margin: 0;
      padding: 30px;
      font-size: 12px;
      line-height: 1.4;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000000;
      padding: 20px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px double #000000;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .header-brand {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .header-details {
      text-align: right;
      font-size: 11px;
    }
    .info-table {
      width: 100%;
      margin-bottom: 20px;
    }
    .info-col {
      width: 50%;
      vertical-align: top;
    }
    .info-title {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      border-bottom: 1px solid #000000;
      margin-bottom: 5px;
      padding-bottom: 2px;
      width: 90%;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th {
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
      text-align: left;
      padding: 8px 4px;
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
    }
    .items-table td {
      padding: 6px 4px;
      border-bottom: 1px dashed #cccccc;
    }
    .items-table tr.total-row td {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      font-weight: bold;
      font-size: 12px;
    }
    .text-right {
      text-align: right !important;
    }
    .text-center {
      text-align: center !important;
    }
    .footer-note {
      border-top: 1px solid #000000;
      padding-top: 15px;
      font-size: 10px;
      line-height: 1.5;
      color: #444444;
    }
    .sign-row {
      margin-top: 50px;
      margin-bottom: 20px;
      width: 100%;
    }
    .sign-col {
      width: 50%;
      vertical-align: bottom;
      font-size: 11px;
    }
    @media print {
      body {
        padding: 0;
      }
      .invoice-container {
        border: none;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      <div className="invoice-container">
        {/* Header */}
        <table className="header-table">
          <tbody>
            <tr>
              <td>
                <div className="header-brand">{settings.store_name?.toUpperCase()}</div>
                <div style={{ fontSize: '10px', marginTop: '3px' }}>
                  {settings.store_address}<br />
                  Phone: {settings.store_phone} | Email: {settings.store_email}
                </div>
              </td>
              <td className="header-details">
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ESTIMATE INVOICE</div>
                <div style={{ marginTop: '5px' }}>
                  <strong>Invoice No:</strong> {order.order_number}<br />
                  <strong>Date:</strong> {new Date(order.created_at).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}<br />
                  <strong>Status:</strong> {order.order_status?.toUpperCase()}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Customer Billing information */}
        <table className="info-table">
          <tbody>
            <tr>
              <td className="info-col">
                <div className="info-title">Deliver To</div>
                <strong>{order.name}</strong><br />
                {order.address}<br />
                {order.landmark && <>Landmark: {order.landmark}<br /></>}
                {order.city}, {order.state} - {order.pincode}<br />
                Phone: {order.phone}
              </td>
              <td className="info-col" style={{ paddingLeft: '20px' }}>
                <div className="info-title">Booking Details</div>
                <strong>Payment Mode:</strong> Offline Payment<br />
                <strong>Payment Status:</strong> {order.payment_status?.toUpperCase()}<br />
                {order.transport_name && <><strong>Transport Lorry:</strong> {order.transport_name}<br /></>}
                {order.lr_number && <><strong>LR Number:</strong> {order.lr_number}<br /></>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Invoice Ordered items */}
        <table className="items-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Description</th>
              <th className="text-center">Qty</th>
              <th className="text-center">Pack</th>
              <th className="text-right">Price (INR)</th>
              <th className="text-right">Total (INR)</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ width: '5%' }}>{idx + 1}</td>
                <td style={{ width: '45%' }}>{item.product_name}</td>
                <td className="text-center" style={{ width: '8%' }}>{item.quantity}</td>
                <td className="text-center" style={{ width: '15%' }}>{item.pack_size}</td>
                <td className="text-right" style={{ width: '12%' }}>{formatCurrency(item.price)}</td>
                <td className="text-right" style={{ width: '15%' }}>{formatCurrency(item.total_price)}</td>
              </tr>
            ))}

            {/* Totals rows */}
            <tr className="total-row">
              <td colSpan="4" style={{ border: 'none' }}></td>
              <td className="text-right" style={{ paddingTop: '15px' }}>Net Paid:</td>
              <td className="text-right" style={{ paddingTop: '15px' }}>₹{formatCurrency(order.net_amount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Direct payment instructions */}
        <div style={{ fontSize: '10px', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #dddddd' }}>
          <strong>Instructions:</strong> Please contact support via WhatsApp to confirm the offline payment options and coordinate delivery logistics.
        </div>

        {/* Signature Lines */}
        <table className="sign-row">
          <tbody>
            <tr>
              <td className="sign-col">Customer Signature</td>
              <td className="sign-col text-right">
                For <strong>{settings.store_name}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Print triggers */}
      <div className="no-print" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => window.print()}
          style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#000000', color: '#ffffff', cursor: 'pointer', border: 'none' }}
        >
          PRINT INVOICE RECEIPT
        </button>
      </div>
    </>
  );
}

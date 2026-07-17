<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $order->order_number }}</title>
    <style>
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
    </style>
</head>
<body>

    <!-- Printable container -->
    <div class="invoice-container">
        
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td>
                    <div class="header-brand">{{ strtoupper(App\Models\Setting::get('store_name', 'Cracker Demo')) }}</div>
                    <div style="font-size: 10px; margin-top: 3px;">
                        {{ App\Models\Setting::get('store_address', 'Virudhunagar to Sivakasi Main Road, Sivakasi') }}<br>
                        Phone: {{ App\Models\Setting::get('store_phone', '+91 9998887776') }} | Email: {{ App\Models\Setting::get('store_email', 'store@example.com') }}
                    </div>
                </td>
                <td class="header-details">
                    <div style="font-size: 14px; font-weight: bold;">ESTIMATE INVOICE</div>
                    <div style="margin-top: 5px;">
                        <strong>Invoice No:</strong> {{ $order->order_number }}<br>
                        <strong>Date:</strong> {{ $order->created_at->format('d/m/Y h:i A') }}<br>
                        <strong>Status:</strong> {{ strtoupper($order->order_status) }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Customer Billing information -->
        <table class="info-table">
            <tr>
                <td class="info-col">
                    <div class="info-title">Deliver To</div>
                    <strong>{{ $order->name }}</strong><br>
                    {{ $order->address }}<br>
                    @if($order->landmark)
                        Landmark: {{ $order->landmark }}<br>
                    @endif
                    {{ $order->city }}, {{ $order->state }} - {{ $order->pincode }}<br>
                    Phone: {{ $order->phone }}
                </td>
                <td class="info-col" style="padding-left: 20px;">
                    <div class="info-title">Booking Details</div>
                    <strong>Payment Mode:</strong> Offline Payment<br>
                    <strong>Payment Status:</strong> {{ strtoupper($order->payment_status) }}<br>
                    @if($order->transport_name)
                        <strong>Transport Lorry:</strong> {{ $order->transport_name }}<br>
                    @endif
                    @if($order->lr_number)
                        <strong>LR Number:</strong> {{ $order->lr_number }}<br>
                    @endif
                </td>
            </tr>
        </table>

        <!-- Invoice Ordered items -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Product Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-center">Pack</th>
                    <th class="text-right">Price (INR)</th>
                    <th class="text-right">Total (INR)</th>
                </tr>
            </thead>
            <tbody>
                @php $sno = 1; @endphp
                @foreach($order->items as $item)
                <tr>
                    <td style="width: 5%;">{{ $sno++ }}</td>
                    <td style="width: 45%;">{{ $item->product_name }}</td>
                    <td class="text-center" style="width: 8%;">{{ $item->quantity }}</td>
                    <td class="text-center" style="width: 15%;">{{ $item->pack_size }}</td>
                    <td class="text-right" style="width: 12%;">{{ number_format($item->price, 2) }}</td>
                    <td class="text-right" style="width: 15%;">{{ number_format($item->total_price, 2) }}</td>
                </tr>
                @endforeach

                <!-- Totals rows -->
                <tr class="total-row">
                    <td colspan="4" style="border: none;"></td>
                    <td class="text-right" style="padding-top: 15px;">Net Paid:</td>
                    <td class="text-right" style="padding-top: 15px;">₹{{ number_format($order->net_amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Direct payment instructions & footer details -->
        <div style="font-size: 10px; margin-bottom: 20px; background: #f9f9f9; padding: 10px; border: 1px solid #dddddd;">
            <strong>Instructions:</strong> Please contact support via WhatsApp to confirm the offline payment options and coordinate delivery logistics.
        </div>


        <!-- Signature Lines -->
        <table class="sign-row">
            <tr>
                <td class="sign-col">
                    Customer Signature
                </td>
                <td class="sign-col text-right">
                    For <strong>{{ App\Models\Setting::get('store_name', 'Cracker Demo') }}</strong>
                </td>
            </tr>
        </table>

    </div>

    <!-- Print triggers -->
    <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; font-weight: bold; background: #000000; color: #ffffff; cursor: pointer; border: none;">PRINT INVOICE RECEIPT</button>
    </div>

</body>
</html>

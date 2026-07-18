<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'landmark' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'pincode' => 'nullable|string|max:10',
            'items' => 'required|array',
            'items.*.id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:0',
            'notes' => 'nullable|string',
            'promo_code' => 'nullable|string|max:50',
        ]);

        $cartItems = $request->input('items');
        $subtotal = 0; // MRP sum
        $netAmount = 0; // selling price sum
        $validatedItems = [];

        // Fetch products and calculate totals safely
        foreach ($cartItems as $item) {
            $qty = (int) $item['qty'];
            if ($qty <= 0) {
                continue;
            }

            $product = Product::find($item['id']);
            if (!$product) {
                return response()->json(['error' => 'Product not found!'], 422);
            }

            $itemSubtotal = $product->mrp * $qty;
            $itemNet = $product->selling_price * $qty;

            $subtotal += $itemSubtotal;
            $netAmount += $itemNet;

            $validatedItems[] = [
                'product' => $product,
                'qty' => $qty,
                'price' => $product->selling_price,
                'total_price' => $itemNet,
            ];
        }

        if (empty($validatedItems)) {
            return response()->json(['error' => 'Your cart is empty!'], 422);
        }

        // Fetch feature flags config
        $enableMinOrder = Setting::get('enable_min_order', 'yes') === 'yes';
        $enablePromoCodes = Setting::get('enable_promo_codes', 'yes') === 'yes';
        $enableTaxDelivery = Setting::get('enable_tax_delivery', 'no') === 'yes';
        $taxPercent = (float) Setting::get('tax_percent', 18);
        $deliveryCharge = (float) Setting::get('delivery_charge', 150);

        // Validate Minimum Purchase (Must qualify based on original net total before promo discount is evaluated)
        if ($enableMinOrder) {
            $minOrder = Setting::get('min_order_value', 3800);
            if ($netAmount < $minOrder) {
                return response()->json([
                    'error' => "Minimum order value is ₹{$minOrder}. Your current order is ₹{$netAmount}. Please add more items."
                ], 422);
            }
        }

        // Backend Promo Code validation & calculation (only if enabled)
        $promoDiscount = 0;
        $appliedPromo = null;

        if ($enablePromoCodes && $request->filled('promo_code')) {
            $submittedCode = strtoupper(trim($request->input('promo_code')));
            for ($i = 1; $i <= 5; $i++) {
                $codeSetting = strtoupper(trim(Setting::get("promo_code_{$i}", '')));
                if (!empty($codeSetting) && $codeSetting === $submittedCode) {
                    $valueSetting = trim(Setting::get("promo_value_{$i}", ''));
                    $appliedPromo = $codeSetting;
                    
                    if (str_contains($valueSetting, '%')) {
                        $percentage = (float) str_replace('%', '', $valueSetting);
                        if ($percentage > 0) {
                            $promoDiscount = ($netAmount * $percentage) / 100;
                        }
                    } else {
                        $flat = (float) $valueSetting;
                        if ($flat > 0) {
                            $promoDiscount = min($flat, $netAmount);
                        }
                    }
                    break;
                }
            }
        }

        $originalNet = $netAmount;
        $postPromoNet = max(0, $originalNet - $promoDiscount);

        // Calculate tax and delivery
        $taxAmount = 0;
        $deliveryChargeVal = 0;
        if ($enableTaxDelivery) {
            $taxAmount = $postPromoNet * ($taxPercent / 100);
            $deliveryChargeVal = $deliveryCharge;
        }

        $finalNet = $postPromoNet + $taxAmount + $deliveryChargeVal;
        $discountAmount = ($subtotal - $originalNet) + $promoDiscount;

        $notes = $request->notes;
        if ($appliedPromo) {
            $notes = trim(($notes ? $notes . "\n" : "") . "[Applied Promo Code: {$appliedPromo} (Saved ₹" . number_format($promoDiscount, 2) . " extra discount)]");
        }
        if ($enableTaxDelivery) {
            $notes = trim(($notes ? $notes . "\n" : "") . "[Pricing Breakdown:\n- Net Amount: ₹" . number_format($postPromoNet, 2) . "\n- GST / Tax (" . $taxPercent . "%): ₹" . number_format($taxAmount, 2) . "\n- Delivery Fee: ₹" . number_format($deliveryChargeVal, 2) . "]");
        }

        try {
            DB::beginTransaction();

            $order = Order::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'whatsapp' => $request->whatsapp ?? $request->phone,
                'email' => $request->email,
                'address' => $request->address ?? '',
                'landmark' => $request->landmark ?? '',
                'city' => $request->city ?? '',
                'state' => $request->state ?? '',
                'pincode' => $request->pincode ?? '',
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'net_amount' => $finalNet,
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'notes' => $notes,
            ]);

            foreach ($validatedItems as $vItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $vItem['product']->id,
                    'product_name' => $vItem['product']->name,
                    'pack_size' => $vItem['product']->pack_size,
                    'price' => $vItem['price'],
                    'quantity' => $vItem['qty'],
                    'total_price' => $vItem['total_price'],
                ]);
            }

            DB::commit();

            // Send order invoice email to admin and customer in the background
            try {
                $orderId = $order->id;
                $tenantDb = config('database.connections.' . config('database.default') . '.database');
                
                $artisanPath = base_path('artisan');
                $phpPath = (new \Symfony\Component\Process\PhpExecutableFinder())->find(false);
                
                if (empty($phpPath) || str_contains($phpPath, 'cgi') || str_contains($phpPath, 'fpm') || str_contains($phpPath, 'apache')) {
                    $phpPath = 'php';
                }

                if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
                    $cmd = 'start /B "" ' . escapeshellarg($phpPath) . ' ' . escapeshellarg($artisanPath) . ' order:send-email ' . escapeshellarg($orderId) . ' --tenant-db=' . escapeshellarg($tenantDb);
                    pclose(popen($cmd, 'r'));
                } else {
                    $logPath = storage_path('logs/email_background.log');
                    $cmd = escapeshellarg($phpPath) . ' ' . escapeshellarg($artisanPath) . ' order:send-email ' . escapeshellarg($orderId) . ' --tenant-db=' . escapeshellarg($tenantDb) . ' > ' . escapeshellarg($logPath) . ' 2>&1 &';
                    exec($cmd);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send order email in background: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'redirect' => route('checkout.success', ['order_number' => $order->order_number])
            ]);

        } catch (\Exception $exception) {
            DB::rollBack();
            Log::error('Order placement failed: ' . $exception->getMessage());
            return response()->json(['error' => 'Something went wrong! Please try again.'], 500);
        }
    }

    /**
     * Show checkout success page with payment information.
     */
    public function success($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with('items')->firstOrFail();

        // Load payment details
        $upiId = Setting::get('store_upi', 'aathishacrackers@okaxis');
        $storeName = Setting::get('store_name', 'Cracker Demo');
        
        // Build raw UPI pay link for QR generation:
        // upi://pay?pa=address@bank&pn=Payee%20Name&am=Amount&cu=INR
        $encodedStoreName = urlencode($storeName);
        $upiPayUrl = "upi://pay?pa={$upiId}&pn={$encodedStoreName}&am={$order->net_amount}&cu=INR";
        
        // Check if custom uploaded UPI QR code exists, otherwise generate dynamically
        $customQr = Setting::get('store_upi_qr', '');
        if (!empty($customQr) && file_exists(public_path($customQr))) {
            $qrCodeUrl = '/' . $customQr;
        } else {
            $qrCodeUrl = "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=" . urlencode($upiPayUrl) . "&choe=UTF-8";
        }

        $bankDetails = [
            'name' => Setting::get('bank_name', 'State Bank of India'),
            'acc_no' => Setting::get('bank_acc_no', '1234567890'),
            'ifsc' => Setting::get('bank_ifsc', 'SBIN0000123'),
            'holder' => Setting::get('bank_holder', 'Cracker Demo'),
        ];

        $whatsappNum = Setting::get('store_whatsapp', '919998887776');

        // Formulate pre-filled WhatsApp verification text
        $waMessage = "Hello " . $storeName . ", I have placed an order!\n\n"
                   . "*Order Number:* {$order->order_number}\n"
                   . "*Customer Name:* {$order->name}\n"
                   . "*Total Amount:* ₹" . number_format($order->net_amount, 2) . "\n\n"
                   . "Please confirm my booking and coordinate delivery details.";
        
        $whatsappUrl = "https://api.whatsapp.com/send?phone={$whatsappNum}&text=" . urlencode($waMessage);

        // Build the pre-filled invoice message for customer's WhatsApp
        $waMessageCustomer = "Hello *" . $order->name . "*,\n\n"
                           . "Here is the invoice summary for your order at *" . $storeName . "*:\n\n"
                           . "*Order Number:* " . $order->order_number . "\n"
                           . "*Order Date:* " . $order->created_at->format('d M Y, h:i A') . "\n"
                           . "*Net Amount:* ₹" . number_format($order->net_amount, 2) . "\n"
                           . "*Order Status:* " . ucfirst($order->order_status) . "\n"
                           . "*Payment Status:* " . ucfirst($order->payment_status) . "\n\n"
                           . "*Order Items Summary:*\n";
        
        foreach($order->items as $item) {
            $waMessageCustomer .= "• " . $item->product_name . " (Qty: " . $item->quantity . ") - ₹" . number_format($item->total_price, 2) . "\n";
        }
        
        $waMessageCustomer .= "\nTrack your order here: " . route('track.index', ['query' => $order->order_number]) . "\n\n"
                            . "Thank you for booking with us!";
        
        $customerPhone = preg_replace('/[^0-9]/', '', $order->whatsapp ?: $order->phone);
        if (strlen($customerPhone) === 10) {
            $customerPhone = '91' . $customerPhone;
        }
        $customerWhatsappUrl = "https://api.whatsapp.com/send?phone=" . $customerPhone . "&text=" . urlencode($waMessageCustomer);

        return view('checkout_success', compact('order', 'qrCodeUrl', 'bankDetails', 'whatsappUrl', 'whatsappNum', 'customerWhatsappUrl'));
    }
}

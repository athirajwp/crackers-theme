<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Setting;
use App\Models\Order;
use Illuminate\Http\Request;

class StorefrontApiController extends Controller
{
    /**
     * Get categories, active products, and store settings.
     */
    public function index()
    {
        $categories = Category::active()
            ->with(['products' => function ($query) {
                $query->active()->orderBy('name', 'asc');
            }])
            ->orderBy('sort_order', 'asc')
            ->get();

        $settings = [
            'store_name' => Setting::get('store_name', 'Cracker Demo'),
            'store_logo' => Setting::get('store_logo', ''),
            'store_favicon' => Setting::get('store_favicon', ''),
            'min_order_value' => Setting::get('min_order_value', 3800),
            'discount_percent' => Setting::get('discount_percent', 60),
            'store_whatsapp' => Setting::get('store_whatsapp', '919998887776'),
            'store_phone' => Setting::get('store_phone', '+91 9998887776'),
            'store_email' => Setting::get('store_email', 'crackerdemo@gmail.com'),
            'store_address' => Setting::get('store_address', 'Virudhunagar to Sivakasi Main Road, Sivakasi'),
            
            // Feature configurations
            'enable_min_order' => Setting::get('enable_min_order', 'yes'),
            'enable_promo_codes' => Setting::get('enable_promo_codes', 'yes'),
            'enable_tax_delivery' => Setting::get('enable_tax_delivery', 'no'),
            'enable_fireworks' => Setting::get('enable_fireworks', 'yes'),
            'tax_percent' => Setting::get('tax_percent', 18),
            'delivery_charge' => Setting::get('delivery_charge', 150),

            // Promo codes
            'promo_code_1' => Setting::get('promo_code_1', ''),
            'promo_value_1' => Setting::get('promo_value_1', ''),
            'promo_code_2' => Setting::get('promo_code_2', ''),
            'promo_value_2' => Setting::get('promo_value_2', ''),
            'promo_code_3' => Setting::get('promo_code_3', ''),
            'promo_value_3' => Setting::get('promo_value_3', ''),
            'promo_code_4' => Setting::get('promo_code_4', ''),
            'promo_value_4' => Setting::get('promo_value_4', ''),
            'promo_code_5' => Setting::get('promo_code_5', ''),
            'promo_value_5' => Setting::get('promo_value_5', ''),

            // Image slider / brandings
            'slider_image_1' => Setting::get('slider_image_1', ''),
            'slider_image_2' => Setting::get('slider_image_2', ''),
            'slider_image_3' => Setting::get('slider_image_3', ''),

            // Marquee alerts
            'marquee_alert_1' => Setting::get('marquee_alert_1', 'Special Offer: 60% Discount on all items!'),
            'marquee_alert_2' => Setting::get('marquee_alert_2', 'Free Delivery on orders above Rs. 5000!'),
            'marquee_alert_3' => Setting::get('marquee_alert_3', 'Celebrate Diwali / Festivals with Flat <strong>60% Discount</strong>!'),
            'marquee_alert_4' => Setting::get('marquee_alert_4', 'Express Lorry Transport Delivery Across Kerala, Karnataka, Tamilnadu, Andhra & Telangana!'),
            'marquee_alert_5' => Setting::get('marquee_alert_5', 'For Enquiries, Contact Support: <strong>8682942042</strong>'),
            'marquee_alert_6' => Setting::get('marquee_alert_6', '100% Quality & Safe Sivakasi Manufactured Crackers'),

            // Map and Compliance
            'store_map_iframe' => Setting::get('store_map_iframe', ''),
            'license_name' => Setting::get('license_name', 'Jallikattu Crackers'),
            'license_no' => Setting::get('license_no', '123/ABCD/2024'),
            'terms_conditions' => Setting::get('terms_conditions', ''),

            // About Us Customizations
            'about_us' => Setting::get('about_us', "We deliver high quality crackers.\nSafety is our top priority."),
            'about_us_badge' => Setting::get('about_us_badge', 'Sivakasi Pioneers'),
            'about_us_title' => Setting::get('about_us_title', 'Bringing Joy Since 1999'),
            'aboutus_image_1' => Setting::get('aboutus_image_1', ''),

            // Social Media Links
            'facebook_link' => Setting::get('facebook_link', ''),
            'instagram_link' => Setting::get('instagram_link', ''),
            'youtube_link' => Setting::get('youtube_link', ''),
            'whatsapp_link' => Setting::get('whatsapp_link', ''),
            'twitter_link' => Setting::get('twitter_link', ''),
        ];

        for ($i = 1; $i <= 10; $i++) {
            $settings["gallery_image_{$i}"] = Setting::get("gallery_image_{$i}", '');
        }

        return response()->json([
            'categories' => $categories,
            'settings' => $settings,
        ]);
    }

    /**
     * Search orders.
     */
    public function track(Request $request)
    {
        $request->validate([
            'search_query' => 'required|string|max:255',
        ]);

        $query = $request->input('search_query');

        $orders = Order::where('order_number', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->orWhere('whatsapp', 'like', "%{$query}%")
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
            'query' => $query,
        ]);
    }

    /**
     * Get details for checkout success.
     */
    public function successDetails($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with('items')->firstOrFail();

        $upiId = Setting::get('store_upi', 'aathishacrackers@okaxis');
        $storeName = Setting::get('store_name', 'Cracker Demo');
        
        $encodedStoreName = urlencode($storeName);
        $upiPayUrl = "upi://pay?pa={$upiId}&pn={$encodedStoreName}&am={$order->net_amount}&cu=INR";
        
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
            'upi_id' => Setting::get('store_upi_id', 'crackerdemo@okaxis'),
        ];

        $whatsappNum = Setting::get('store_whatsapp', '919998887776');

        $waMessage = "Hello " . $storeName . ", I have placed an order!\n\n"
                   . "*Order Number:* {$order->order_number}\n"
                   . "*Customer Name:* {$order->name}\n"
                   . "*Total Amount:* ₹" . number_format($order->net_amount, 2) . "\n\n"
                   . "Please confirm my booking and coordinate delivery details.";
        
        $whatsappUrl = "https://api.whatsapp.com/send?phone={$whatsappNum}&text=" . urlencode($waMessage);

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
        
        $waMessageCustomer .= "\nTrack your order here: " . url('/track?query=' . $order->order_number) . "\n\n"
                            . "Thank you for booking with us!";
        
        $customerPhone = preg_replace('/[^0-9]/', '', $order->whatsapp ?: $order->phone);
        if (strlen($customerPhone) === 10) {
            $customerPhone = '91' . $customerPhone;
        }
        $customerWhatsappUrl = "https://api.whatsapp.com/send?phone=" . $customerPhone . "&text=" . urlencode($waMessageCustomer);

        return response()->json([
            'order' => $order,
            'qrCodeUrl' => $qrCodeUrl,
            'bankDetails' => $bankDetails,
            'whatsappUrl' => $whatsappUrl,
            'whatsappNum' => $whatsappNum,
            'customerWhatsappUrl' => $customerWhatsappUrl,
        ]);
    }
}

import React, { createContext, useState, useEffect, useContext } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [settings, setSettings] = useState({
    store_name: 'Cracker Demo',
    min_order_value: 3800,
    discount_percent: 60,
    store_whatsapp: '919998887776',
    store_phone: '+91 9998887776',
    store_email: 'crackerdemo@gmail.com',
    store_address: 'Virudhunagar to Sivakasi Main Road, Sivakasi',
    enable_min_order: 'yes',
    enable_promo_codes: 'yes',
    enable_tax_delivery: 'no',
    tax_percent: 18,
    delivery_charge: 150,
  });
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({}); // { productId: { id, qty, mrp, selling_price, name, pack_size } }
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Promo state
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  // Load store data
  useEffect(() => {
    fetch('/api/storefront')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
        if (data.settings) {
          // Parse numerical settings
          const parsedSettings = {
            ...data.settings,
            min_order_value: parseFloat(data.settings.min_order_value || 3800),
            discount_percent: parseFloat(data.settings.discount_percent || 60),
            tax_percent: parseFloat(data.settings.tax_percent || 18),
            delivery_charge: parseFloat(data.settings.delivery_charge || 150),
          };
          setSettings(parsedSettings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load storefront data:', err);
        setLoading(false);
      });

    // Load cart from local storage
    const savedCart = localStorage.getItem('athi_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart({});
      }
    }
  }, []);

  // Save cart to local storage when it changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('athi_cart', JSON.stringify(newCart));
  };

  const increaseQty = (product) => {
    const newCart = { ...cart };
    if (!newCart[product.id]) {
      newCart[product.id] = {
        id: product.id,
        qty: 0,
        mrp: parseFloat(product.mrp),
        selling_price: parseFloat(product.selling_price),
        name: product.name,
        pack_size: product.pack_size,
        image: product.image,
      };
    }
    newCart[product.id].qty += 1;
    saveCart(newCart);
  };

  const decreaseQty = (productId) => {
    const newCart = { ...cart };
    if (newCart[productId]) {
      newCart[productId].qty -= 1;
      if (newCart[productId].qty <= 0) {
        delete newCart[productId];
      }
      saveCart(newCart);
    }
  };

  const updateQty = (product, qty) => {
    const newCart = { ...cart };
    const parsedQty = parseInt(qty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      if (newCart[product.id]) {
        delete newCart[product.id];
        saveCart(newCart);
      }
    } else {
      newCart[product.id] = {
        id: product.id,
        qty: parsedQty,
        mrp: parseFloat(product.mrp),
        selling_price: parseFloat(product.selling_price),
        name: product.name,
        pack_size: product.pack_size,
        image: product.image,
      };
      saveCart(newCart);
    }
  };

  const clearCart = () => {
    saveCart({});
    setAppliedPromo('');
    setPromoDiscount(0);
    setPromoMessage('');
    setPromoSuccess(false);
  };

  // Cart Calculations
  let totalQty = 0;
  let totalMrp = 0;
  let totalNet = 0;
  let totalUniqueProducts = 0;

  Object.values(cart).forEach((item) => {
    if (item.qty > 0) {
      totalQty += item.qty;
      totalMrp += item.mrp * item.qty;
      totalNet += item.selling_price * item.qty;
      totalUniqueProducts += 1;
    }
  });

  const totalDiscount = totalMrp - totalNet;

  // Handle Promo Code logic
  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setAppliedPromo('');
      setPromoDiscount(0);
      setPromoMessage('');
      setPromoSuccess(false);
      return;
    }

    // Find code in settings
    let matchedCode = null;
    let matchedValue = null;

    for (let i = 1; i <= 5; i++) {
      const codeSetting = settings[`promo_code_${i}`];
      if (codeSetting && codeSetting.toUpperCase() === cleanCode) {
        matchedCode = codeSetting;
        matchedValue = settings[`promo_value_${i}`];
        break;
      }
    }

    if (matchedCode) {
      setAppliedPromo(matchedCode);
      setPromoSuccess(true);

      const valStr = matchedValue.trim();
      let discount = 0;
      if (valStr.includes('%')) {
        const pct = parseFloat(valStr.replace('%', ''));
        if (pct > 0) {
          discount = (totalNet * pct) / 100;
        }
      } else {
        discount = parseFloat(valStr);
      }

      const finalDiscount = Math.min(discount, totalNet);
      setPromoDiscount(finalDiscount);
      setPromoMessage(`Code applied! You saved ₹${finalDiscount.toFixed(2)}`);
    } else {
      setAppliedPromo('');
      setPromoDiscount(0);
      setPromoMessage('Invalid promo code.');
      setPromoSuccess(false);
    }
  };

  // Recalculate promo discount when net total changes
  useEffect(() => {
    if (appliedPromo) {
      applyPromoCode(appliedPromo);
    } else {
      setPromoDiscount(0);
    }
  }, [totalNet, appliedPromo]);

  const postPromoNet = Math.max(0, totalNet - promoDiscount);

  const enableTaxDelivery = settings.enable_tax_delivery === 'yes';
  const taxAmount = enableTaxDelivery ? postPromoNet * (settings.tax_percent / 100) : 0;
  const deliveryCharge = (enableTaxDelivery && totalQty > 0) ? settings.delivery_charge : 0;
  const finalPayableAmount = postPromoNet + taxAmount + deliveryCharge;

  const value = {
    categories,
    settings,
    loading,
    cart,
    increaseQty,
    decreaseQty,
    updateQty,
    clearCart,
    totalQty,
    totalMrp,
    totalNet,
    totalUniqueProducts,
    totalDiscount,
    appliedPromo,
    promoDiscount,
    promoMessage,
    promoSuccess,
    applyPromoCode,
    postPromoNet,
    taxAmount,
    deliveryCharge,
    finalPayableAmount,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    checkoutOpen,
    setCheckoutOpen,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

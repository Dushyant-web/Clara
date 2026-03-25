import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Check, MapPin, Truck, CreditCard, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { orderService } from '../services/orderService'
import { addressService } from '../services/addressService'

const CheckoutPage = () => {
    const indianStates = [
        "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
        "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
        "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
        "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
        "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir",
        "Ladakh","Chandigarh","Puducherry","Andaman and Nicobar Islands",
        "Dadra and Nagar Haveli and Daman and Diu","Lakshadweep"
    ];

    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, "").slice(0,10);
        if (digits.length <= 5) return digits;
        return digits.slice(0,5) + " " + digits.slice(5);
    };

    const detectStateFromPincode = async (pin) => {
        if (pin.length !== 6) return;

        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await res.json();
            const offices = data?.[0]?.PostOffice;

            if (offices && offices.length > 0) {
                const state = offices[0].State;

                const cities = [
                    ...new Set(
                        offices.map(o => o.District || o.Name)
                    )
                ];

                setCityOptions(cities);

                setShippingData(prev => ({
                    ...prev,
                    state: state,
                    city: cities[0] || ''
                }));
            }
        } catch (e) {
            console.warn("Pincode lookup failed");
        }
    };
    const [step, setStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState('upi') // Default to 'upi' (Razorpay)
    const [isProcessing, setIsProcessing] = useState(false)
    const [shippingData, setShippingData] = useState({
        fullname: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    })
    const [promoCode, setPromoCode] = useState('')
    const [cityOptions, setCityOptions] = useState([])
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState("")
    const [savingAddress, setSavingAddress] = useState(false)
    const [discount, setDiscount] = useState(0)
    const [applyingPromo, setApplyingPromo] = useState(false)
    const [serverTotal, setServerTotal] = useState(null)

    const { cartItems, cartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (cartItems.length === 0 && !isProcessing) {
            navigate('/cart')
        }
    }, [cartItems, navigate, isProcessing])

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user?.id) return
            try {
                const data = await addressService.getAddresses(user.id)
                if (Array.isArray(data)) {
                    setSavedAddresses(data)
                }
            } catch (err) {
                console.warn("Failed to load saved addresses")
            }
        }

        fetchAddresses()
    }, [user])

    const subtotal = cartTotal
    const total = serverTotal !== null
        ? serverTotal
        : (subtotal > 500 ? subtotal : subtotal + 25) - discount

    const handleApplyPromo = async () => {
        if (!promoCode.trim() || !user) return
        setApplyingPromo(true)
        try {
            const result = await orderService.applyPromo(promoCode, user.id)
            if (result.discount) {
                setDiscount(result.discount)
                alert(`Promo applied! You saved ₹${result.discount}`)
            }
        } catch (error) {
            console.error('Promo error:', error)
            const msg = error.response?.data?.detail || 'Failed to apply promo code.';
            alert(msg)
        } finally {
            setApplyingPromo(false)
        }
    }

    const steps = [
        { id: 1, name: 'Shipping', icon: MapPin },
        { id: 2, name: 'Delivery', icon: Truck },
        { id: 3, name: 'Payment', icon: CreditCard },
    ]

    const autofillAddress = (addrId) => {
        const addr = savedAddresses.find(a => a.id === Number(addrId))
        if (!addr) return

        setShippingData({
            fullname: addr.name || "",
            email: user?.email || "",
            phone: addr.phone || "",
            address: addr.address_line || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.postal_code || ""
        })
    }

    const saveCurrentAddress = async () => {
        if (!user?.id) return

        const label = prompt("Save address as (home / office / etc):")
        if (!label) return

        setSavingAddress(true)

        try {
            await addressService.createAddress({
                user_id: user.id,
                name: shippingData.fullname,
                phone: shippingData.phone.replace(/\D/g, ""),
                address_line: shippingData.address,
                city: shippingData.city,
                state: shippingData.state,
                postal_code: shippingData.pincode,
                country: "India",
                label: label
            })

            alert("Address saved successfully")
            const refreshed = await addressService.getAddresses(user.id)
            if (Array.isArray(refreshed)) {
                setSavedAddresses(refreshed)
                const latest = refreshed[refreshed.length - 1]
                if (latest) {
                    setSelectedAddress(latest.id)
                    autofillAddress(latest.id)
                }
            }

        } catch (err) {
            console.error("Save address failed", err)
            alert("Failed to save address")
        } finally {
            setSavingAddress(false)
        }
    }

    const validateShipping = () => {
        const { fullname, email, phone, address, city, state, pincode } = shippingData;

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const phoneValid = phone.replace(/\D/g,"").length === 10;
        const pinValid = /^\d{6}$/.test(pincode);

        return (
            fullname &&
            address &&
            city &&
            state &&
            emailValid &&
            phoneValid &&
            pinValid
        );
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const nextStep = async () => {
        if (step === 1 && !validateShipping()) {
            alert('Please fill in all shipping details.')
            return
        }

        if (step < 3) setStep(step + 1)
        else {
            if (!user) {
                alert('Please login to complete your order.')
                return
            }

            setIsProcessing(true)
            try {
                // Previous unpaid order cleanup is now handled safely by the backend checkout endpoint

                // 0. Ensure Razorpay script is loaded
                if (!window.Razorpay) {
                    const res = await loadRazorpay();
                    if (!res) {
                        throw new Error('Razorpay SDK failed to load. Are you online?');
                    }
                }

                // 1. Create Checkout / Order with unique idempotency key
                if (!selectedAddress) {
                    alert("Please select or save a shipping address before placing the order.");
                    setIsProcessing(false);
                    return;
                }
                const idempotencyKey = (typeof crypto.randomUUID === 'function')
                    ? crypto.randomUUID()
                    : Math.random().toString(36).substring(2) + Date.now().toString(36);

                const checkoutResponse = await orderService.createCheckout(
                    user.id,
                    selectedAddress,
                    idempotencyKey,
                    discount > 0 ? promoCode : null
                )
                if (checkoutResponse?.total !== undefined) {
                    setServerTotal(checkoutResponse.total)
                }

                if (!checkoutResponse || !checkoutResponse.order_id) {
                    throw new Error(checkoutResponse?.message || 'Failed to create order on server');
                }
                // 2. Initiate Payment
                const paymentResponse = await orderService.initiatePayment(
                    checkoutResponse.order_id,
                    paymentMethod
                )

                // If the payment is free (amount 0) it will be returned as "paid"
                if (paymentResponse.status === 'paid' || paymentResponse.amount === 0) {
                    clearCart()
                    navigate(`/order-confirmation?order_id=${checkoutResponse.order_id}`)
                    return
                }

                if (!paymentResponse || !paymentResponse.razorpay_order_id) {
                    throw new Error(paymentResponse?.error || 'Failed to initiate payment gateway');
                }

                if (paymentResponse.razorpay_order_id) {
                    let rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
                    try {
                        const config = await orderService.getPaymentConfig();
                        if (config?.key) rzpKey = config.key;
                    } catch (e) {
                        console.warn('Backend config fetch failed, using fallback.');
                    }

                    rzpKey = (rzpKey || "").trim();

                    console.log("RAZORPAY DEBUG:", {
                        key_preview: rzpKey ? `${rzpKey.slice(0, 8)}...${rzpKey.slice(-6)}` : "MISSING",
                        order_id: paymentResponse.razorpay_order_id
                    });

                    const options = {
                        key: rzpKey,
                        name: "GAURK.",
                        description: "Order #" + checkoutResponse.order_id,
                        order_id: paymentResponse.razorpay_order_id,
                        handler: async (response) => {
                            try {
                                await orderService.confirmPayment(
                                    paymentResponse.payment_id,
                                    response.razorpay_payment_id
                                )

                                clearCart()

                                // Use React Router navigation instead of full page reload
                                navigate(`/order-confirmation?order_id=${checkoutResponse.order_id}`)
                            } catch (err) {
                                console.error("Payment confirmation error:", err)
                                navigate(`/order-confirmation?order_id=${checkoutResponse.order_id}`)
                            }
                        },
                        notes: {
                            order_id: checkoutResponse.order_id,
                            customer_email: shippingData.email
                        },
                        prefill: {
                            name: shippingData.fullname || "Customer",
                            email: shippingData.email || "customer@email.com",
                            contact: (shippingData.phone || "").replace(/\D/g, "").slice(-10)
                        },
                        theme: {
                            color: "#000000"
                        },
                        modal: {
                            ondismiss: function () {
                                console.warn("Razorpay popup closed by user")
                            }
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }
            } catch (error) {
                console.error('Checkout error:', error)
                const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Order creation failed. Please try again.';
                alert(errorMessage)
            } finally {
                setIsProcessing(false)
            }
        }
    }

    return (
        <div className="pt-32 pb-24 bg-primary min-h-screen text-secondary transition-colors duration-500 relative">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Flow */}
                    <div className="lg:col-span-8">
                        <div className="flex justify-between items-center mb-12">
                            <h1 className="text-4xl font-serif tracking-tighter text-secondary uppercase">Checkout</h1>
                            <Link to="/cart" className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-secondary flex items-center gap-2 font-bold">
                                <ArrowLeft size={14} /> Back to Bag
                            </Link>
                        </div>

                        {/* Step Progress */}
                        <div className="flex justify-between mb-16 relative">
                            <div className="absolute top-1/2 left-0 w-full h-px bg-secondary/10 -z-10" />
                            {steps.map((s) => (
                                <div key={s.id} className="flex flex-col items-center gap-4 bg-primary px-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${step >= s.id ? 'bg-secondary text-primary border-secondary' : 'bg-primary border-secondary/20'
                                        }`}>
                                        {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                                    </div>
                                    <span className={`text-[10px] tracking-widest font-bold ${step >= s.id ? 'text-secondary' : 'text-gray-500'}`}>
                                        {s.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8 relative"
                            >
                                {step === 1 && (
                                    <>
                                    <div className="md:col-span-2 mb-6">
                                        <label className="text-[10px] tracking-widest text-gray-500 mb-2 block font-bold uppercase">
                                            Saved Address
                                        </label>

                                        <select
                                            value={selectedAddress}
                                            onChange={(e) => {
                                                setSelectedAddress(e.target.value)
                                                autofillAddress(e.target.value)
                                            }}
                                            className="w-full bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary"
                                        >
                                            <option value="">Select Saved Address</option>
                                            {savedAddresses.map(addr => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.label || "Saved Address"} - {addr.city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] tracking-widest text-gray-500 mb-2 block font-bold">Shipping Country</label>
                                            <input type="text" value="India" disabled className="w-full bg-secondary/5 border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none cursor-not-allowed opacity-50 text-secondary" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Full Name (for delivery)"
                                                required
                                                value={shippingData.fullname}
                                                onChange={(e) => setShippingData({ ...shippingData, fullname: e.target.value })}
                                                className="w-full bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] tracking-widest text-gray-500 mb-2 block font-bold uppercase">Shipping Address</label>
                                            <input
                                                type="text"
                                                placeholder="Street Address, Apartment, Suite..."
                                                required
                                                value={shippingData.address}
                                                onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                                                className="w-full bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary"
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                            value={shippingData.email}
                                            onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                                            className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary"
                                        />
                                        <div className="relative border-b border-secondary/20 focus-within:border-secondary transition-all">
                                            <span className="absolute left-0 bottom-4 text-xs font-bold text-gray-500">+91</span>
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                required
                                                pattern="[0-9]{10}"
                                                maxLength="11"
                                                value={shippingData.phone}
                                                onChange={(e) =>
                                                    setShippingData({
                                                        ...shippingData,
                                                        phone: formatPhone(e.target.value)
                                                    })
                                                }
                                                className="w-full bg-transparent pl-8 py-4 text-xs font-bold focus:outline-none transition-all text-secondary"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <select
                                                required
                                                value={shippingData.city}
                                                onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                                                className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary"
                                            >
                                                <option value="">Select City</option>
                                                {shippingData.city && !cityOptions.includes(shippingData.city) && (
                                                    <option value={shippingData.city}>{shippingData.city}</option>
                                                )}
                                                {cityOptions.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>

                                            <select
                                                required
                                                value={shippingData.state}
                                                onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                                                className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary"
                                            >
                                                <option value="">Select State</option>
                                                {indianStates.map((st) => (
                                                    <option key={st} value={st}>{st}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Pincode"
                                            required
                                            pattern="\d{6}"
                                            maxLength="6"
                                            value={shippingData.pincode}
                                            onChange={(e) => {
                                                const pin = e.target.value.replace(/\D/g,"").slice(0,6);
                                                setShippingData({ ...shippingData, pincode: pin });
                                                detectStateFromPincode(pin);
                                            }}
                                            className="bg-transparent border-b border-secondary/20 py-4 text-xs font-bold focus:outline-none focus:border-secondary transition-all text-secondary"
                                        />
                                        <div className="md:col-span-2 pt-4">
                                            <button
                                                type="button"
                                                onClick={saveCurrentAddress}
                                                disabled={savingAddress}
                                                className="text-[10px] uppercase tracking-widest border border-secondary px-4 py-2 hover:bg-secondary hover:text-primary transition-all"
                                            >
                                                {savingAddress ? "Saving..." : "Save This Address"}
                                            </button>
                                        </div>
                                    </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4">
                                        <label className="bg-secondary/5 border border-secondary/10 p-6 flex justify-between items-center cursor-pointer hover:border-secondary transition-all">
                                            <div className="flex items-center gap-6">
                                                <Truck size={24} className="text-gray-500" />
                                                <div>
                                                    <p className="text-xs font-bold">Express Global</p>
                                                    <p className="text-[10px] text-gray-500 mt-1 font-bold">3-5 Business Days</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold">₹25.00</span>
                                            <input type="radio" name="delivery" defaultChecked className="hidden" />
                                        </label>
                                        <label className="bg-secondary/5 border border-secondary/10 p-6 flex justify-between items-center cursor-pointer hover:border-secondary transition-all opacity-50">
                                            <div className="flex items-center gap-6">
                                                <Truck size={24} className="text-gray-500" />
                                                <div>
                                                    <p className="text-xs font-bold">Standard Economy</p>
                                                    <p className="text-[10px] text-gray-500 mt-1 font-bold">7-14 Business Days</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold">FREE</span>
                                            <input type="radio" name="delivery" className="hidden" />
                                        </label>
                                    </div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="payment-step"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="py-12 space-y-12"
                                    >
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Checkout Method</p>
                                            <p className="text-xs font-bold tracking-widest text-secondary">Pay securely via Razorpay</p>
                                        </div>

                                        <div className="pt-12 pb-16 text-center space-y-6">
                                            <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500">
                                                <ShoppingBag className="text-secondary/60" size={40} />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-base font-serif italic text-secondary">Secured by Razorpay</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">Standard Secure Checkout</p>
                                            </div>
                                            <div className="pt-8 border-t border-secondary/5 max-w-xs mx-auto">
                                                <div className="flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                                                    <img src="https://img.icons8.com/color/48/visa.png" className="h-4" alt="Visa" />
                                                    <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6" alt="Mastercard" />
                                                    <img src="https://img.icons8.com/color/48/google-pay.png" className="h-6" alt="GPay" />
                                                    <img src="https://img.icons8.com/color/48/phonepe.png" className="h-6" alt="PhonePe" />
                                                </div>
                                                <p className="text-[8px] text-gray-400 mt-6 uppercase tracking-widest font-bold">All major cards & UPI supported</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={nextStep}
                            disabled={isProcessing || (step === 1 && !validateShipping())}
                            className="w-full mt-16 bg-secondary text-primary py-5 text-xs font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors uppercase tracking-widest disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                step === 3 ? 'Place Order' : 'Continue to ' + steps[step].name
                            )} {!isProcessing && <ChevronRight size={16} />}
                        </button>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-secondary/5 border border-secondary/10 p-8 sticky top-32">
                            <h2 className="text-xl font-serif tracking-tighter mb-8 pb-8 border-b border-secondary/10 uppercase">Order Summary</h2>
                            <div className="space-y-4 mb-8">
                                {cartItems.map(item => (
                                    <div key={item.uniqueKey} className="flex flex-col gap-1 border-b border-secondary/5 pb-4 last:border-0 last:pb-0">
                                        <div className="flex justify-between text-[10px] tracking-widest font-bold">
                                            <span className="text-gray-500 uppercase">{item.name} x {item.quantity}</span>
                                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        {(item.size || item.color) && (
                                            <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">
                                                {item.size && `Size: ${item.size}`}
                                                {item.size && item.color && ' | '}
                                                {item.color && `Color: ${item.color}`}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code */}
                            {step === 1 && (
                                <div className="mb-8 pt-8 border-t border-secondary/10">
                                    <p className="text-[10px] font-bold opacity-30 uppercase mb-4 tracking-widest">Sartorial Privilege</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="PROMO CODE"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            className="flex-grow bg-transparent border-b border-secondary/20 py-2 text-[10px] font-bold focus:outline-none focus:border-secondary transition-all text-secondary uppercase tracking-widest"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={applyingPromo || !promoCode}
                                            className="px-4 py-2 border border-secondary text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-primary transition-all disabled:opacity-20"
                                        >
                                            {applyingPromo ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-8 border-t border-secondary/10 mb-8">
                                <div className="flex justify-between text-[10px] tracking-widest text-gray-400 transition-all font-bold">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] tracking-widest text-gray-400 transition-all font-bold">
                                    <span>Shipping</span>
                                    <span>{subtotal > 500 ? 'FREE' : '₹25.00'}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-[10px] tracking-widest text-green-500 transition-all font-bold">
                                        <span>Journal Credit</span>
                                        <span>-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between text-lg transition-all font-serif">
                                <span className="tracking-widest uppercase">Total</span>
                                <span className="font-bold">₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage

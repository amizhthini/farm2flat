
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCart } from '../hooks/useCart';
import { mockProducts, mockSubscriptionBoxes, mockUser, mockOrders, mockSourcedProducts } from '../mock/data';
import { Product, SubscriptionBox, SubscriptionFrequency, User, CartItem, Order, AISuggestion, Recipe } from '../types';
import { getPersonalizedSuggestions, generateRecipes } from '../services/geminiService';
import { ShoppingCartIcon, LeafIcon, UserIcon, TrashIcon, PlusIcon, MinusIcon, ArrowRightIcon, MapPinIcon, HeartIcon, CogIcon, BookOpenIcon, HomeModernIcon, SparklesIcon, CheckBadgeIcon, PlusCircleIcon } from './Icons';

type UserViewType = 'SHOP' | 'SUBSCRIPTIONS' | 'CART' | 'PROFILE' | 'AUTH' | 'CHECKOUT' | 'GATEWAY' | 'CONFIRMATION';
type OrderWindow = 'Wednesday' | 'Sunday';

// This utility function is now defined here to be accessible by both UserView and CountdownTimer
const calculateDeadlineDate = (day: OrderWindow): Date => {
    const now = new Date();
    const deadline = new Date(now.getTime());
    const targetDayUTC = day === 'Wednesday' ? 3 : 0; // Date.getUTCDay(): Sunday = 0, Wednesday = 3

    deadline.setUTCHours(12, 0, 0, 0);

    const currentDayUTC = deadline.getUTCDay();
    const daysToAdd = (targetDayUTC - currentDayUTC + 7) % 7;

    deadline.setUTCDate(deadline.getUTCDate() + daysToAdd);

    if (deadline.getTime() < now.getTime()) {
        deadline.setUTCDate(deadline.getUTCDate() + 7);
    }
    
    return deadline;
};

// #region Helper Components
const Header: React.FC<{
    onNavigate: (view: UserViewType) => void;
    cartItemCount: number;
    postalCode: string;
    onPostalCodeChange: (postalCode: string) => void;
    isAuthenticated: boolean;
    onSignOut: () => void;
}> = ({ onNavigate, cartItemCount, postalCode, onPostalCodeChange, isAuthenticated, onSignOut }) => {
    const [localPostalCode, setLocalPostalCode] = useState(postalCode);

    const handlePostalCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedCode = localPostalCode.toUpperCase().replace(/\s/g, '');
        onPostalCodeChange(formattedCode);
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center relative">
                {/* Left: Logo */}
                <div onClick={() => onNavigate('SHOP')} className="flex items-center cursor-pointer z-10">
                    <LeafIcon className="h-8 w-8 text-green-600" />
                    <h1 className="text-2xl font-bold text-gray-800 ml-2">Farm2Flat</h1>
                </div>

                {/* Center: Main Navigation */}
                <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                    <button onClick={() => onNavigate('SHOP')} className="text-gray-800 hover:text-green-600 font-medium text-lg">Shop</button>
                    <button onClick={() => onNavigate('SUBSCRIPTIONS')} className="text-gray-800 hover:text-green-600 font-medium text-lg">Produce Boxes</button>
                </nav>

                {/* Right: Search, Profile, Cart */}
                <div className="flex items-center gap-4 z-10">
                     <form onSubmit={handlePostalCodeSubmit} className="hidden lg:flex items-center border rounded-lg overflow-hidden">
                        <MapPinIcon className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            type="text"
                            value={localPostalCode}
                            onChange={(e) => setLocalPostalCode(e.target.value)}
                            placeholder="A1A 1A1"
                            className="px-2 py-1 text-sm focus:outline-none w-24"
                            aria-label="Postal Code"
                        />
                        <button type="submit" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 text-sm font-semibold">
                            Update
                        </button>
                    </form>
                    
                    {isAuthenticated ? (
                        <div className="relative group">
                            <button onClick={() => onNavigate('PROFILE')} className="text-gray-600 hover:text-green-600 flex items-center gap-1">
                                <UserIcon className="h-6 w-6" />
                                <span className="hidden sm:inline text-sm">Dashboard</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible">
                                    <button onClick={() => onNavigate('PROFILE')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">My Dashboard</button>
                                    <button onClick={onSignOut} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Sign Out</button>
                            </div>
                        </div>
                    ) : (
                            <button onClick={() => onNavigate('AUTH')} className="text-gray-600 hover:text-green-600 font-semibold">Sign In</button>
                    )}
                    
                    <button onClick={() => onNavigate('CART')} className="relative" aria-label={`Cart with ${cartItemCount} items`}>
                        <ShoppingCartIcon className="h-6 w-6 text-gray-600 hover:text-green-600" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

const CountdownTimer: React.FC<{
    deadlineDate: Date;
    onDeadlineChange: (window: OrderWindow) => void;
    selectedDeadline: OrderWindow;
}> = ({ deadlineDate, onDeadlineChange, selectedDeadline }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = deadlineDate.getTime() - new Date().getTime();
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft('Order window closed!');
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call
        
        return () => clearInterval(timer);
    }, [deadlineDate]);

    return (
        <div className="bg-green-600 text-white text-center py-2 px-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
            <div className="flex items-center">
                <span className="font-bold mr-2">Next order deadline:</span>
                <select 
                    value={selectedDeadline}
                    onChange={(e) => onDeadlineChange(e.target.value as OrderWindow)}
                    className="bg-green-700 border-none rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <option value="Sunday">Sunday at 12 PM UTC</option>
                    <option value="Wednesday">Wednesday at 12 PM UTC</option>
                </select>
            </div>
            <div className="flex items-center">
                <span className="font-semibold mr-2">Time left:</span>
                <span className="font-mono">{timeLeft}</span>
            </div>
        </div>
    );
};

const ProductCard: React.FC<{ 
    product: Product; 
    cartItem?: CartItem;
    onAddToCart: (product: Product) => void; 
    onUpdateQuantity: (cartId: string, quantity: number) => void;
    onRemoveFromCart: (cartId: string) => void;
    isRegular: boolean; 
    onToggleRegular: (productId: string) => void; 
    available: boolean 
}> = ({ product, cartItem, onAddToCart, onUpdateQuantity, onRemoveFromCart, isRegular, onToggleRegular, available }) => (
    <div className={`bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full group ${!available ? 'opacity-60 pointer-events-none grayscale' : 'hover:shadow-md transition-shadow'}`}>
        <div className="relative h-20 w-full bg-gray-100">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
             {available && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleRegular(product.id); }}
                    className={`absolute top-1.5 right-1.5 p-1.5 rounded-full shadow-sm transition-all ${isRegular ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'}`}
                    aria-label={isRegular ? 'Remove from regulars' : 'Add to regulars'}
                >
                    <HeartIcon className="w-3 h-3" filled={isRegular} />
                </button>
             )}
             {!available && (
                 <div className="absolute inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center">
                     <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide">Out of Stock</span>
                 </div>
             )}
        </div>
        <div className="p-3 flex flex-col flex-grow gap-1">
            <h3 className="text-xs font-bold text-gray-800 leading-tight">
                {product.name} <span className="font-normal text-gray-500">| {product.unit}</span>
            </h3>
            
            <p className="text-[10px] text-gray-500 font-medium truncate" title={product.farmer}>{product.farmer}</p>
            
            <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</p>
                
                {cartItem ? (
                    <div className="flex items-center gap-2 bg-white shadow-sm rounded-lg border border-gray-200 px-2 py-1 h-8">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (cartItem.quantity === 1) onRemoveFromCart(cartItem.cartId);
                                else onUpdateQuantity(cartItem.cartId, cartItem.quantity - 1);
                            }}
                            className="text-red-500 hover:text-red-700"
                        >
                            {cartItem.quantity === 1 ? <TrashIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{cartItem.quantity}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                            className="text-green-600 hover:text-green-700"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button 
                        disabled={!available}
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="bg-green-100 text-green-700 hover:bg-green-200 rounded-full p-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Add to cart"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    </div>
);


const SubscriptionCard: React.FC<{ 
    subscription: SubscriptionBox; 
    onAddToCart: (sub: SubscriptionBox, options: { frequency: SubscriptionFrequency; isTrial?: boolean }) => void;
    isSubscribed: boolean;
    onManageSubscription: () => void;
}> = ({ subscription, onAddToCart, isSubscribed, onManageSubscription }) => {
    const [frequency, setFrequency] = useState<SubscriptionFrequency>(SubscriptionFrequency.Weekly);

    return (
        <div className={`bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row relative ${isSubscribed ? 'border-2 border-green-500' : ''}`}>
            {isSubscribed && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    SUBSCRIBED
                </div>
            )}
            <img src={subscription.imageUrl} alt={`${subscription.type} Box`} className="md:w-1/3 h-64 md:h-auto object-cover" />
            <div className="p-6 flex-1">
                <h3 className="text-2xl font-bold text-gray-800">{subscription.type} Box - {subscription.size}</h3>
                <p className="text-md text-gray-600 mt-1">{subscription.ethnicityFocus} Focus</p>
                <p className="text-gray-700 mt-4">{subscription.description}</p>
                <p className="text-sm text-gray-500 mt-2">Example contents: {subscription.contentsSample.join(', ')}</p>
                <p className="text-2xl font-bold text-gray-900 my-4">${subscription.price.toFixed(2)}</p>
                <div className="flex flex-wrap gap-4 items-center">
                    {isSubscribed ? (
                         <button onClick={onManageSubscription} className="bg-gray-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2">
                             <CogIcon className="w-5 h-5" /> Manage Subscription
                         </button>
                    ) : (
                        <>
                            <select value={frequency} onChange={(e) => setFrequency(e.target.value as SubscriptionFrequency)} className="border rounded-md px-3 py-2">
                                {Object.values(SubscriptionFrequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                            </select>
                            <button onClick={() => onAddToCart(subscription, { frequency })} className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition">Subscribe</button>
                            <button onClick={() => onAddToCart(subscription, { frequency, isTrial: true })} className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-600 transition">One-time Trial</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const CartView: React.FC<{ items: CartItem[]; cartTotal: number; updateQuantity: (id: string, q: number) => void; removeFromCart: (id: string) => void; onCheckout: () => void }> = ({ items, cartTotal, updateQuantity, removeFromCart, onCheckout }) => (
    <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h2>
        {items.length === 0 ? (
            <p>Your cart is empty.</p>
        ) : (
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <ul className="space-y-4">
                        {items.map(item => (
                            <li key={item.cartId} className="flex items-center bg-white p-4 rounded-lg shadow">
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                <div className="flex-grow ml-4">
                                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                    {item.type === 'subscription' && <p className="text-sm text-gray-500">{item.isTrial ? 'One-time Trial' : item.frequency}</p>}
                                    <p className="text-gray-600 font-bold">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><MinusIcon className="w-4 h-4" /></button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><PlusIcon className="w-4 h-4" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.cartId)} className="ml-4 text-red-500 hover:text-red-700"><TrashIcon className="w-6 h-6" /></button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-24">
                        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-gray-500">
                            <span>Delivery</span>
                            <span>$5.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>${(cartTotal + 5).toFixed(2)}</span>
                        </div>
                        {cartTotal < 20 && <p className="text-red-500 text-sm mt-2">Minimum order is $20.00</p>}
                        <button 
                          onClick={onCheckout}
                          disabled={cartTotal < 20}
                          className="w-full bg-green-500 text-white mt-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                          Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const AuthView: React.FC<{ onAuthSuccess: (user: User) => void }> = ({ onAuthSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (email === 'ami@gmail.com' && password === 'Ami12345') {
            onAuthSuccess({ ...mockUser, name: 'Ami', email: 'ami@gmail.com' });
        } else {
            setError('Invalid credentials. Access is restricted.');
        }
    };
    
    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign In</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="p-3 border rounded w-full mb-4" required />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="p-3 border rounded w-full mb-4" required />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const CheckoutView: React.FC<{ cartTotal: number; user: User; onConfirmOrder: () => void; onBackToCart: () => void }> = ({ cartTotal, user, onConfirmOrder, onBackToCart }) => (
    <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h2>
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-6">Shipping & Payment</h3>
                <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" defaultValue={user.name.split(' ')[0]} className="p-3 border rounded w-full" />
                        <input type="text" placeholder="Last Name" defaultValue={user.name.split(' ').slice(1).join(' ')} className="p-3 border rounded w-full" />
                    </div>
                    <input type="text" placeholder="Address" className="p-3 border rounded w-full mt-4" />
                    <input type="tel" placeholder="Phone Number" className="p-3 border rounded w-full mt-4" />
                    <input type="text" placeholder="Postal Code" defaultValue={user.postalCode} className="p-3 border rounded w-full mt-4" />
                    
                    <h3 className="text-xl font-semibold my-6 pt-4 border-t">Payment Details</h3>
                    <input type="text" placeholder="Card Number" className="p-3 border rounded w-full" />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <input type="text" placeholder="MM/YY" className="p-3 border rounded w-full" />
                        <input type="text" placeholder="CVC" className="p-3 border rounded w-full" />
                    </div>
                    
                    <h3 className="text-xl font-semibold my-6 pt-4 border-t">Promo Code</h3>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Enter code" className="p-3 border rounded w-full" />
                        <button type="button" className="bg-gray-600 text-white px-6 rounded-lg font-semibold hover:bg-gray-700">Apply</button>
                    </div>
                </form>
            </div>
            <div className="lg:w-1/3">
                <div className="bg-white p-6 rounded-lg shadow sticky top-24">
                    <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                    <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-gray-500">
                        <span>Delivery</span>
                        <span>$5.00</span>
                    </div>
                     <div className="flex justify-between mb-2 text-gray-500">
                        <span>Taxes</span>
                        <span>${(cartTotal * 0.13).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                        <span>Total</span>
                        <span>${(cartTotal + 5 + (cartTotal * 0.13)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-8 gap-4">
                        <button onClick={onBackToCart} className="text-gray-600 hover:text-gray-800 font-semibold py-3 px-4 rounded-lg border hover:bg-gray-100 w-1/2">Back</button>
                        <button onClick={onConfirmOrder} className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition w-1/2">Pay Now</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PaymentGatewayView: React.FC<{ onPaymentSuccess: () => void }> = ({ onPaymentSuccess }) => (
    <div className="container mx-auto px-6 py-16 text-center">
        <div className="bg-white p-12 rounded-lg shadow-lg max-w-md mx-auto">
             <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Payment</h2>
             <p className="text-gray-600 mb-6">You are being redirected to our secure payment provider to complete your purchase.</p>
             <div className="bg-gray-50 p-4 rounded-md border text-left mb-6">
                <p><strong>Merchant:</strong> Farm2Flat</p>
                <p><strong>Amount:</strong> $--.-- (dynamic amount)</p>
             </div>
             <button onClick={onPaymentSuccess} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full">
                Simulate Successful Payment
            </button>
        </div>
    </div>
);


const ConfirmationView: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
    <div className="container mx-auto px-6 py-16 text-center">
        <div className="bg-white p-12 rounded-lg shadow-lg max-w-md mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LeafIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">Thank you for your purchase. Your farm-fresh goodies are on their way. You can track your order in your profile.</p>
            <button onClick={onContinue} className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2 mx-auto">
                View My Orders <ArrowRightIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);


const PersonalizedSuggestions: React.FC<{ 
    user: User; 
    onGetSuggestions: () => void; 
    suggestions: AISuggestion[]; 
    isLoading: boolean; 
    onAddToCart: (product: Product) => void;
    availableProducts: Product[];
}> = ({ user, onGetSuggestions, suggestions, isLoading, onAddToCart, availableProducts }) => (
    <div className="mb-12 bg-green-50 border-2 border-green-200 border-dashed rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-green-800 mb-2">Just for you, {user.name.split(' ')[0]}!</h3>
        <p className="text-green-700 mb-4">Based on your recent orders, here are some fresh picks we think you'll love.</p>
        <button onClick={onGetSuggestions} disabled={isLoading} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400">
            {isLoading ? 'Thinking...' : 'Get AI Suggestions'}
        </button>
        {suggestions.length > 0 && !suggestions[0]?.name.includes('Error') && (
            <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suggestions.map((item, index) => {
                        // Find matching product in catalog to allow adding to cart
                        // Loose matching: check if suggestion name is contained in product name or vice versa
                        const product = availableProducts.find(p => 
                            p.name.toLowerCase().includes(item.name.toLowerCase()) || 
                            item.name.toLowerCase().includes(p.name.toLowerCase())
                        );

                        return (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-left flex flex-col justify-between h-full">
                                <div>
                                    <p className="font-bold text-green-800">{item.name}</p>
                                    <p className="text-sm text-green-700 mb-2">{item.reason}</p>
                                    {product && (
                                        <div className="text-xs text-gray-500 mb-2">
                                            Match: {product.name} - ${product.price.toFixed(2)}
                                        </div>
                                    )}
                                </div>
                                {product ? (
                                    <button 
                                        onClick={() => onAddToCart(product)}
                                        className="mt-2 w-full bg-green-100 text-green-700 py-2 rounded-md hover:bg-green-200 font-semibold text-sm flex items-center justify-center gap-1"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Add to Cart
                                    </button>
                                ) : (
                                    <button disabled className="mt-2 w-full bg-gray-100 text-gray-400 py-2 rounded-md font-semibold text-sm cursor-not-allowed">
                                        Unavailable
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
);

const DeliveryStatusTracker: React.FC<{ status: 'Order Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' }> = ({ status }) => {
    const steps = ['Order Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(status);

    return (
        <div className="w-full mt-4">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center w-1/4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                    {isCompleted ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : <div className="w-3 h-3 bg-gray-300 rounded-full"></div>}
                                </div>
                                <p className={`text-xs mt-2 text-center transition-colors duration-300 ${isCurrent ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{step}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

const BudgetTracker: React.FC<{ user: User }> = ({ user }) => {
    if (!user.groceryBudget) return null;

    const { amount, period } = user.groceryBudget;

    const spentThisPeriod = user.orderHistory.reduce((total, order) => {
        const orderDate = new Date(order.date);
        const now = new Date();
        let isWithinPeriod = false;

        if (period === 'Weekly') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);
            if (orderDate >= startOfWeek) {
                isWithinPeriod = true;
            }
        } else { // Monthly
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            if (orderDate >= startOfMonth) {
                isWithinPeriod = true;
            }
        }

        return isWithinPeriod ? total + order.total : total;
    }, 0);

    const percentage = Math.min((spentThisPeriod / amount) * 100, 100);
    const progressBarColor = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">{period} Budget</h4>
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-bold text-gray-800">${spentThisPeriod.toFixed(2)} spent</span>
                <span className="text-gray-500">of ${amount.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

// #region Dashboard Components for Signed-in User

const DashboardView: React.FC<{ 
    user: User;
    suggestions: AISuggestion[];
    isLoadingSuggestions: boolean;
    onGetSuggestions: () => void;
    regionalProducts: Product[];
    recipes: Recipe[];
    isLoadingRecipes: boolean;
    onGenerateRecipes: () => void;
    onSelectRecipe: (recipe: Recipe) => void;
    onAddToCart: (product: Product) => void;
}> = ({ user, suggestions, isLoadingSuggestions, onGetSuggestions, regionalProducts, recipes, isLoadingRecipes, onGenerateRecipes, onSelectRecipe, onAddToCart }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">My Dashboard</h3>
            
            <PersonalizedSuggestions 
                user={user} 
                onGetSuggestions={onGetSuggestions} 
                suggestions={suggestions} 
                isLoading={isLoadingSuggestions} 
                onAddToCart={onAddToCart}
                availableProducts={regionalProducts}
            />

            <div className="my-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                        <BookOpenIcon className="w-8 h-8 text-green-600" />
                        Meal Ideas & Recipes
                    </h2>
                    <p className="text-gray-600 mt-2">Discover delicious meals you can make with our fresh ingredients.</p>
                    <button 
                        onClick={onGenerateRecipes} 
                        disabled={isLoadingRecipes}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {isLoadingRecipes ? 'Generating...' : '✨ Generate with AI'}
                    </button>
                </div>
                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {recipes.map(recipe => (
                            <div key={recipe.id} onClick={() => onSelectRecipe(recipe)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 group">
                                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">{recipe.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 italic">Click "Generate with AI" to get personalized recipe ideas based on currently available produce!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// #endregion


const ProfileView: React.FC<{ 
    user: User; 
    onUpdateUser: (updatedUser: User) => void; 
    onToggleRegular: (productId: string) => void; 
    onAddToCart: (product: Product) => void;
    initialTab?: 'dashboard' | 'orders' | 'subscriptions' | 'regulars' | 'preferences' | 'manage';
    // Dashboard specific props
    suggestions: AISuggestion[];
    isLoadingSuggestions: boolean;
    onGetSuggestions: () => void;
    regionalProducts: Product[];
    recipes: Recipe[];
    isLoadingRecipes: boolean;
    onGenerateRecipes: () => void;
    onSelectRecipe: (recipe: Recipe) => void;
}> = ({ user, onUpdateUser, onToggleRegular, onAddToCart, initialTab = 'dashboard', suggestions, isLoadingSuggestions, onGetSuggestions, regionalProducts, recipes, isLoadingRecipes, onGenerateRecipes, onSelectRecipe }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'subscriptions' | 'regulars' | 'preferences' | 'manage'>(initialTab);
    
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
    
    const activeSubscriptions = user.orderHistory
        .flatMap(o => o.items)
        .filter(item => item.type === 'subscription' && !item.isTrial);

    const renderProfileContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <DashboardView 
                        user={user}
                        suggestions={suggestions}
                        isLoadingSuggestions={isLoadingSuggestions}
                        onGetSuggestions={onGetSuggestions}
                        regionalProducts={regionalProducts}
                        recipes={recipes}
                        isLoadingRecipes={isLoadingRecipes}
                        onGenerateRecipes={onGenerateRecipes}
                        onSelectRecipe={onSelectRecipe}
                        onAddToCart={onAddToCart}
                    />
                );
            case 'orders':
                return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">My Orders</h3>
                        <div className="space-y-6">
                            {user.orderHistory.map(order => (
                                <div key={order.id} className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                                        <div>
                                            <p className="font-semibold text-gray-800">Order ID: {order.id}</p>
                                            <p className="text-sm text-gray-500">Date: {order.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</p>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>{order.status}</span>
                                        </div>
                                    </div>
                                    <ul className="text-sm text-gray-600 my-2 border-y py-2">
                                        {order.items.map(item => <li key={item.cartId}>- {item.name} (x{item.quantity})</li>)}
                                    </ul>
                                    {order.deliveryDetails && (
                                       <>
                                           <p className="text-sm text-gray-600 font-semibold">
                                               Estimated Arrival: {order.deliveryDetails.estimatedArrival}
                                           </p>
                                           <DeliveryStatusTracker status={order.deliveryDetails.trackingStatus} />
                                       </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'subscriptions':
                 return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">My Subscriptions</h3>
                        {activeSubscriptions.length > 0 ? (
                            <div className="space-y-4">
                               {activeSubscriptions.map(sub => (
                                   <div key={sub.cartId} className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center">
                                       <div>
                                           <p className="font-semibold">{sub.name}</p>
                                           <p className="text-sm text-gray-500">{sub.frequency}</p>
                                       </div>
                                       <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md">Manage</button>
                                   </div>
                               ))}
                            </div>
                        ) : <p>You have no active subscriptions.</p>}
                    </div>
                );
            case 'regulars':
                const regularProducts = mockProducts.filter(p => user.regularPurchaseList?.includes(p.id));
                return (
                     <div>
                        <h3 className="text-xl font-semibold mb-4">My Regulars</h3>
                        <p className="text-gray-600 mb-4 text-sm">These are your favorite items. You can quickly add them to your cart from here.</p>
                        {regularProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {regularProducts.map(product => (
                                   <div key={product.id} className="bg-gray-50 p-3 rounded-lg border flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                                            <div>
                                                 <p className="font-semibold">{product.name}</p>
                                                 <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                                            </div>
                                       </div>
                                       <div className="flex flex-col gap-2">
                                            <button onClick={() => onAddToCart(product)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><PlusIcon className="w-4 h-4" /></button>
                                            <button onClick={() => onToggleRegular(product.id)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><TrashIcon className="w-4 h-4" /></button>
                                       </div>
                                   </div>
                                ))}
                            </div>
                        ) : <p>You haven't added any regular items yet. Click the heart icon on products you love!</p>}
                    </div>
                );
            case 'preferences':
                 return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Preferences & Budget</h3>
                        <BudgetTracker user={user} />
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Family Size</label>
                                <input type="number" defaultValue={user.familySize} className="mt-1 p-2 border rounded-md w-full md:w-1/2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dietary Preferences</label>
                                <div className="mt-2 space-y-2">
                                    <label className="flex items-center"><input type="checkbox" defaultChecked={user.preferences?.includes('organic')} className="h-4 w-4 text-green-600 border-gray-300 rounded" /> <span className="ml-2 text-gray-700">Organic</span></label>
                                    <label className="flex items-center"><input type="checkbox" defaultChecked={user.preferences?.includes('local-only')} className="h-4 w-4 text-green-600 border-gray-300 rounded" /> <span className="ml-2 text-gray-700">Local Only</span></label>
                                    <label className="flex items-center"><input type="checkbox" defaultChecked={user.preferences?.includes('vegan')} className="h-4 w-4 text-green-600 border-gray-300 rounded" /> <span className="ml-2 text-gray-700">Vegan</span></label>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Grocery Budget</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-500">$</span>
                                    <input type="number" defaultValue={user.groceryBudget?.amount} className="p-2 border rounded-md w-full" />
                                    <select defaultValue={user.groceryBudget?.period} className="p-2 border rounded-md">
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600">Save Preferences</button>
                        </form>
                    </div>
                 );
            case 'manage':
                 return (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Manage Profile</h3>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" defaultValue={user.name} className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" defaultValue={user.email} className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600">Save Changes</button>
                        </div>
                    </div>
                 );
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.name.split(' ')[0]}!</h2>
                    <p className="text-gray-600">Manage your orders, preferences, and personal details here.</p>
                </div>
                <div className="bg-blue-100 text-blue-800 font-bold p-3 rounded-lg text-center">
                    <p className="text-sm">Loyalty Credits</p>
                    <p className="text-2xl">${user.loyaltyCredits?.toFixed(2) || '0.00'}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="flex flex-col space-y-2 sticky top-24">
                         <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-md text-left font-semibold flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}><HomeModernIcon className="w-5 h-5"/>Dashboard</button>
                         <button onClick={() => setActiveTab('orders')} className={`p-3 rounded-md text-left font-semibold flex items-center gap-3 ${activeTab === 'orders' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}><ShoppingCartIcon className="w-5 h-5"/>My Orders</button>
                         <button onClick={() => setActiveTab('subscriptions')} className={`p-3 rounded-md text-left font-semibold flex items-center gap-3 ${activeTab === 'subscriptions' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}><LeafIcon className="w-5 h-5"/>My Subscriptions</button>
                         <button onClick={() => setActiveTab('regulars')} className={`p-3 rounded-md text-left font-semibold flex items-center gap-3 ${activeTab === 'regulars' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}><HeartIcon className="w-5 h-5"/>My Regulars</button>
                         <button onClick={() => setActiveTab('preferences')} className={`p-3 rounded-md text-left font-semibold flex items-center gap-3 ${activeTab === 'preferences' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}><CogIcon className="w-5 h-5"/>Preferences & Budget</button>
                         <button onClick={() => setActiveTab('manage')} className={`p-3 rounded-md text-left font-semibold flex items-center gap-3 ${activeTab === 'manage' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}><UserIcon className="w-5 h-5"/>Manage Profile</button>
                    </nav>
                </aside>
                <main className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                    {renderProfileContent()}
                </main>
            </div>
        </div>
    );
};
// #endregion

const FeaturedProducts: React.FC<{ 
    products: Product[], 
    cartItems: CartItem[],
    onAddToCart: (product: Product) => void,
    onUpdateQuantity: (cartId: string, quantity: number) => void,
    onRemoveFromCart: (cartId: string) => void,
    onToggleRegular: (id: string) => void,
    regulars: string[]
}> = ({ products, cartItems, onAddToCart, onUpdateQuantity, onRemoveFromCart, onToggleRegular, regulars }) => (
    <div className="mb-16">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Featured products</h2>
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior: 'smooth'})} className="text-indigo-600 hover:text-indigo-800 font-semibold">View all</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {products.slice(0, 7).map(product => (
                <ProductCard 
                    key={product.id}
                    product={product}
                    cartItem={cartItems.find(i => i.id === product.id && i.type === 'product')}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveFromCart={onRemoveFromCart}
                    isRegular={regulars.includes(product.id)}
                    onToggleRegular={onToggleRegular}
                    available={product.status === 'Available'}
                />
            ))}
        </div>
    </div>
);

const PromoSection: React.FC<{ onStartCustomBox: () => void, onNavigate: (view: UserViewType) => void }> = ({ onStartCustomBox, onNavigate }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-16">
        <div className="relative h-[400px] group overflow-hidden">
            <img src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1000&auto=format&fit=crop" alt="Local farmers" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center p-8">
                <h3 className="text-3xl font-bold text-white mb-4">Pick a produce box that works for you</h3>
                <p className="text-white text-lg mb-6 max-w-sm">Skip the hassle of choosing one by one.</p>
                <button onClick={() => onNavigate('SUBSCRIPTIONS')} className="bg-white/90 text-gray-900 px-8 py-3 font-semibold hover:bg-white transition-colors">View Produce Boxes</button>
            </div>
        </div>
        <div className="relative h-[400px] group overflow-hidden">
            <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop" alt="Farm fresh quality" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center p-8">
                <h3 className="text-3xl font-bold text-white mb-4">Customize your own produce box</h3>
                <button onClick={onStartCustomBox} className="bg-white/90 text-gray-900 px-8 py-3 font-semibold hover:bg-white transition-colors">Get a quote</button>
            </div>
        </div>
    </div>
);

const MissionSection: React.FC = () => (
    <div className="bg-gray-100 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                We believe in fostering connections between local producers and consumers for a healthier, sustainable community.
            </h2>
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior: 'smooth'})} className="text-gray-900 font-semibold text-lg flex items-center justify-center gap-2 hover:gap-4 transition-all">
                Shop now <ArrowRightIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const Footer: React.FC = () => (
    <footer className="bg-white border-t py-16 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
                <ul className="space-y-4 text-gray-600">
                    <li><a href="#" className="hover:text-gray-900">Home</a></li>
                    <li><a href="#" className="hover:text-gray-900">Catalog</a></li>
                    <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                </ul>
            </div>
            <div>
                <ul className="space-y-4 text-gray-600">
                    <li><a href="#" className="hover:text-gray-900">About us</a></li>
                    <li><a href="#" className="hover:text-gray-900">Return policy</a></li>
                    <li><a href="#" className="hover:text-gray-900">Help & Questions</a></li>
                </ul>
            </div>
            <div className="md:col-span-2">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Join our community</h4>
                <div className="flex gap-4">
                    <input type="email" placeholder="Email address" className="flex-1 p-3 border border-gray-300 focus:outline-none focus:border-gray-500" />
                    <button className="bg-gray-900 text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors">Sign up</button>
                </div>
            </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>&copy; 2025, Powered by Farm2Flat</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                {/* Social Icons Placeholders */}
                <span className="cursor-pointer hover:text-gray-900">Instagram</span>
                <span className="cursor-pointer hover:text-gray-900">YouTube</span>
                <span className="cursor-pointer hover:text-gray-900">TikTok</span>
                <span className="cursor-pointer hover:text-gray-900">Twitter</span>
            </div>
        </div>
    </footer>
);

const RecipeDetailModal: React.FC<{
    recipe: Recipe;
    availableProducts: Product[];
    onClose: () => void;
    onAddToCart: (items: { product: Product; quantity: number }[]) => void;
}> = ({ recipe, availableProducts, onClose, onAddToCart }) => {
    const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
    
    useEffect(() => {
        const storeItems = new Set<string>();
        recipe.ingredients.forEach(ing => {
            if (ing.isStoreItem) {
                const productMatch = availableProducts.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()));
                if (productMatch) {
                    storeItems.add(productMatch.id);
                }
            }
        });
        setSelectedIngredients(storeItems);
    }, [recipe, availableProducts]);

    const handleToggleIngredient = (productId: string) => {
        setSelectedIngredients(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const handleAddToCart = () => {
        const itemsToAdd = Array.from(selectedIngredients).map(productId => {
            const product = availableProducts.find(p => p.id === productId);
            return product ? { product, quantity: 1 } : null;
        }).filter((item): item is { product: Product; quantity: number } => item !== null);
        
        onAddToCart(itemsToAdd);
        onClose();
    };

    const storeIngredients = recipe.ingredients.filter(i => i.isStoreItem).map(ing => {
        const productMatch = availableProducts.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()));
        return { ...ing, product: productMatch };
    });
    const pantryIngredients = recipe.ingredients.filter(i => !i.isStoreItem);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">{recipe.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
                </div>
                <div className="p-6">
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-64 object-cover rounded-md mb-4"/>
                    <p className="text-gray-600 mb-6">{recipe.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Ingredients</h4>
                            <h5 className="font-bold text-sm text-green-700 mt-4 mb-2">From Farm2Flat</h5>
                            <ul className="space-y-2">
                                {storeIngredients.map((ing, i) => (
                                    <li key={i} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`ing-${ing.product?.id || i}`}
                                            checked={ing.product ? selectedIngredients.has(ing.product.id) : false}
                                            onChange={() => ing.product && handleToggleIngredient(ing.product.id)}
                                            disabled={!ing.product}
                                            className="h-4 w-4 text-green-600 border-gray-300 rounded disabled:opacity-50"
                                        />
                                        <label htmlFor={`ing-${ing.product?.id || i}`} className={`ml-2 ${!ing.product ? 'text-gray-400 line-through' : ''}`}>
                                            {ing.quantity} {ing.name} {!ing.product ? '(Not in store)' : ''}
                                        </label>
                                    </li>
                                ))}
                            </ul>

                             <h5 className="font-bold text-sm text-gray-600 mt-4 mb-2">Pantry Staples</h5>
                             <ul className="space-y-1 text-sm text-gray-500 list-disc list-inside">
                                {pantryIngredients.map((ing, i) => <li key={i}>{ing.quantity} {ing.name}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Instructions</h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">Close</button>
                    <button onClick={handleAddToCart} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400" disabled={selectedIngredients.size === 0}>
                        Add {selectedIngredients.size} items to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomBoxBuilderModal: React.FC<{
    onClose: () => void;
    products: Product[];
    onComplete: (items: { product: Product, quantity: number }[]) => void;
}> = ({ onClose, products, onComplete }) => {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        familySize: 2,
        budget: 100,
        goal: 'Balanced Diet',
        frequency: 'Weekly'
    });
    const [selectedItems, setSelectedItems] = useState<{ [id: string]: number }>({});
    const [genieDiscount, setGenieDiscount] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loadingRecipes, setLoadingRecipes] = useState(false);
    
    // Step 2: Product Search
    const [searchTerm, setSearchTerm] = useState('');

    const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPreferences(prev => ({ 
            ...prev, 
            [name]: (name === 'familySize' || name === 'budget') ? Number(value) : value 
        }));
    };

    const handleAddItem = (productId: string) => {
        setSelectedItems(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    };

    const handleRemoveItem = (productId: string) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            if (newItems[productId] > 1) {
                newItems[productId]--;
            } else {
                delete newItems[productId];
            }
            return newItems;
        });
    };

    const cartTotal = useMemo(() => {
        return Object.entries(selectedItems).reduce((sum: number, [id, qty]: [string, number]) => {
            const product = products.find(p => p.id === id);
            return sum + (product ? product.price * qty : 0);
        }, 0);
    }, [selectedItems, products]);

    const marketPrice = cartTotal * 1.25; // Simulating 25% higher market price
    const savings = marketPrice - cartTotal;
    const finalPrice = genieDiscount ? cartTotal * 0.9 : cartTotal;
    
    const totalQuantity = Object.values(selectedItems).reduce((sum: number, qty: number) => sum + qty, 0);
    const estimatedDays = preferences.familySize > 0 
        ? Math.round((totalQuantity * 1.5) / Number(preferences.familySize)) 
        : 0;

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const generateAIInsights = async () => {
        setLoadingRecipes(true);
        const selectedProductsList = Object.keys(selectedItems).map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
        // Only fetch recipes if we have items
        if(selectedProductsList.length > 0) {
             const result = await generateRecipes(selectedProductsList.slice(0, 5)); // Limit to first 5 for speed
             setRecipes(result);
        }
        setLoadingRecipes(false);
    };

    const handleNext = async () => {
        if (step === 2) {
            await generateAIInsights();
        }
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Add to cart and close
            const items = Object.entries(selectedItems).map(([id, qty]) => {
                const product = products.find(p => p.id === id);
                return product ? { product, quantity: qty } : null;
            }).filter((i): i is { product: Product, quantity: number } => i !== null);
            
            onComplete(items);
        }
    };

    const handleAskGenie = () => {
        // Simulate API call delay for effect
        setTimeout(() => {
            setGenieDiscount(true);
        }, 800);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6"/> Custom Box Builder
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 font-bold text-xl">&times;</button>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-gray-100 h-2 w-full">
                    <div className="bg-green-500 h-2 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="max-w-lg mx-auto">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tell us about your needs</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Family Size</label>
                                    <input type="number" name="familySize" value={preferences.familySize} onChange={handlePreferenceChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" min="1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Weekly Grocery Budget ($)</label>
                                    <input type="number" name="budget" value={preferences.budget} onChange={handlePreferenceChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">Primary Goal</label>
                                    <select name="goal" value={preferences.goal} onChange={handlePreferenceChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                                        <option>Reduced Price</option>
                                        <option>Balanced Diet</option>
                                        <option>Culture Specific</option>
                                        <option>Recipe Focused</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col md:flex-row h-full gap-6">
                            <div className="md:w-2/3 flex flex-col">
                                <div className="mb-4">
                                    <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 border rounded-lg shadow-sm" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition">
                                            <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded mb-2"/>
                                            <h4 className="font-bold text-sm truncate">{p.name}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-gray-700 font-semibold">${p.price.toFixed(2)}</span>
                                                <button onClick={() => handleAddItem(p.id)} className="bg-green-100 text-green-700 p-1.5 rounded hover:bg-green-200"><PlusIcon className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg border overflow-y-auto">
                                <h3 className="font-bold text-lg mb-4">Your Box</h3>
                                {Object.keys(selectedItems).length === 0 ? <p className="text-gray-500 text-sm">Your box is empty.</p> : (
                                    <ul className="space-y-3">
                                        {Object.entries(selectedItems).map(([id, qty]) => {
                                            const p = products.find(prod => prod.id === id);
                                            if (!p) return null;
                                            return (
                                                <li key={id} className="flex justify-between items-center text-sm">
                                                    <span>{p.name} (x{qty})</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">${(p.price * qty).toFixed(2)}</span>
                                                        <button onClick={() => handleRemoveItem(id)} className="text-red-500"><MinusIcon className="w-3 h-3"/></button>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                                <div className="mt-6 pt-4 border-t border-gray-300">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-green-600 mt-1">Est. Market Price: ${marketPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">AI Insights for Your Box</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                                    <h4 className="text-lg font-bold text-green-800 mb-2">Total Savings</h4>
                                    <p className="text-3xl font-bold text-green-600">${savings.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">vs. Average Market Price</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                    <h4 className="text-lg font-bold text-blue-800 mb-2">Family Coverage</h4>
                                    <p className="text-3xl font-bold text-blue-600">~{estimatedDays} Days</p>
                                    <p className="text-sm text-gray-600">Based on {preferences.familySize} people</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                    <h4 className="text-lg font-bold text-purple-800 mb-2">Goal Alignment</h4>
                                    <p className="text-xl font-bold text-purple-600">{preferences.goal}</p>
                                    <p className="text-sm text-gray-600">Perfectly matched!</p>
                                </div>
                            </div>

                            <div className="text-left">
                                <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-indigo-500"/> Suggested Recipes</h4>
                                {loadingRecipes ? <p>Asking the chef...</p> : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {recipes.slice(0, 2).map(r => (
                                            <div key={r.id} className="bg-white p-4 rounded-lg border shadow-sm">
                                                <h5 className="font-bold text-gray-800">{r.name}</h5>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</p>
                                            </div>
                                        ))}
                                        {recipes.length === 0 && <p className="text-gray-500">Add more items to get specific recipe ideas!</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="max-w-lg mx-auto text-center pt-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Finalize Your Plan</h3>
                            
                            <div className="mb-8">
                                <label className="block text-gray-700 font-semibold mb-2">How often do you want this?</label>
                                <select name="frequency" value={preferences.frequency} onChange={handlePreferenceChange} className="w-full p-3 border rounded-lg text-center font-semibold bg-gray-50">
                                    <option>Weekly</option>
                                    <option>Bi-Weekly</option>
                                    <option>Monthly</option>
                                    <option>One-Time Only</option>
                                </select>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-indigo-100 relative overflow-hidden">
                                <p className="text-gray-600 mb-2">Your Total</p>
                                <p className={`text-4xl font-bold mb-6 ${genieDiscount ? 'text-gray-400 line-through text-2xl' : 'text-gray-800'}`}>${cartTotal.toFixed(2)}</p>
                                
                                {genieDiscount && (
                                    <div className="animate-bounce">
                                        <p className="text-5xl font-bold text-green-600 mb-2">${finalPrice.toFixed(2)}</p>
                                        <div className="flex items-center justify-center gap-2 text-green-700 bg-green-100 py-1 px-3 rounded-full inline-block mx-auto mb-4">
                                            <CheckBadgeIcon className="w-5 h-5"/> Genie Deal Applied: 10% OFF
                                        </div>
                                    </div>
                                )}

                                {!genieDiscount ? (
                                    <button 
                                        onClick={handleAskGenie}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <SparklesIcon className="w-6 h-6"/> Ask Genie for a Deal
                                    </button>
                                ) : (
                                    <p className="text-gray-500 italic">Genie has granted your wish!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t flex justify-between">
                    {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-semibold">Back</button>}
                    <button 
                        onClick={handleNext} 
                        className={`px-8 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-md ml-auto ${step === 2 && Object.keys(selectedItems).length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={step === 2 && Object.keys(selectedItems).length === 0}
                    >
                        {step === 4 ? 'Proceed to Checkout' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Simple hashing function to determine availability based on strings
const getRegionalProductData = (product: Product, postalCode: string) => {
    // Sanitize
    const cleanPostal = postalCode.replace(/\s/g, '').toUpperCase();
    if (cleanPostal.length < 3) return { ...product, available: true };

    const postalPrefix = cleanPostal.substring(0, 3);
    
    // Hash based on chars
    let hash = 0;
    for (let i = 0; i < postalPrefix.length; i++) {
        // Fix: Explicit cast to number for arithmetic operation
        const charCode = postalPrefix.charCodeAt(i);
        hash = ((hash << 5) - hash) + charCode;
        hash |= 0;
    }
    // Fix: Explicitly type accumulator in reduce and ensure ID is string
    const productIdStr = String(product.id);
    const productHash = productIdStr.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const combinedHash = Math.abs(hash + productHash);

    // 10% chance item is unavailable in this region
    const isAvailable = (combinedHash % 10) !== 0; 
    
    // Price variance +/- 10% based on region
    const priceVariance = ((combinedHash % 20) - 10) / 100;
    
    // Fix: Ensure price is treated as number for arithmetic
    const basePrice = Number(product.price);
    const regionalPrice = basePrice * (1 + priceVariance);

    return {
        ...product,
        price: regionalPrice,
        available: isAvailable
    };
};


const UserView: React.FC = () => {
    const [currentView, setCurrentView] = useState<UserViewType>('SHOP');
    const [postalCode, setPostalCode] = useState(mockUser.postalCode);
    const [selectedDeadline, setSelectedDeadline] = useState<OrderWindow>('Sunday');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    const [profileInitialTab, setProfileInitialTab] = useState<'dashboard' | 'orders' | 'subscriptions' | 'regulars' | 'preferences' | 'manage'>('dashboard');
    
    // State for Custom Box Builder flow
    const [showBoxBuilder, setShowBoxBuilder] = useState(false);
    const [pendingBoxBuilder, setPendingBoxBuilder] = useState(false);

    const cart = useCart();
    
    const deadlineDate = calculateDeadlineDate(selectedDeadline);

    // Apply Regional Logic
    const regionalProducts = useMemo(() => {
        return mockProducts.map(p => getRegionalProductData(p, postalCode));
    }, [postalCode]);

    // Apply Category Filter
    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'All') return regionalProducts;
        return regionalProducts.filter(p => p.category === selectedCategory);
    }, [regionalProducts, selectedCategory]);

    // Extract unique categories for sidebar
    const categories = useMemo(() => {
        const cats = new Set(mockProducts.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }, []);

    const activeSubscriptions = useMemo(() => {
        if (!currentUser) return new Set<string>();
        const subIds = new Set<string>();
        currentUser.orderHistory.forEach(order => {
            order.items.forEach(item => {
                if (item.type === 'subscription' && !item.isTrial) {
                    subIds.add(item.id);
                }
            });
        });
        return subIds;
    }, [currentUser]);

    const handleGetSuggestions = useCallback(async () => {
        setIsLoadingSuggestions(true);
        const productsInHistory = (currentUser || mockUser).orderHistory
            .flatMap(order => order.items)
            .map(cartItem => mockProducts.find(p => p.id === cartItem.id))
            .filter((p): p is Product => p !== undefined);
        
        const result = await getPersonalizedSuggestions(productsInHistory);
        setSuggestions(result);
        setIsLoadingSuggestions(false);
    }, [currentUser]);

    const handleGenerateRecipes = useCallback(async () => {
        setIsLoadingRecipes(true);
        const result = await generateRecipes(regionalProducts.filter(p => p.available));
        setRecipes(result);
        setIsLoadingRecipes(false);
    }, [regionalProducts]);

    const handleAddRecipeItemsToCart = (items: { product: Product; quantity: number }[]) => {
        items.forEach(item => {
            // Add items, repeating for quantity (simple implementation for useCart hook that expects single item add)
            for(let i=0; i<item.quantity; i++) {
                cart.addToCart(item.product);
            }
        });
    };
    
    const handleToggleRegular = (productId: string) => {
        if (!currentUser) return;
        
        const isRegular = currentUser.regularPurchaseList?.includes(productId);
        const newRegulars = isRegular
            ? currentUser.regularPurchaseList?.filter(id => id !== productId)
            : [...(currentUser.regularPurchaseList || []), productId];
            
        setCurrentUser({ ...currentUser, regularPurchaseList: newRegulars });
    };

    const handleAuthSuccess = (user: User) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        if (pendingBoxBuilder) {
            setPendingBoxBuilder(false);
            setShowBoxBuilder(true);
            setCurrentView('SHOP');
        } else if (cart.items.length > 0) {
            setCurrentView('CHECKOUT');
        } else {
            setCurrentView('SHOP');
        }
    };
    
    const handleSignOut = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentView('SHOP');
    };
    
    const handleCheckout = () => {
        if (isAuthenticated) {
            setCurrentView('CHECKOUT');
        } else {
            setCurrentView('AUTH');
        }
    };

    const handlePaymentSuccess = () => {
        if (currentUser) {
            const newOrder: Order = {
                id: `o${Date.now()}`,
                userId: currentUser.id,
                date: new Date().toISOString().split('T')[0],
                items: cart.items,
                total: cart.cartTotal,
                status: 'Processing',
                deliveryDetails: {
                    estimatedArrival: 'In 3-5 business days',
                    trackingStatus: 'Preparing'
                }
            };
            setCurrentUser({
                ...currentUser,
                orderHistory: [newOrder, ...currentUser.orderHistory]
            });
        }
        cart.clearCart();
        setCurrentView('CONFIRMATION');
    };
    
    const handleDeadlineChange = (window: OrderWindow) => {
        setSelectedDeadline(window);
    };

    const handleNavigate = (view: UserViewType) => {
        if (view === 'PROFILE') {
            setProfileInitialTab('dashboard');
        }
        setCurrentView(view);
    };
    
    const handleManageSubscription = () => {
        setProfileInitialTab('subscriptions');
        setCurrentView('PROFILE');
    };
    
    const handleStartCustomBox = () => {
        if (isAuthenticated) {
            setShowBoxBuilder(true);
        } else {
            setPendingBoxBuilder(true);
            setCurrentView('AUTH');
        }
    };
    
    const handleCompleteCustomBox = (items: { product: Product, quantity: number }[]) => {
        items.forEach(({ product, quantity }) => {
            // Add items one by one or create logic for bulk add in useCart
            for(let i=0; i<quantity; i++) {
                cart.addToCart(product); 
            }
        });
        setShowBoxBuilder(false);
        setCurrentView('CHECKOUT');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'SHOP':
                return (
                     <div className="pb-0"> {/* Removed container constraint for full width sections */}
                        <div className="container mx-auto px-6 py-8">
                            {/* Hero Section with Signup - Replaces simple banner for unauthenticated users */}
                             {!isAuthenticated && (
                                 <div className="relative w-full h-[400px] mb-16 rounded-2xl overflow-hidden shadow-2xl group">
                                     {/* Background Image - Fresh food table */}
                                     <img 
                                         src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop" 
                                         alt="Fresh food on table" 
                                         className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                     />
                                     {/* Gradient Overlay to make text pop */}
                                     <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                                     
                                     <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
                                         <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-none">
                                             Fresh <br/>
                                             from local <br/>
                                             farms
                                         </h2>
                                         <p className="text-xl text-gray-200 mb-8 max-w-md">
                                             Direct from the soil to your table. Experience the difference of true local produce at wholesale prices.
                                         </p>
                                         <div className="flex flex-wrap gap-4">
                                             <button onClick={() => setCurrentView('AUTH')} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1">
                                                 Get Started
                                             </button>
                                             <button onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior: 'smooth'})} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-3 rounded-full font-bold transition-all transform hover:-translate-y-1">
                                                 View Catalog
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {/* Featured Products List */}
                             <FeaturedProducts 
                                products={regionalProducts} 
                                cartItems={cart.items}
                                onAddToCart={cart.addToCart}
                                onUpdateQuantity={cart.updateQuantity}
                                onRemoveFromCart={cart.removeFromCart}
                                onToggleRegular={handleToggleRegular}
                                regulars={currentUser?.regularPurchaseList || []}
                             />
                        </div>

                        {/* Promo Section - Full Width capability container if needed, but keeping margin for design */}
                        <div className="container mx-auto px-0 md:px-6">
                            <PromoSection onStartCustomBox={handleStartCustomBox} onNavigate={handleNavigate} />
                        </div>

                        <div className="container mx-auto px-6 py-8" id="catalog">
                             {isAuthenticated && currentUser && (
                                <PersonalizedSuggestions 
                                    user={currentUser}
                                    onGetSuggestions={handleGetSuggestions}
                                    suggestions={suggestions}
                                    isLoading={isLoadingSuggestions}
                                    onAddToCart={cart.addToCart}
                                    availableProducts={regionalProducts}
                                />
                            )}

                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Fresh from the Farm Catalog</h2>
                            
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Sidebar Filters */}
                                <aside className="lg:w-1/4">
                                    <div className="bg-white p-4 rounded-lg shadow-md sticky top-24">
                                        <h3 className="font-bold text-lg mb-4 text-gray-800">Categories</h3>
                                        <ul className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
                                            {categories.map(cat => (
                                                <li key={cat}>
                                                    <button 
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${selectedCategory === cat ? 'bg-green-600 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </aside>

                                {/* Product Grid */}
                                <div className="lg:w-3/4">
                                    <div className="flex justify-between items-center mb-4">
                                         <p className="text-sm text-gray-500">Showing {filteredProducts.length} items for region: <span className="font-bold text-green-700">{postalCode || 'Default'}</span></p>
                                    </div>
                                   
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {filteredProducts.map(p => (
                                            <ProductCard 
                                                key={p.id} 
                                                product={p} 
                                                cartItem={cart.items.find(i => i.id === p.id && i.type === 'product')}
                                                onAddToCart={cart.addToCart}
                                                onUpdateQuantity={cart.updateQuantity}
                                                onRemoveFromCart={cart.removeFromCart}
                                                isRegular={currentUser?.regularPurchaseList?.includes(p.id) || false}
                                                onToggleRegular={handleToggleRegular}
                                                available={p.available}
                                            />
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <div className="col-span-full text-center py-12 text-gray-500">
                                                No products found in this category.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mission Statement Section Above Footer */}
                        <MissionSection />
                    </div>
                );
            case 'SUBSCRIPTIONS':
                return (
                    <div className="container mx-auto px-6 py-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Produce Boxes</h2>
                        <div className="space-y-8">
                            {mockSubscriptionBoxes.map(s => 
                                <SubscriptionCard 
                                    key={s.id} 
                                    subscription={s} 
                                    onAddToCart={cart.addToCart} 
                                    isSubscribed={isAuthenticated && activeSubscriptions.has(s.id)}
                                    onManageSubscription={handleManageSubscription}
                                />
                            )}
                        </div>
                    </div>
                );
            case 'CART':
                return <CartView items={cart.items} cartTotal={cart.cartTotal} updateQuantity={cart.updateQuantity} removeFromCart={cart.removeFromCart} onCheckout={handleCheckout} />;
            case 'AUTH':
                return <AuthView onAuthSuccess={handleAuthSuccess} />;
            case 'CHECKOUT':
                 if (!currentUser) return <AuthView onAuthSuccess={handleAuthSuccess} />; // Should not happen if flow is correct, but a good guard
                return <CheckoutView cartTotal={cart.cartTotal} user={currentUser} onConfirmOrder={() => setCurrentView('GATEWAY')} onBackToCart={() => setCurrentView('CART')} />;
            case 'GATEWAY':
                return <PaymentGatewayView onPaymentSuccess={handlePaymentSuccess} />;
            case 'CONFIRMATION':
                return <ConfirmationView onContinue={() => setCurrentView('PROFILE')} />;
            case 'PROFILE':
                 if (!currentUser) return <AuthView onAuthSuccess={handleAuthSuccess} />; // Protect profile route
                 return <ProfileView 
                    user={currentUser} 
                    onUpdateUser={setCurrentUser} 
                    onToggleRegular={handleToggleRegular} 
                    onAddToCart={cart.addToCart} 
                    initialTab={profileInitialTab}
                    suggestions={suggestions}
                    isLoadingSuggestions={isLoadingSuggestions}
                    onGetSuggestions={handleGetSuggestions}
                    regionalProducts={regionalProducts}
                    recipes={recipes}
                    isLoadingRecipes={isLoadingRecipes}
                    onGenerateRecipes={handleGenerateRecipes}
                    onSelectRecipe={setSelectedRecipe}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header onNavigate={handleNavigate} cartItemCount={cart.totalItems} postalCode={postalCode} onPostalCodeChange={setPostalCode} isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
            <CountdownTimer deadlineDate={deadlineDate} onDeadlineChange={handleDeadlineChange} selectedDeadline={selectedDeadline} />
            <main className="flex-grow">
                {renderContent()}
            </main>
             {selectedRecipe && (
                <RecipeDetailModal 
                    recipe={selectedRecipe} 
                    availableProducts={regionalProducts} // Pass all regional products for recipe matching
                    onClose={() => setSelectedRecipe(null)} 
                    onAddToCart={handleAddRecipeItemsToCart}
                />
            )}
            {showBoxBuilder && (
                <CustomBoxBuilderModal 
                    onClose={() => setShowBoxBuilder(false)} 
                    products={regionalProducts}
                    onComplete={handleCompleteCustomBox}
                />
            )}
            <Footer />
        </div>
    );
};

export default UserView;

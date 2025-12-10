
import React, { useState, useMemo } from 'react';
import { Farmer, Product, StaffMember, Supplier, Customer, PurchaseOrder, Order } from '../types';
import { mockFarmerProducts, mockImportedFarmerProducts, mockOrders } from '../mock/data';
import { 
    LogoutIcon, LeafIcon, ChartBarIcon, BoxIcon, ClipboardListIcon, 
    CurrencyDollarIcon, SparklesIcon, UserCircleIcon, UploadIcon,
    UsersGroupIcon, BuildingStorefrontIcon, ReceiptPercentIcon, 
    UsersIcon, FileDownloadIcon, PrinterIcon, HomeModernIcon,
    PlusIcon, PencilIcon, EyeIcon, TrashIcon
} from './Icons';

type FarmerViewType = 
    'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'FARM2FLAT' | 'FINANCIALS' | 
    'ANALYTICS' | 'PROFILE' | 'STAFF' | 'SUPPLIERS' | 'CUSTOMERS' | 'PURCHASES';

interface FarmerViewProps {
  farmer: Farmer;
  onLogout: () => void;
}

const FarmerView: React.FC<FarmerViewProps> = ({ farmer, onLogout }) => {
    const [currentView, setCurrentView] = useState<FarmerViewType>('DASHBOARD');

    const renderView = () => {
        switch (currentView) {
            case 'DASHBOARD':
                return <DashboardView farmer={farmer} />;
            case 'PRODUCTS':
                return <ProductManagementView />;
            case 'ORDERS':
                return <OrderFulfillmentView farmer={farmer} />;
            case 'FARM2FLAT':
                return <Farm2FlatView farmer={farmer} />;
            case 'FINANCIALS':
                return <FinancialsView farmer={farmer} />;
            case 'ANALYTICS':
                return <AnalyticsView farmer={farmer} />;
            case 'PROFILE':
                return <FarmProfileView farmer={farmer} />;
            case 'STAFF':
                return <StaffManagementView staff={farmer.staff || []} />;
            case 'SUPPLIERS':
                return <SupplierManagementView suppliers={farmer.suppliers || []} />;
            case 'CUSTOMERS':
                return <CustomerManagementView customers={farmer.customers || []} />;
            case 'PURCHASES':
                return <PurchaseManagementView purchases={farmer.purchaseHistory || []} suppliers={farmer.suppliers || []} />;
            default:
                return <DashboardView farmer={farmer} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-green-800 text-white p-4 flex flex-col h-screen sticky top-0 overflow-y-auto">
                <div className="flex items-center gap-2 mb-8">
                    <LeafIcon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Farmer Portal</h2>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        <NavItem icon={<ChartBarIcon className="w-5 h-5"/>} label="Dashboard" active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} />
                        <NavItem icon={<BoxIcon className="w-5 h-5"/>} label="My Products" active={currentView === 'PRODUCTS'} onClick={() => setCurrentView('PRODUCTS')} />
                        <NavItem icon={<ClipboardListIcon className="w-5 h-5"/>} label="Orders" active={currentView === 'ORDERS'} onClick={() => setCurrentView('ORDERS')} />
                        <NavItem icon={<HomeModernIcon className="w-5 h-5"/>} label="Farm2Flat" active={currentView === 'FARM2FLAT'} onClick={() => setCurrentView('FARM2FLAT')} />
                        <NavItem icon={<ReceiptPercentIcon className="w-5 h-5"/>} label="Purchases" active={currentView === 'PURCHASES'} onClick={() => setCurrentView('PURCHASES')} />
                        <NavItem icon={<CurrencyDollarIcon className="w-5 h-5"/>} label="Financials" active={currentView === 'FINANCIALS'} onClick={() => setCurrentView('FINANCIALS')} />
                        <NavItem icon={<SparklesIcon className="w-5 h-5"/>} label="Analytics" active={currentView === 'ANALYTICS'} onClick={() => setCurrentView('ANALYTICS')} />
                        <hr className="border-green-700 my-2" />
                        <NavItem icon={<UsersGroupIcon className="w-5 h-5"/>} label="Staff" active={currentView === 'STAFF'} onClick={() => setCurrentView('STAFF')} />
                        <NavItem icon={<BuildingStorefrontIcon className="w-5 h-5"/>} label="Suppliers" active={currentView === 'SUPPLIERS'} onClick={() => setCurrentView('SUPPLIERS')} />
                        <NavItem icon={<UsersIcon className="w-5 h-5"/>} label="Customers" active={currentView === 'CUSTOMERS'} onClick={() => setCurrentView('CUSTOMERS')} />
                        <hr className="border-green-700 my-2" />
                        <NavItem icon={<UserCircleIcon className="w-5 h-5"/>} label="My Farm Profile" active={currentView === 'PROFILE'} onClick={() => setCurrentView('PROFILE')} />
                    </ul>
                </nav>
                <div className="mt-auto pt-4 border-t border-green-700">
                    <button onClick={onLogout} className="w-full text-left hover:bg-green-700 p-2 rounded flex items-center gap-3 text-green-100 hover:text-white"><LogoutIcon className="w-5 h-5" />Logout</button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

// #region Helper & View Components

const TableActionToolbar: React.FC<{
    selectedCount: number;
    onAdd: () => void;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
}> = ({ selectedCount, onAdd, onEdit, onView, onDelete }) => (
    <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-lg shadow-sm border">
        <button onClick={onAdd} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold transition-colors">
            <PlusIcon className="w-4 h-4"/> Manual Add
        </button>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <button onClick={onEdit} disabled={selectedCount !== 1} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            <PencilIcon className="w-4 h-4"/> Edit
        </button>
        <button onClick={onView} disabled={selectedCount !== 1} className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            <EyeIcon className="w-4 h-4"/> View Details
        </button>
        <button onClick={onDelete} disabled={selectedCount === 0} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ml-auto">
            <TrashIcon className="w-4 h-4"/> Delete {selectedCount > 0 && `(${selectedCount})`}
        </button>
    </div>
);

const useTableSelection = () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const handleSelect = (id: string) => {
        const newSet = new Set(selected);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelected(newSet);
    };
    const handleSelectAll = (ids: string[]) => {
        if (selected.size === ids.length) setSelected(new Set());
        else setSelected(new Set(ids));
    };
    return { selected, handleSelect, handleSelectAll, setSelected };
}

const NavItem: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({ icon, label, active, onClick }) => (
    <li>
        <button onClick={onClick} className={`w-full text-left p-2 rounded flex items-center gap-3 transition-colors ${active ? 'bg-green-600' : 'hover:bg-green-700'}`}>
            {icon}
            {label}
        </button>
    </li>
);

const DashboardView: React.FC<{ farmer: Farmer }> = ({ farmer }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome, {farmer.name.split('(')[0].trim()}!</h1>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Active Listings</h3>
                <p className="text-4xl font-bold text-gray-800">{mockFarmerProducts.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Open Orders</h3>
                <p className="text-4xl font-bold text-orange-500">3</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Weekly Revenue</h3>
                <p className="text-4xl font-bold text-green-600">$450.75</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-indigo-500" />
                AI Insights & Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <h4 className="font-bold text-indigo-800">Demand Forecast</h4>
                    <p className="text-indigo-700 mt-1">Heirloom Tomatoes are trending up. We predict a 25% increase in demand next week. Consider increasing your listed quantity.</p>
                </div>
                 <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                    <h4 className="font-bold text-teal-800">Crop Suggestion</h4>
                    <p className="text-teal-700 mt-1">Based on local restaurant demand, Kale has high profitability. We suggest planting a test batch.</p>
                </div>
            </div>
        </div>
    </div>
);

const ProductManagementView: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(mockFarmerProducts);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [filters, setFilters] = useState({ name: '', category: 'all', subcategory: 'all', status: 'all' });
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImport = () => {
        setProducts(mockImportedFarmerProducts);
        setLastUpdated(new Date());
        alert('Products imported successfully! The current product list has been replaced.');
    };

    const handleDelete = () => {
        if(confirm(`Delete ${selected.size} products?`)) {
            setProducts(prev => prev.filter(p => !selected.has(p.id)));
            setSelected(new Set());
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(filters.name.toLowerCase());
            const categoryMatch = filters.category === 'all' || p.category === filters.category;
            const subcategoryMatch = filters.subcategory === 'all' || p.subcategory === filters.subcategory;
            const statusMatch = filters.status === 'all' || p.status === filters.status;
            return nameMatch && categoryMatch && subcategoryMatch && statusMatch;
        });
    }, [products, filters]);

    const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
    const subcategories = useMemo(() => [...new Set(products.map(p => p.subcategory).filter(Boolean))], [products]);
    const statuses = useMemo(() => [...new Set(products.map(p => p.status).filter(Boolean))], [products]);

    const handleExportCsv = () => {
        // Implementation
    };

    const handlePrint = () => {
        // Implementation
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">My Product Inventory</h1>
                 <div className="flex gap-2">
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600">Add New Product</button>
                 </div>
            </div>

            <TableActionToolbar 
                selectedCount={selected.size}
                onAdd={() => alert('Add Product')}
                onEdit={() => alert('Edit Product')}
                onView={() => alert('View Details')}
                onDelete={handleDelete}
            />

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Import from File</h3>
                 <div className="flex items-center gap-4">
                    <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                    <button onClick={handleImport} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2">
                        <UploadIcon className="w-5 h-5" /> Import Products
                    </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">Uploading a new file will replace your entire current product list.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" name="name" placeholder="Product name..." value={filters.name} onChange={handleFilterChange} className="p-2 border rounded-md" />
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2 border rounded-md bg-white">
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="subcategory" value={filters.subcategory} onChange={handleFilterChange} className="p-2 border rounded-md bg-white">
                        <option value="all">All Sub-Categories</option>
                        {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-md bg-white">
                        <option value="all">All Statuses</option>
                         {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={handleExportCsv} className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 flex items-center gap-2 text-sm"><FileDownloadIcon className="w-4 h-4" />Export to CSV</button>
                    <button onClick={handlePrint} className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 flex items-center gap-2 text-sm"><PrinterIcon className="w-4 h-4" />Print Table</button>
                </div>
                <p className="text-sm text-gray-600">
                    Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Not updated in this session'}
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left" id="product-table">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(products.map(p => p.id))} checked={selected.size > 0 && selected.size === products.length} /></th>
                            <th className="p-4">Product Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Available Date</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Available Qty</th>
                            <th className="p-4">MOQ</th>
                            <th className="p-4">Seasonal</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className={`border-b hover:bg-gray-50 ${selected.has(product.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(product.id)} onChange={() => handleSelect(product.id)} /></td>
                                <td className="p-4 font-semibold">{product.name}</td>
                                <td className="p-4">{product.category}<br/><span className="text-xs text-gray-500">{product.subcategory}</span></td>
                                <td className="p-4">{product.availableDate}</td>
                                <td className="p-4">${product.price.toFixed(2)} / {product.unit}</td>
                                <td className="p-4 font-bold">{product.quantity}</td>
                                <td className="p-4">{product.moq || 'N/A'}</td>
                                <td className="p-4">{product.isSeasonal ? 'Yes' : 'No'}</td>
                                <td className="p-4">
                                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        product.status === 'Available' ? 'bg-green-100 text-green-800' :
                                        product.status === 'Unavailable' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {product.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrderFulfillmentView: React.FC<{ farmer: Farmer }> = ({ farmer }) => {
    const farmerOrders = mockOrders.filter(order => 
        order.items.some(item => farmer.productIds?.includes(item.id))
    );
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleDelete = () => {
        if(confirm(`Delete ${selected.size} orders?`)) {
            // Mock delete logic would go here
            setSelected(new Set());
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Fulfillment</h1>
            <TableActionToolbar 
                selectedCount={selected.size}
                onAdd={() => alert('Manual Order')}
                onEdit={() => alert('Edit Order')}
                onView={() => alert('View Details')}
                onDelete={handleDelete}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(farmerOrders.map(o => o.id))} checked={selected.size > 0 && selected.size === farmerOrders.length} /></th>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Items to Fulfill</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farmerOrders.map(order => (
                            <tr key={order.id} className={`border-b hover:bg-gray-50 ${selected.has(order.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(order.id)} onChange={() => handleSelect(order.id)} /></td>
                                <td className="p-4">{order.id}</td>
                                <td className="p-4">{order.date}</td>
                                <td className="p-4">
                                    <ul className="text-sm">
                                        {order.items
                                            .filter(item => farmer.productIds?.includes(item.id))
                                            .map(item => <li key={item.cartId}>{item.name} (x{item.quantity})</li>)
                                        }
                                    </ul>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-orange-100 text-orange-800'
                                    }`}>{order.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Farm2FlatView: React.FC<{ farmer: Farmer }> = ({ farmer }) => {
    const farm2FlatOrders = mockOrders.filter(order => 
        order.userId.startsWith('b') && order.items.some(item => farmer.productIds?.includes(item.id))
    );
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Farm2Flat Orders</h1>
            <p className="text-gray-600 mb-6">These are your orders to fulfill for the Farm2Flat platform.</p>
            <TableActionToolbar 
                selectedCount={selected.size}
                onAdd={() => alert('Manual Order')}
                onEdit={() => alert('Edit Order')}
                onView={() => alert('View Details')}
                onDelete={() => {}}
            />
             <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                {farm2FlatOrders.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(farm2FlatOrders.map(o => o.id))} checked={selected.size > 0 && selected.size === farm2FlatOrders.length} /></th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farm2FlatOrders.map(order => (
                                <tr key={order.id} className={`border-b hover:bg-gray-50 ${selected.has(order.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4"><input type="checkbox" checked={selected.has(order.id)} onChange={() => handleSelect(order.id)} /></td>
                                    <td className="p-4">{order.id}</td>
                                    <td className="p-4">{order.date}</td>
                                    <td className="p-4">
                                        <ul className="text-sm">
                                            {order.items
                                                .filter(item => farmer.productIds?.includes(item.id))
                                                .map(item => <li key={item.cartId}>{item.name} (x{item.quantity})</li>)
                                            }
                                        </ul>
                                    </td>
                                    <td className="p-4">{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>No active orders from Farm2Flat at the moment.</p>}
            </div>
        </div>
    );
};

const FinancialsView: React.FC<{ farmer: Farmer }> = ({ farmer }) => (
     <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Financials</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-green-600">Total Revenue</h3>
                <p className="text-4xl font-bold text-gray-800">$12,450.00</p>
                <p className="text-sm text-gray-500">All Time</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-red-500">Total Costs</h3>
                <p className="text-4xl font-bold text-gray-800">$4,820.00</p>
                <p className="text-sm text-gray-500">From Purchases</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-indigo-600">Net Profit</h3>
                <p className="text-4xl font-bold text-gray-800">$7,630.00</p>
                <p className="text-sm text-gray-500">Revenue - Costs</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Profitability per Crop (Placeholder)</h2>
            <p className="text-gray-600">Analytics on revenue and costs per crop type will be displayed here.</p>
        </div>
    </div>
);

const AnalyticsView: React.FC<{ farmer: Farmer }> = ({ farmer }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Analytics & Insights</h1>
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">Detailed reports on sales, customer trends, and crop performance are coming soon.</p>
        </div>
    </div>
);

const FarmProfileView: React.FC<{ farmer: Farmer }> = ({ farmer }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Farm Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
                <div><strong className="text-gray-600">Farm Name:</strong> {farmer.name}</div>
                <div><strong className="text-gray-600">Location:</strong> {farmer.location}</div>
                <div><strong className="text-gray-600">Description:</strong> {farmer.description}</div>
                <div><strong className="text-gray-600">Operating Hours:</strong> {farmer.operatingHours}</div>
                <div><strong className="text-gray-600">Certifications:</strong> {farmer.certifications?.join(', ')}</div>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 mt-4">Edit Profile</button>
            </div>
        </div>
    </div>
);

const StaffManagementView: React.FC<{ staff: StaffMember[] }> = ({ staff }) => {
    const { selected, handleSelect, handleSelectAll } = useTableSelection();
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Staff Management</h1>
            <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(staff.map(s => s.id))} checked={selected.size > 0 && selected.size === staff.length} /></th>
                            <th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map(s => (
                            <tr key={s.id} className={`border-b hover:bg-gray-50 ${selected.has(s.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(s.id)} onChange={() => handleSelect(s.id)} /></td>
                                <td className="p-4">{s.name}</td><td className="p-4">{s.role}</td><td className="p-4">{s.contact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SupplierManagementView: React.FC<{ suppliers: Supplier[] }> = ({ suppliers }) => {
    const { selected, handleSelect, handleSelectAll } = useTableSelection();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Supplier Management</h1>
            <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(suppliers.map(s => s.id))} checked={selected.size > 0 && selected.size === suppliers.length} /></th>
                            <th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Contact Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(s => (
                            <tr key={s.id} className={`border-b hover:bg-gray-50 ${selected.has(s.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(s.id)} onChange={() => handleSelect(s.id)} /></td>
                                <td className="p-4">{s.name}</td><td className="p-4">{s.category}</td><td className="p-4">{s.contactEmail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CustomerManagementView: React.FC<{ customers: Customer[] }> = ({ customers }) => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const { selected, handleSelect, handleSelectAll } = useTableSelection();

    if (selectedCustomer) {
        return (
            <div>
                <button onClick={() => setSelectedCustomer(null)} className="mb-4 text-green-600 hover:underline font-semibold">
                    &larr; Back to all customers
                </button>
                <h1 className="text-3xl font-bold mb-2 text-gray-800">{selectedCustomer.name}</h1>
                <p className="text-gray-500 mb-6">{selectedCustomer.contactEmail}</p>

                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Order History</h2>
                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    {selectedCustomer.orderHistory && selectedCustomer.orderHistory.length > 0 ? (
                         <table className="w-full text-left">
                            <thead>
                                <tr className="border-b"><th className="p-4">Order ID</th><th className="p-4">Date</th><th className="p-4">Total</th><th className="p-4">Status</th></tr>
                            </thead>
                            <tbody>
                                {selectedCustomer.orderHistory.map(o => (
                                    <tr key={o.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{o.id}</td>
                                        <td className="p-4">{o.date}</td>
                                        <td className="p-4">${o.total.toFixed(2)}</td>
                                        <td className="p-4">{o.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p>No order history found for this customer.</p>}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Management</h1>
            <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                     <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(customers.map(c => c.id))} checked={selected.size > 0 && selected.size === customers.length} /></th>
                            <th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Contact Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id} className={`border-b hover:bg-gray-50 cursor-pointer ${selected.has(c.id) ? 'bg-blue-50' : ''}`} onClick={() => !selected.size && setSelectedCustomer(c)}>
                                <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(c.id)} onChange={() => handleSelect(c.id)} /></td>
                                <td className="p-4 font-semibold text-green-700">{c.name}</td>
                                <td className="p-4">{c.type}</td>
                                <td className="p-4">{c.contactEmail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PurchaseManagementView: React.FC<{ purchases: PurchaseOrder[], suppliers: Supplier[] }> = ({ purchases, suppliers }) => {
    const { selected, handleSelect, handleSelectAll } = useTableSelection();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Farm's Purchases</h1>
            <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(purchases.map(p => p.id))} checked={selected.size > 0 && selected.size === purchases.length} /></th>
                            <th className="p-4">PO ID</th><th className="p-4">Date</th><th className="p-4">Supplier</th><th className="p-4">Total</th><th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map(p => {
                            const supplier = suppliers.find(s => s.id === p.supplierId);
                            return (
                                <tr key={p.id} className={`border-b hover:bg-gray-50 ${selected.has(p.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4"><input type="checkbox" checked={selected.has(p.id)} onChange={() => handleSelect(p.id)} /></td>
                                    <td className="p-4">{p.id}</td>
                                    <td className="p-4">{p.date}</td>
                                    <td className="p-4">{supplier?.name || 'N/A'}</td>
                                    <td className="p-4">${p.total.toFixed(2)}</td>
                                    <td className="p-4">{p.status}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// #endregion

export default FarmerView;

import React, { useState, useMemo } from 'react';
import { Business, Product, StaffMember, Supplier, Customer, Order, CartItem, SourcedProduct, PurchaseOrder } from '../types';
import { mockBusinessProducts, mockSourcedProducts, mockBusinessCustomerOrders, mockOrders } from '../mock/data';
import { 
    LogoutIcon, UsersIcon, ChartBarIcon, BoxIcon, ClipboardListIcon, 
    CurrencyDollarIcon, UsersGroupIcon, BuildingStorefrontIcon, ReceiptPercentIcon,
    UploadIcon, FileDownloadIcon, PrinterIcon, HomeModernIcon, ClipboardDocumentDuplicateIcon,
    PlusIcon, PencilIcon, EyeIcon, TrashIcon
} from './Icons';

type BusinessViewType = 
    'DASHBOARD' | 'PRODUCTS' | 'SUPPLIERS' | 'CUSTOMERS' | 
    'ORDERS' | 'PURCHASES' | 'FINANCIALS' | 'STAFF' | 'FARM2FLAT';

interface BusinessViewProps {
  business: Business;
  onLogout: () => void;
}

const BusinessView: React.FC<BusinessViewProps> = ({ business, onLogout }) => {
  const [currentView, setCurrentView] = useState<BusinessViewType>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>(business.products || mockBusinessProducts);

  const addProductToMenu = (product: Product | CartItem | SourcedProduct) => {
    const newProduct: Product = {
        id: `dup-${product.id}-${Date.now()}`,
        name: product.name,
        price: 'costPrice' in product ? (product.sellingPrice || 0) : product.price,
        unit: 'unit' in product ? product.unit || '' : '',
        imageUrl: product.imageUrl,
        farmer: business.name,
        moq: 1,
        isSeasonal: false,
    };
    setProducts(prev => [...prev, newProduct]);
    alert(`"${newProduct.name}" has been duplicated to your product list!`);
  };

  const renderView = () => {
    switch (currentView) {
        case 'DASHBOARD':
            return <DashboardView business={business} />;
        case 'PRODUCTS':
            return <ProductManagementView products={products} setProducts={setProducts} />;
        case 'SUPPLIERS':
            return <SupplierManagementView suppliers={business.suppliers || []} />;
        case 'CUSTOMERS':
            return <CustomerManagementView customers={business.customers || []} />;
        case 'ORDERS':
            return <OrderManagementView />;
        case 'PURCHASES':
            return <PurchaseManagementView purchases={business.purchaseHistory || []} />;
        case 'FARM2FLAT':
            return <Farm2FlatSourcingView onDuplicateProduct={addProductToMenu} />;
        case 'FINANCIALS':
            return <FinancialsView />;
        case 'STAFF':
            return <StaffManagementView staff={business.staff || []} />;
        default:
            return <DashboardView business={business} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-blue-800 text-white p-4 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
            <UsersIcon className="w-8 h-8"/>
            <h2 className="text-2xl font-bold">Business Portal</h2>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <NavItem icon={<ChartBarIcon className="w-5 h-5" />} label="Dashboard" active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} />
            <NavItem icon={<BoxIcon className="w-5 h-5" />} label="My Products / Menu" active={currentView === 'PRODUCTS'} onClick={() => setCurrentView('PRODUCTS')} />
            <NavItem icon={<ClipboardListIcon className="w-5 h-5" />} label="Customer Orders" active={currentView === 'ORDERS'} onClick={() => setCurrentView('ORDERS')} />
            <NavItem icon={<ReceiptPercentIcon className="w-5 h-5" />} label="My Purchases" active={currentView === 'PURCHASES'} onClick={() => setCurrentView('PURCHASES')} />
            <NavItem icon={<HomeModernIcon className="w-5 h-5" />} label="Source from Farm2Flat" active={currentView === 'FARM2FLAT'} onClick={() => setCurrentView('FARM2FLAT')} />
            <NavItem icon={<CurrencyDollarIcon className="w-5 h-5" />} label="Financials" active={currentView === 'FINANCIALS'} onClick={() => setCurrentView('FINANCIALS')} />
            <hr className="border-blue-700 my-2" />
            <NavItem icon={<UsersGroupIcon className="w-5 h-5" />} label="Staff" active={currentView === 'STAFF'} onClick={() => setCurrentView('STAFF')} />
            <NavItem icon={<BuildingStorefrontIcon className="w-5 h-5" />} label="Suppliers" active={currentView === 'SUPPLIERS'} onClick={() => setCurrentView('SUPPLIERS')} />
            <NavItem icon={<UsersIcon className="w-5 h-5" />} label="Customers" active={currentView === 'CUSTOMERS'} onClick={() => setCurrentView('CUSTOMERS')} />
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-blue-700">
            <button onClick={onLogout} className="w-full text-left hover:bg-blue-700 p-2 rounded flex items-center gap-3 text-blue-100 hover:text-white">
                <LogoutIcon className="w-5 h-5" />Logout
            </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {renderView()}
      </main>
    </div>
  );
};

// #region Helper Components

const NavItem: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({ icon, label, active, onClick }) => (
    <li>
        <button onClick={onClick} className={`w-full text-left p-2 rounded flex items-center gap-3 transition-colors ${active ? 'bg-blue-900' : 'hover:bg-blue-700'}`}>
            {icon}
            {label}
        </button>
    </li>
);

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
// #endregion

// #region Views

const DashboardView: React.FC<{ business: Business }> = ({ business }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome, {business.name}!</h1>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
                <p className="text-4xl font-bold text-gray-800">{mockBusinessCustomerOrders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">Monthly Revenue</h3>
                <p className="text-4xl font-bold text-green-600">$1,250.00</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-600">FrescoHub Purchases</h3>
                <p className="text-4xl font-bold text-blue-600">{business.purchaseHistory?.length || 0}</p>
            </div>
        </div>
    </div>
);

const ProductManagementView: React.FC<{ products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>> }> = ({ products, setProducts }) => {
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Menu / Products</h1>
            <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
             <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                             <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(products.map(p => p.id))} checked={selected.size > 0 && selected.size === products.length} /></th>
                             <th className="p-4">Name</th><th className="p-4">Price</th><th className="p-4">Unit</th><th className="p-4">Seasonal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                             <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selected.has(p.id)} onChange={() => handleSelect(p.id)} /></td>
                                <td className="p-4 font-semibold">{p.name}</td>
                                <td className="p-4">${p.price.toFixed(2)}</td>
                                <td className="p-4">{p.unit}</td>
                                <td className="p-4">{p.isSeasonal ? 'Yes' : 'No'}</td>
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
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Suppliers</h1>
             <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
             <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                             <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(suppliers.map(s => s.id))} checked={selected.size > 0 && selected.size === suppliers.length} /></th>
                             <th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(s => (
                             <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selected.has(s.id)} onChange={() => handleSelect(s.id)} /></td>
                                <td className="p-4 font-semibold">{s.name}</td>
                                <td className="p-4">{s.category}</td>
                                <td className="p-4">{s.contactEmail}</td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
     );
};

const CustomerManagementView: React.FC<{ customers: Customer[] }> = ({ customers }) => {
    const { selected, handleSelect, handleSelectAll } = useTableSelection();
     return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Customers</h1>
             <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
             <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                             <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(customers.map(c => c.id))} checked={selected.size > 0 && selected.size === customers.length} /></th>
                             <th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                             <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selected.has(c.id)} onChange={() => handleSelect(c.id)} /></td>
                                <td className="p-4 font-semibold">{c.name}</td>
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

const OrderManagementView: React.FC = () => {
    const { selected, handleSelect, handleSelectAll } = useTableSelection();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Orders</h1>
            <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                         <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(mockBusinessCustomerOrders.map(o => o.id))} checked={selected.size > 0 && selected.size === mockBusinessCustomerOrders.length} /></th>
                            <th className="p-4">Order ID</th><th className="p-4">Date</th><th className="p-4">Total</th><th className="p-4">Status</th>
                         </tr>
                    </thead>
                    <tbody>
                        {mockBusinessCustomerOrders.map(o => (
                            <tr key={o.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selected.has(o.id)} onChange={() => handleSelect(o.id)} /></td>
                                <td className="p-4">{o.id}</td>
                                <td className="p-4">{o.date}</td>
                                <td className="p-4">${o.total.toFixed(2)}</td>
                                <td className="p-4">{o.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PurchaseManagementView: React.FC<{ purchases: Order[] }> = ({ purchases }) => {
    const { selected, handleSelect, handleSelectAll } = useTableSelection();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Purchase History</h1>
             <TableActionToolbar selectedCount={selected.size} onAdd={()=>{}} onEdit={()=>{}} onView={()=>{}} onDelete={()=>{}} />
             <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                         <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(purchases.map(o => o.id))} checked={selected.size > 0 && selected.size === purchases.length} /></th>
                            <th className="p-4">Order ID</th><th className="p-4">Date</th><th className="p-4">Total</th><th className="p-4">Status</th>
                         </tr>
                    </thead>
                    <tbody>
                        {purchases.map(o => (
                            <tr key={o.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selected.has(o.id)} onChange={() => handleSelect(o.id)} /></td>
                                <td className="p-4">{o.id}</td>
                                <td className="p-4">{o.date}</td>
                                <td className="p-4">${o.total.toFixed(2)}</td>
                                <td className="p-4">{o.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Farm2FlatSourcingView: React.FC<{ onDuplicateProduct: (p: SourcedProduct) => void }> = ({ onDuplicateProduct }) => {
    const publishedProducts = mockSourcedProducts.filter(p => p.publishStatus === 'published' && p.publishTarget?.includes('wholesale'));
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Source from Farm2Flat</h1>
            <p className="text-gray-600 mb-6">Browse and order wholesale produce directly from our network of local farmers.</p>
             <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Product</th>
                            <th className="p-4">Supplier</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Unit</th>
                            <th className="p-4">MOQ</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {publishedProducts.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-semibold">{p.name}</td>
                                <td className="p-4">{p.supplierName}</td>
                                <td className="p-4 text-green-700 font-bold">${p.sellingPrice?.toFixed(2)}</td>
                                <td className="p-4">{p.unit}</td>
                                <td className="p-4">{p.moq || 1}</td>
                                <td className="p-4">
                                    <button onClick={() => onDuplicateProduct(p)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-semibold">
                                        <ClipboardDocumentDuplicateIcon className="w-4 h-4" /> Add to Menu
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FinancialsView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Financials</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">Financial reports and statements will appear here.</p>
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
                             <tr key={s.id} className="border-b hover:bg-gray-50">
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

export default BusinessView;
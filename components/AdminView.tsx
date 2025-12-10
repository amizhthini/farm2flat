
import React, { useState, useMemo } from 'react';
import { mockPortalUsers, mockUser, mockDrivers, mockVehicles, mockRoutes, mockSeasonalTrends, mockCampaigns, mockTickets, mockFarmers, mockSourcedProducts, mockSubscriptionBoxes, mockPayments, mockInvoices, mockOrders, mockProducts } from '../mock/data';
import { SourcedProduct, SubscriptionBox, Payment, Invoice, User, Order, Product, Ticket } from '../types';
import { 
    TruckIcon, CalendarDaysIcon, ChartBarIcon, MegaphoneIcon, 
    ExclamationTriangleIcon, LogoutIcon, SparklesIcon, BuildingOffice2Icon,
    CubeTransparentIcon, CheckBadgeIcon, ArchiveBoxIcon, CreditCardIcon, DocumentTextIcon, BuildingStorefrontIcon,
    ShoppingBagIcon, UserIcon, ArrowPathRoundedSquareIcon, RocketLaunchIcon, ClipboardListIcon,
    UploadIcon, PlusIcon, PencilIcon, EyeIcon, TrashIcon
} from './Icons';

type AdminViewType = 
    'RETAIL_CUSTOMERS' | 'SUBSCRIBERS' | 'BUSINESS_CUSTOMERS' |
    'SUPPLIERS' | 'SUPPLIES_CURATION' | 'PRODUCT_PUBLISHING' |
    'PUBLISHED_RETAIL' | 'PUBLISHED_WHOLESALE' | 'SUBSCRIPTIONS' |
    'RETAIL_ORDERS' |
    'PAYMENTS' | 'INVOICES' |
    'LOGISTICS' | 'SEASONALITY' | 'ANALYTICS' | 'MARKETING' | 'DISPUTES';

interface AdminViewProps {
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<AdminViewType>('PRODUCT_PUBLISHING');
  const [sourcedProducts, setSourcedProducts] = useState<SourcedProduct[]>(mockSourcedProducts);
  const [subscriptionBoxes, setSubscriptionBoxes] = useState<SubscriptionBox[]>(mockSubscriptionBoxes);
  const [publishingFilter, setPublishingFilter] = useState<string[] | null>(null);


  const handlePublishProduct = (productId: string, sellingPrice: number, publishTarget: ('retail' | 'wholesale')[], availableQuantity: number, moq?: number) => {
      setSourcedProducts(prevProducts =>
          prevProducts.map(p =>
              p.id === productId
                  ? { ...p, sellingPrice, publishTarget, publishStatus: 'published', availableQuantity, moq }
                  : p
          )
      );
  };

  const handlePushToPublish = (productIds: string[]) => {
    setPublishingFilter(productIds);
    setCurrentView('PRODUCT_PUBLISHING');
  };


  const renderView = () => {
    switch (currentView) {
      // Customer Management
      case 'RETAIL_CUSTOMERS': return <RetailCustomersView />;
      case 'SUBSCRIBERS': return <SubscribersView />;
      case 'BUSINESS_CUSTOMERS': return <BusinessCustomersView />;

      // Sourcing & Publishing
      case 'SUPPLIERS': return <SupplierManagementView />;
      case 'SUPPLIES_CURATION': return <SuppliesCurationView products={sourcedProducts} setSourcedProducts={setSourcedProducts} onPushToPublish={handlePushToPublish} />;
      case 'PRODUCT_PUBLISHING':
        let productsToPublish: SourcedProduct[];
        if (publishingFilter) {
            productsToPublish = sourcedProducts.filter(p => publishingFilter.includes(p.id));
        } else {
            productsToPublish = sourcedProducts.filter(p => p.publishStatus === 'unpublished');
        }

        return (
          <ProductPublishingView
            products={productsToPublish}
            allProducts={sourcedProducts}
            onPublish={handlePublishProduct}
            isFiltered={!!publishingFilter}
            onClearFilter={() => setPublishingFilter(null)}
          />
        );
      case 'PUBLISHED_RETAIL': return <PublishedProductsView title="Published Products (Retail)" products={sourcedProducts.filter(p => p.publishStatus === 'published' && p.publishTarget?.includes('retail'))} />;
      case 'PUBLISHED_WHOLESALE': return <PublishedProductsView title="Published Products (Wholesale)" products={sourcedProducts.filter(p => p.publishStatus === 'published' && p.publishTarget?.includes('wholesale'))} />;
      
      // Sales & Fulfillment
      case 'RETAIL_ORDERS': return <RetailOrdersView />;
      case 'SUBSCRIPTIONS': return <SubscriptionBoxManagementView boxes={subscriptionBoxes} />;
      case 'LOGISTICS': return <LogisticsManagementView />;
      case 'DISPUTES': return <DisputeManagementView />;

      // Growth & Finance
      case 'PAYMENTS': return <PaymentsView />;
      case 'INVOICES': return <InvoicesView />;
      case 'MARKETING': return <MarketingView />;
      case 'ANALYTICS': return <AnalyticsView />;
      
      // Intelligence
      case 'SEASONALITY': return <SeasonalityView />;
      
      default: return <ProductPublishingView products={sourcedProducts.filter(p => p.publishStatus === 'unpublished')} allProducts={sourcedProducts} onPublish={handlePublishProduct} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col h-screen sticky top-0 overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold mb-6">Farm2Flat Admin</h2>
        
        <div className="space-y-6 flex-grow">
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-2">Sourcing & Publishing</p>
                <nav>
                    <ul className="space-y-1">
                        <NavItem icon={<BuildingOffice2Icon className="w-5 h-5"/>} label="Supplier Management" active={currentView === 'SUPPLIERS'} onClick={() => setCurrentView('SUPPLIERS')} />
                        <NavItem icon={<ShoppingBagIcon className="w-5 h-5"/>} label="Supplies & Curation" active={currentView === 'SUPPLIES_CURATION'} onClick={() => setCurrentView('SUPPLIES_CURATION')} />
                        <NavItem icon={<RocketLaunchIcon className="w-5 h-5"/>} label="Product Publishing" active={currentView === 'PRODUCT_PUBLISHING'} onClick={() => { setPublishingFilter(null); setCurrentView('PRODUCT_PUBLISHING'); }} />
                        <NavItem icon={<CheckBadgeIcon className="w-5 h-5"/>} label="Published (Retail)" active={currentView === 'PUBLISHED_RETAIL'} onClick={() => setCurrentView('PUBLISHED_RETAIL')} />
                        <NavItem icon={<BuildingStorefrontIcon className="w-5 h-5"/>} label="Published (Wholesale)" active={currentView === 'PUBLISHED_WHOLESALE'} onClick={() => setCurrentView('PUBLISHED_WHOLESALE')} />
                    </ul>
                </nav>
            </div>

            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-2">Sales & Fulfillment</p>
                <nav>
                <ul className="space-y-1">
                    <NavItem icon={<ClipboardListIcon className="w-5 h-5"/>} label="Retail Orders" active={currentView === 'RETAIL_ORDERS'} onClick={() => setCurrentView('RETAIL_ORDERS')} />
                    <NavItem icon={<ArchiveBoxIcon className="w-5 h-5"/>} label="Subscription Boxes" active={currentView === 'SUBSCRIPTIONS'} onClick={() => setCurrentView('SUBSCRIPTIONS')} />
                    <NavItem icon={<TruckIcon className="w-5 h-5"/>} label="Hub & Logistics" active={currentView === 'LOGISTICS'} onClick={() => setCurrentView('LOGISTICS')} />
                    <NavItem icon={<ExclamationTriangleIcon className="w-5 h-5"/>} label="Dispute Mgmt" active={currentView === 'DISPUTES'} onClick={() => setCurrentView('DISPUTES')} />
                </ul>
                </nav>
            </div>

            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-2">Customers</p>
                <nav>
                <ul className="space-y-1">
                    <NavItem icon={<UserIcon className="w-5 h-5"/>} label="Retail Customers" active={currentView === 'RETAIL_CUSTOMERS'} onClick={() => setCurrentView('RETAIL_CUSTOMERS')} />
                    <NavItem icon={<ArrowPathRoundedSquareIcon className="w-5 h-5"/>} label="Subscribers" active={currentView === 'SUBSCRIBERS'} onClick={() => setCurrentView('SUBSCRIBERS')} />
                    <NavItem icon={<BuildingStorefrontIcon className="w-5 h-5"/>} label="Business Customers" active={currentView === 'BUSINESS_CUSTOMERS'} onClick={() => setCurrentView('BUSINESS_CUSTOMERS')} />
                </ul>
                </nav>
            </div>

            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-2">Growth & Finance</p>
                <nav>
                <ul className="space-y-1">
                    <NavItem icon={<CreditCardIcon className="w-5 h-5"/>} label="Payments" active={currentView === 'PAYMENTS'} onClick={() => setCurrentView('PAYMENTS')} />
                    <NavItem icon={<DocumentTextIcon className="w-5 h-5"/>} label="Invoices" active={currentView === 'INVOICES'} onClick={() => setCurrentView('INVOICES')} />
                    <NavItem icon={<MegaphoneIcon className="w-5 h-5"/>} label="Marketing" active={currentView === 'MARKETING'} onClick={() => setCurrentView('MARKETING')} />
                    <NavItem icon={<ChartBarIcon className="w-5 h-5"/>} label="Analytics & Reports" active={currentView === 'ANALYTICS'} onClick={() => setCurrentView('ANALYTICS')} />
                    <NavItem icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Seasonality Intel" active={currentView === 'SEASONALITY'} onClick={() => setCurrentView('SEASONALITY')} />
                </ul>
                </nav>
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
             <button onClick={onLogout} className="w-full text-left hover:bg-gray-700 p-2 rounded flex items-center gap-3 text-red-300 hover:text-red-200"><LogoutIcon className="w-5 h-5"/>Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {renderView()}
      </main>
    </div>
  );
};

// #region Reusable Components
const NavItem: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({ icon, label, active, onClick }) => (
    <li>
        <button onClick={onClick} className={`w-full text-left p-2 rounded flex items-center gap-3 transition-colors text-sm ${active ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            {icon}
            {label}
        </button>
    </li>
);

const AiInsight: React.FC<{ title: string, content: string }> = ({ title, content }) => (
    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 mt-4">
        <h3 className="font-bold text-indigo-800 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" />
            AI Insight: {title}
        </h3>
        <p className="text-indigo-700 mt-1 text-sm">{content}</p>
    </div>
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

// Generic hook to handle table selection
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

// Customer Views
const RetailCustomersView: React.FC = () => {
    const [retailUsers, setRetailUsers] = useState<User[]>([mockUser]);
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleDelete = () => {
        if (confirm(`Delete ${selected.size} items?`)) {
            setRetailUsers(prev => prev.filter(u => !selected.has(u.id)));
            setSelected(new Set());
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Retail Customers</h1>
            <TableActionToolbar 
                selectedCount={selected.size} 
                onAdd={() => alert('Manual Add Customer Modal')}
                onEdit={() => alert('Edit Customer Modal')}
                onView={() => alert('View Customer Details Modal')}
                onDelete={handleDelete}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b">
                        <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(retailUsers.map(u => u.id))} checked={selected.size > 0 && selected.size === retailUsers.length} /></th>
                        <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Order Count</th><th className="p-4">Lifetime Value</th>
                    </tr></thead>
                    <tbody>
                        {retailUsers.map(user => (
                            <tr key={user.id} className={`border-b hover:bg-gray-50 ${selected.has(user.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(user.id)} onChange={() => handleSelect(user.id)} /></td>
                                <td className="p-4 font-semibold">{user.name}</td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4 text-center">{user.orderHistory.length}</td>
                                <td className="p-4 font-bold text-right">${user.lifetimeValue?.toFixed(2) || '0.00'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AiInsight title="High-Value Customer" content="Jane Doe has a high lifetime value. Consider sending a personalized thank-you offer to boost loyalty and retention." />
        </div>
    );
};

const SubscribersView: React.FC = () => {
    const [subscribers, setSubscribers] = useState([mockUser].filter(u => 
        u.orderHistory.some(o => o.items.some(i => i.type === 'subscription'))
    ));
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleDelete = () => {
        if(confirm(`Remove ${selected.size} subscribers?`)) {
            setSubscribers(prev => prev.filter(s => !selected.has(s.id)));
            setSelected(new Set());
        }
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Subscribers</h1>
            <TableActionToolbar 
                selectedCount={selected.size} 
                onAdd={() => alert('Add Subscriber')}
                onEdit={() => alert('Edit Subscription')}
                onView={() => alert('View Subscription Details')}
                onDelete={handleDelete}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b">
                        <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(subscribers.map(u => u.id))} checked={selected.size > 0 && selected.size === subscribers.length} /></th>
                        <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Active Subscriptions</th>
                    </tr></thead>
                    <tbody>
                        {subscribers.length > 0 ? subscribers.map(user => {
                            const subs = user.orderHistory.flatMap(o => o.items).filter(i => i.type === 'subscription');
                            return (
                                <tr key={user.id} className={`border-b hover:bg-gray-50 ${selected.has(user.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4"><input type="checkbox" checked={selected.has(user.id)} onChange={() => handleSelect(user.id)} /></td>
                                    <td className="p-4 font-semibold">{user.name}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <ul className="list-disc list-inside text-sm">
                                            {subs.map(s => <li key={s.cartId}>{s.name} ({s.isTrial ? 'Trial' : s.frequency})</li>)}
                                        </ul>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={4} className="p-4 text-center text-gray-500">No active subscribers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BusinessCustomersView: React.FC = () => {
    const [businessUsers, setBusinessUsers] = useState(mockPortalUsers.filter(u => u.role === 'business'));
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleDelete = () => {
        if(confirm(`Remove ${selected.size} businesses?`)) {
            setBusinessUsers(prev => prev.filter(u => !selected.has(u.id)));
            setSelected(new Set());
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Business Customers</h1>
            <TableActionToolbar 
                selectedCount={selected.size} 
                onAdd={() => alert('Add Business Customer')}
                onEdit={() => alert('Edit Business Details')}
                onView={() => alert('View Business Profile')}
                onDelete={handleDelete}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b">
                        <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(businessUsers.map(u => u.id))} checked={selected.size > 0 && selected.size === businessUsers.length} /></th>
                        <th className="p-4">Business Name</th><th className="p-4">Contact Email</th><th className="p-4">Total Purchases (Simulated)</th>
                    </tr></thead>
                    <tbody>
                        {businessUsers.map(user => (
                            <tr key={user.id} className={`border-b hover:bg-gray-50 ${selected.has(user.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(user.id)} onChange={() => handleSelect(user.id)} /></td>
                                <td className="p-4 font-semibold">{user.name}</td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4 font-bold text-center">5</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Sourcing & Publishing Views
const SuppliesCurationView: React.FC<{ 
    products: SourcedProduct[], 
    setSourcedProducts: React.Dispatch<React.SetStateAction<SourcedProduct[]>>,
    onPushToPublish: (productIds: string[]) => void
}> = ({ products, setSourcedProducts, onPushToPublish }) => {
    
    const [filters, setFilters] = useState({ name: '', category: 'all', supplier: 'all', unit: 'all' });
    const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState<Record<string, Partial<SourcedProduct>>>({});

    const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
    const suppliers = useMemo(() => [...new Set(products.map(p => p.supplierName).filter(Boolean))], [products]);
    const units = useMemo(() => [...new Set(products.map(p => p.unit).filter(Boolean))], [products]);
    
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(filters.name.toLowerCase()) || (p.baseProductName || '').toLowerCase().includes(filters.name.toLowerCase());
            const categoryMatch = filters.category === 'all' || p.category === filters.category;
            const supplierMatch = filters.supplier === 'all' || p.supplierName === filters.supplier;
            const unitMatch = filters.unit === 'all' || p.unit === filters.unit;
            return nameMatch && categoryMatch && supplierMatch && unitMatch;
        });
    }, [products, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadedFiles(e.target.files);
    };

    const handleAnalyzeAndAdd = () => {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            alert('Please select at least one file to upload.');
            return;
        }
        const newProducts: SourcedProduct[] = [
            { id: `sp_new_${Date.now()}`, name: 'Kale', baseProductName: 'Kale', supplierId: 'f3', supplierName: 'Riverbend Gardens', costPrice: 2.20, unit: 'bunch', imageUrl: 'https://picsum.photos/id/500/400/300', category: 'Vegetable', publishStatus: 'unpublished', availableQuantity: 100 },
            { id: `sp_new_${Date.now()+1}`, name: 'Organic Blueberries', baseProductName: 'Blueberries', supplierId: 'f2', supplierName: 'Sunnyvale Orchards', costPrice: 4.50, unit: 'pint', imageUrl: 'https://picsum.photos/id/1083/400/300', category: 'Fruit', publishStatus: 'unpublished', availableQuantity: 80 },
        ];
        
        setSourcedProducts(prev => [...prev, ...newProducts]);
        alert(`${uploadedFiles.length} file(s) analyzed and new products have been added to the table.`);
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setUploadedFiles(null);
    };

    const cheapestProductsMap = useMemo(() => {
        const groups: { [key: string]: SourcedProduct[] } = {};
        filteredProducts.forEach(p => {
            const key = p.baseProductName || p.name;
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });

        const cheapestMap = new Map<string, SourcedProduct>();
        Object.values(groups).forEach(group => {
            if (group.length > 0) {
                const cheapest = group.reduce((min, p) => p.costPrice < min.costPrice ? p : min, group[0]);
                cheapestMap.set(cheapest.baseProductName || cheapest.name, cheapest);
            }
        });
        return cheapestMap;
    }, [filteredProducts]);

    const processedProducts = useMemo(() => {
        const sorted = [...filteredProducts].sort((a, b) => {
            const nameA = a.baseProductName || a.name;
            const nameB = b.baseProductName || b.name;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return a.costPrice - b.costPrice;
        });

        const seenCategories = new Set<string>();
        return sorted.map(p => {
            const category = p.baseProductName || p.name;
            const isFirst = !seenCategories.has(category);
            if (isFirst) seenCategories.add(category);
            return { ...p, isFirstInCategory: isFirst };
        });
    }, [filteredProducts]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProducts(new Set(processedProducts.map(p => p.id)));
        } else {
            setSelectedProducts(new Set());
        }
    };

    const handleSelectProduct = (productId: string, isSelected: boolean) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(productId);
            else newSet.delete(productId);
            return newSet;
        });
    };
    
    const handleEdit = (productId: string, field: keyof SourcedProduct, value: string | number) => {
        setEditedData(prev => ({
            ...prev,
            [productId]: { ...prev[productId], [field]: value }
        }));
    };
    
    const handleSaveChanges = () => {
        const updatedProducts = products.map(p => {
            const edits = editedData[p.id];
            if (edits) {
                const updatedProduct = { ...p, ...edits };
                if (edits.costPrice) updatedProduct.costPrice = Number(edits.costPrice);
                return updatedProduct;
            }
            return p;
        });
        setSourcedProducts(updatedProducts);
        setEditedData({});
        setEditMode(false);
    };

    const handleCancelEdit = () => {
        setEditedData({});
        setEditMode(false);
    };
    
    const handlePushSelected = () => {
        if (selectedProducts.size === 0) {
            alert('Please select products to push.');
            return;
        }
        onPushToPublish(Array.from(selectedProducts));
        setSelectedProducts(new Set());
    };

    const handleDeleteSelected = () => {
        if (confirm(`Delete ${selectedProducts.size} items?`)) {
            setSourcedProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
            setSelectedProducts(new Set());
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Supplies & Product Curation</h1>
            <p className="text-gray-600 mb-6">Analyze product offerings from all suppliers to make the best procurement decisions.</p>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Upload & Analyze Supplier Lists</h3>
                <div className="flex items-center gap-4">
                    <input id="file-upload-input" type="file" multiple onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    <button onClick={handleAnalyzeAndAdd} disabled={!uploadedFiles || uploadedFiles.length === 0} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <SparklesIcon className="w-5 h-5" /> Analyze & Add
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Upload supplier price lists (e.g., CSV) to analyze and add them to the curation table below.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" name="name" placeholder="Filter by name..." value={filters.name} onChange={handleFilterChange} className="p-2 border rounded-md" />
                    <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2 border rounded-md bg-white">
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="supplier" value={filters.supplier} onChange={handleFilterChange} className="p-2 border rounded-md bg-white">
                        <option value="all">All Suppliers</option>
                        {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="unit" value={filters.unit} onChange={handleFilterChange} className="p-2 border rounded-md bg-white">
                        <option value="all">All Units</option>
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {editMode ? (
                        <>
                            <button onClick={handleSaveChanges} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Save Changes</button>
                            <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setEditMode(true)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600">Enable Manual Adjustments</button>
                    )}
                    {selectedProducts.size > 0 && (
                        <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2">
                            <TrashIcon className="w-5 h-5" /> Delete ({selectedProducts.size})
                        </button>
                    )}
                </div>
                <button onClick={handlePushSelected} disabled={selectedProducts.size === 0 || editMode} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Push Selected to Publishing ({selectedProducts.size})
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.size > 0 && selectedProducts.size === processedProducts.length} className="h-4 w-4" /></th>
                            <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                            <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                            <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                            <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                            <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Cheapest Price</th>
                            <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-indigo-500" /> AI Insight</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {processedProducts.map((item) => {
                            const category = item.baseProductName || item.name;
                            const cheapest = cheapestProductsMap.get(category);
                            const isSelected = selectedProducts.has(item.id);
                            const currentItem = editedData[item.id] ? { ...item, ...editedData[item.id] } : item;

                            return (
                                <tr key={item.id} className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                    <td className="p-4"><input type="checkbox" checked={isSelected} onChange={e => handleSelectProduct(item.id, e.target.checked)} className="h-4 w-4" /></td>
                                    <td className="p-2">{editMode ? <input type="text" value={currentItem.name} onChange={e => handleEdit(item.id, 'name', e.target.value)} className="p-1 border rounded-md bg-white w-full"/> : item.name}</td>
                                    <td className="p-2 text-gray-600">{editMode ? <input type="text" value={currentItem.supplierName} onChange={e => handleEdit(item.id, 'supplierName', e.target.value)} className="p-1 border rounded-md bg-white w-full"/> : item.supplierName}</td>
                                    <td className="p-2 font-mono font-semibold">{editMode ? <input type="number" step="0.01" value={currentItem.costPrice} onChange={e => handleEdit(item.id, 'costPrice', e.target.value)} className="p-1 border rounded-md bg-white w-full"/> : `$${item.costPrice.toFixed(2)}`}</td>
                                    <td className="p-2 text-gray-500">{editMode ? <input type="text" value={currentItem.unit} onChange={e => handleEdit(item.id, 'unit', e.target.value)} className="p-1 border rounded-md bg-white w-full"/> : item.unit}</td>
                                    <td className="p-4 font-semibold">{item.isFirstInCategory && cheapest ? <span className="text-green-700 bg-green-100 px-2 py-1 rounded">${cheapest.costPrice.toFixed(2)} ({cheapest.supplierName})</span> : '—'}</td>
                                    <td className="p-4">{item.isFirstInCategory && cheapest ? <div className="text-indigo-700"><span className="font-bold">{cheapest.supplierName}</span> offers the lowest price for {category}.</div> : '—' }</td>
                                </tr>
                            );
                        })}
                         {filteredProducts.length === 0 && (
                            <tr><td colSpan={8} className="text-center p-8 text-gray-500">No products match the current filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProductPublishingView: React.FC<{
    products: SourcedProduct[];
    allProducts: SourcedProduct[];
    onPublish: (id: string, price: number, target: ('retail' | 'wholesale')[], qty: number, moq?: number) => void;
    isFiltered?: boolean;
    onClearFilter?: () => void;
}> = ({ products, allProducts, onPublish, isFiltered, onClearFilter }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Publishing</h1>
             {isFiltered && (
                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 flex justify-between items-center">
                     <p className="text-yellow-700">Filtering by specific products pushed from curation.</p>
                     <button onClick={onClearFilter} className="text-sm underline text-yellow-800 hover:text-yellow-900">Clear Filter</button>
                 </div>
             )}
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">Product</th>
                            <th className="p-4">Supplier</th>
                            <th className="p-4">Cost Price</th>
                            <th className="p-4">Suggested Price (Markup)</th>
                            <th className="p-4">Publish Target</th>
                            <th className="p-4">Avail Qty / MOQ</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? products.map(p => (
                            <ProductPublishRow key={p.id} product={p} onPublish={onPublish} />
                        )) : (
                             <tr><td colSpan={7} className="p-4 text-center text-gray-500">No products waiting to be published. Go to 'Supplies & Curation' to source more.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             <AiInsight title="Market Opportunity" content="Retail prices for 'Organic Kale' have risen by 10% in the local market. You can safely increase your margin to 60%." />
        </div>
    );
};

const ProductPublishRow: React.FC<{
    product: SourcedProduct;
    onPublish: (id: string, price: number, target: ('retail' | 'wholesale')[], qty: number, moq?: number) => void;
}> = ({ product, onPublish }) => {
    const [price, setPrice] = useState<number>(Number((product.costPrice * 1.4).toFixed(2))); // Default 40% margin
    const [targets, setTargets] = useState<('retail' | 'wholesale')[]>(['retail']);
    const [qty, setQty] = useState<number>(product.availableQuantity || 0);
    const [moq, setMoq] = useState<number>(1);

    const handleTargetChange = (target: 'retail' | 'wholesale') => {
        setTargets(prev => prev.includes(target) ? prev.filter(t => t !== target) : [...prev, target]);
    };
    
    const margin = ((price - product.costPrice) / product.costPrice) * 100;

    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-4 font-semibold">{product.name}</td>
            <td className="p-4">{product.supplierName}</td>
            <td className="p-4">${product.costPrice.toFixed(2)}</td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="w-20 p-1 border rounded" />
                    <span className={`text-xs font-bold ${margin < 30 ? 'text-orange-500' : 'text-green-600'}`}>({margin.toFixed(0)}%)</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex flex-col gap-1">
                    <label className="inline-flex items-center">
                        <input type="checkbox" checked={targets.includes('retail')} onChange={() => handleTargetChange('retail')} className="form-checkbox h-4 w-4 text-green-600"/>
                        <span className="ml-2 text-sm">Retail</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="checkbox" checked={targets.includes('wholesale')} onChange={() => handleTargetChange('wholesale')} className="form-checkbox h-4 w-4 text-green-600"/>
                        <span className="ml-2 text-sm">Wholesale</span>
                    </label>
                </div>
            </td>
            <td className="p-4">
                 <div className="flex flex-col gap-1">
                    <label className="flex items-center text-xs text-gray-500">
                        Qty: <input type="number" value={qty} onChange={e => setQty(parseInt(e.target.value))} className="ml-1 w-16 p-1 border rounded text-black" />
                    </label>
                     <label className="flex items-center text-xs text-gray-500">
                        MOQ: <input type="number" value={moq} onChange={e => setMoq(parseInt(e.target.value))} className="ml-1 w-16 p-1 border rounded text-black" />
                    </label>
                </div>
            </td>
            <td className="p-4">
                <button 
                    onClick={() => onPublish(product.id, price, targets, qty, moq)} 
                    disabled={targets.length === 0}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
                >
                    Publish
                </button>
            </td>
        </tr>
    );
};


const SupplierManagementView: React.FC = () => {
    const [farmers, setFarmers] = useState(mockFarmers);
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleDelete = () => {
        if(confirm(`Delete ${selected.size} suppliers?`)) {
            setFarmers(prev => prev.filter(f => !selected.has(f.id)));
            setSelected(new Set());
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Supplier / Farmer Management</h1>
            <TableActionToolbar 
                selectedCount={selected.size} 
                onAdd={() => alert('Add Supplier')}
                onEdit={() => alert('Edit Supplier')}
                onView={() => alert('View Supplier Profile')}
                onDelete={handleDelete}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(farmers.map(f => f.id))} checked={selected.size > 0 && selected.size === farmers.length} /></th>
                            <th className="p-4">Supplier Name</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Specialty</th>
                            <th className="p-4">AI Performance Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farmers.map(farmer => (
                            <tr key={farmer.id} className={`border-b hover:bg-gray-50 ${selected.has(farmer.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(farmer.id)} onChange={() => handleSelect(farmer.id)} /></td>
                                <td className="p-4 font-semibold">{farmer.name}</td>
                                <td className="p-4">{farmer.location}</td>
                                <td className="p-4">{farmer.specialty.join(', ')}</td>
                                <td className="p-4 font-bold text-center">{farmer.performanceScore || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AiInsight title="Supplier Reliability" content="Sunnyvale Orchards (Score: 95) consistently delivers high-quality produce on time. Prioritize procurement from them for key fruit products." />
        </div>
    );
};

const PublishedProductsView: React.FC<{ title: string, products: SourcedProduct[] }> = ({ title, products }) => {
    const { selected, handleSelect, handleSelectAll } = useTableSelection();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-6 -mt-4">This is the final list of products available to customers on this channel.</p>
            <TableActionToolbar 
                selectedCount={selected.size} 
                onAdd={() => alert('Manually Add Published Product')}
                onEdit={() => alert('Edit Published Product')}
                onView={() => alert('View Product Details')}
                onDelete={() => alert('Delete/Unpublish functionality would trigger here')}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(products.map(p => p.id))} checked={selected.size > 0 && selected.size === products.length} /></th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Supplier</th>
                            <th className="p-4">Cost Price</th>
                            <th className="p-4">Selling Price</th>
                            <th className="p-4">Unit</th>
                            <th className="p-4">Avail. Qty</th>
                            <th className="p-4">MOQ</th>
                            <th className="p-4">Margin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className={`border-b hover:bg-gray-50 ${selected.has(product.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(product.id)} onChange={() => handleSelect(product.id)} /></td>
                                <td className="p-4 font-semibold">{product.name}</td>
                                <td className="p-4">{product.supplierName}</td>
                                <td className="p-4">${product.costPrice.toFixed(2)}</td>
                                <td className="p-4 font-bold text-gray-800">${product.sellingPrice?.toFixed(2)}</td>
                                <td className="p-4">{product.unit}</td>
                                <td className="p-4 font-bold">
                                    {product.availableQuantity !== undefined && product.availableQuantity < 10 && (
                                        <div className={`flex items-center gap-2 ${product.availableQuantity === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                            <ExclamationTriangleIcon className="w-5 h-5"/>
                                            <span>{product.availableQuantity}</span>
                                        </div>
                                    )}
                                    {product.availableQuantity !== undefined && product.availableQuantity >= 10 && (
                                        <span>{product.availableQuantity}</span>
                                    )}
                                </td>
                                <td className="p-4">{product.moq || '-'}</td>
                                <td className="p-4 font-semibold text-green-700">
                                    {product.sellingPrice ? `${(((product.sellingPrice - product.costPrice) / product.costPrice) * 100).toFixed(0)}%` : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AiInsight title="Pricing Optimization" content="The current 40% margin on 'Organic Carrots' is below the category average of 55%. Consider a price increase to $2.79 to improve profitability without significantly impacting demand." />
        </div>
    );
};


// Sales & Fulfillment Views
const RetailOrdersView: React.FC = () => {
    const [retailOrders, setRetailOrders] = useState(mockOrders.filter(o => o.userId.startsWith('u')));
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleDelete = () => {
        if(confirm(`Delete ${selected.size} orders?`)) {
            setRetailOrders(prev => prev.filter(o => !selected.has(o.id)));
            setSelected(new Set());
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Retail Orders Management</h1>
            <TableActionToolbar 
                selectedCount={selected.size} 
                onAdd={() => alert('Create Manual Order')}
                onEdit={() => alert('Edit Order')}
                onView={() => alert('View Order Details')}
                onDelete={handleDelete}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(retailOrders.map(o => o.id))} checked={selected.size > 0 && selected.size === retailOrders.length} /></th>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Order Type</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {retailOrders.map(order => {
                            const user = order.userId === mockUser.id ? mockUser : null;
                            return (
                                <tr key={order.id} className={`border-b hover:bg-gray-50 ${selected.has(order.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4"><input type="checkbox" checked={selected.has(order.id)} onChange={() => handleSelect(order.id)} /></td>
                                    <td className="p-4 font-mono text-sm">{order.id}</td>
                                    <td className="p-4">{order.date}</td>
                                    <td className="p-4">{user?.name || 'N/A'}</td>
                                    <td className="p-4 font-bold">${order.total.toFixed(2)}</td>
                                    <td className="p-4">{order.orderType === 'subscription' ? 'Subscription' : 'One-Time'}</td>
                                    <td className="p-4"><span className={`capitalize px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{order.paymentStatus}</span></td>
                                    <td className="p-4"><span className={`capitalize px-2 py-0.5 rounded-full text-xs ${order.status === 'Delivered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{order.status}</span></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <AiInsight title="Demand Spike Detected" content="There is a 40% increase in orders containing 'Heirloom Tomatoes' for the next delivery window. Ensure sufficient stock is allocated from Sunnyvale Orchards to meet demand." />
        </div>
    );
};

const SubscriptionBoxManagementView: React.FC<{ boxes: SubscriptionBox[] }> = ({ boxes }) => {
    const [selectedBox, setSelectedBox] = useState<SubscriptionBox | null>(boxes[0]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Subscription Box Management</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/3">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-bold">Select a Box</h2>
                            <button className="text-green-600 hover:bg-green-100 p-1 rounded"><PlusIcon className="w-5 h-5"/></button>
                        </div>
                        <ul className="space-y-2">
                           {boxes.map(box => (
                               <li key={box.id}>
                                   <button 
                                        onClick={() => setSelectedBox(box)}
                                        className={`w-full text-left p-3 rounded-md transition-colors ${selectedBox?.id === box.id ? 'bg-indigo-100 text-indigo-800 font-bold' : 'hover:bg-gray-100'}`}
                                    >
                                        {box.type} Box ({box.size})
                                   </button>
                               </li>
                           ))}
                        </ul>
                    </div>
                </aside>
                <main className="flex-1">
                    {selectedBox ? (
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">{selectedBox.type} Box ({selectedBox.size})</h2>
                                    <p className="text-gray-600">Current Delivery Cycle Contents</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded"><PencilIcon className="w-5 h-5"/></button>
                                    <button className="text-red-600 hover:bg-red-50 p-2 rounded"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {selectedBox.currentContents?.map(productId => {
                                    const product = mockProducts.find(p => p.id === productId);
                                    return product ? (
                                        <div key={product.id} className="bg-gray-50 p-3 rounded-md border flex items-center gap-3">
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                            <div>
                                                <p className="font-semibold">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.farmer}</p>
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">Edit Contents</button>
                             <AiInsight title="Subscriber Preference Match" content="85% of subscribers for this box have 'organic' in their preferences. Swapping standard carrots for Organic Carrots could increase satisfaction." />
                        </div>
                    ) : (
                        <p>Select a box to view its contents.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

const LogisticsManagementView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Logistics Management</h1>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Drivers</h2>
                    <button className="text-green-600 hover:bg-green-50 p-1 rounded"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-2">Name</th><th className="p-2">Vehicle</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
                    <tbody>
                        {mockDrivers.map(d => <tr key={d.id} className="border-b hover:bg-gray-50"><td className="p-2">{d.name}</td><td className="p-2">{d.vehicleId}</td><td className="p-2">{d.status}</td><td className="p-2"><button className="text-blue-600"><PencilIcon className="w-4 h-4"/></button></td></tr>)}
                    </tbody>
                </table>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Vehicles</h2>
                    <button className="text-green-600 hover:bg-green-50 p-1 rounded"><PlusIcon className="w-5 h-5"/></button>
                </div>
                 <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-2">Plate</th><th className="p-2">Capacity</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
                    <tbody>
                        {mockVehicles.map(v => <tr key={v.id} className="border-b hover:bg-gray-50"><td className="p-2">{v.licensePlate}</td><td className="p-2">{v.capacity} kg</td><td className="p-2">{v.status}</td><td className="p-2"><button className="text-blue-600"><PencilIcon className="w-4 h-4"/></button></td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Active Routes</h2>
                <button className="text-green-600 hover:bg-green-50 p-1 rounded"><PlusIcon className="w-5 h-5"/></button>
            </div>
            <table className="w-full text-left">
                <thead><tr className="border-b"><th className="p-2">Route</th><th className="p-2">Driver</th><th className="p-2">Orders</th><th className="p-2">Status</th><th className="p-2">Est. Completion</th></tr></thead>
                <tbody>
                    {mockRoutes.map(r => <tr key={r.id} className="border-b hover:bg-gray-50"><td className="p-2">{r.id}</td><td className="p-2">{r.driverId}</td><td className="p-2">{r.orders.length}</td><td className="p-2">{r.status}</td><td className="p-2">{r.estimatedCompletion}</td></tr>)}
                </tbody>
            </table>
        </div>
        <AiInsight title="Route Optimization" content="Route r1 has significant overlap with new orders in the M5V postal code. Consider merging these deliveries to save 45 minutes and reduce fuel costs by 15%." />
    </div>
);

const DisputeManagementView: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
    const { selected, handleSelect, handleSelectAll, setSelected } = useTableSelection();

    const handleDelete = () => {
        if(confirm(`Delete ${selected.size} tickets?`)) {
            setTickets(prev => prev.filter(t => !selected.has(t.id)));
            setSelected(new Set());
        }
    }

    const getPriorityClass = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-500 text-white';
            case 'High': return 'bg-red-200 text-red-800';
            case 'Medium': return 'bg-yellow-200 text-yellow-800';
            case 'Low': return 'bg-gray-200 text-gray-800';
            default: return 'bg-gray-200';
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dispute Management</h1>
            <TableActionToolbar 
                selectedCount={selected.size} 
                onAdd={() => alert('Create Ticket')}
                onEdit={() => alert('Edit Ticket')}
                onView={() => alert('View Ticket Details')}
                onDelete={handleDelete}
            />
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 w-10"><input type="checkbox" onChange={(e) => handleSelectAll(tickets.map(t => t.id))} checked={selected.size > 0 && selected.size === tickets.length} /></th>
                            <th className="p-4">Ticket ID</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Priority</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className={`border-b hover:bg-gray-50 ${selected.has(ticket.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-4"><input type="checkbox" checked={selected.has(ticket.id)} onChange={() => handleSelect(ticket.id)} /></td>
                                <td className="p-4 font-mono text-sm">{ticket.id}</td>
                                <td className="p-4 font-semibold">{ticket.subject}</td>
                                <td className="p-4">{ticket.userName} <span className="text-xs text-gray-500">({ticket.userRole})</span></td>
                                <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityClass(ticket.priority)}`}>{ticket.priority}</span></td>
                                <td className="p-4">{ticket.status}</td>
                                <td className="p-4">{ticket.createdDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AiInsight title="Recurring Issue" content="Three tickets related to 'Incorrect produce in order' have been raised by business customers in the last month. Recommend reviewing the packing process for wholesale orders to prevent future errors."/>
        </div>
    );
};

// Growth & Finance Views
const PaymentsView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Payments</h1>
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left">
                <thead><tr className="border-b"><th className="p-4">Order ID</th><th className="p-4">User</th><th className="p-4">Amount</th><th className="p-4">Date</th><th className="p-4">Status</th></tr></thead>
                <tbody>{mockPayments.map(p => <tr key={p.id} className="border-b hover:bg-gray-50"><td className="p-4">{p.orderId}</td><td className="p-4">{p.userName}</td><td className="p-4">${p.amount.toFixed(2)}</td><td className="p-4">{p.date}</td><td className="p-4">{p.status}</td></tr>)}</tbody>
            </table>
        </div>
    </div>
);
const InvoicesView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Invoices</h1>
         <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left">
                <thead><tr className="border-b"><th className="p-4">Entity</th><th className="p-4">Type</th><th className="p-4">Amount</th><th className="p-4">Due Date</th><th className="p-4">Status</th></tr></thead>
                <tbody>{mockInvoices.map(i => <tr key={i.id} className="border-b hover:bg-gray-50"><td className="p-4">{i.entityName}</td><td className="p-4">{i.entityType}</td><td className="p-4">${i.amount.toFixed(2)}</td><td className="p-4">{i.dueDate}</td><td className="p-4">{i.status}</td></tr>)}</tbody>
            </table>
        </div>
    </div>
);
const MarketingView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Marketing Campaigns</h1>
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-left">
                <thead><tr className="border-b"><th className="p-4">Name</th><th className="p-4">Target</th><th className="p-4">Channel</th><th className="p-4">Status</th><th className="p-4">Engagement</th></tr></thead>
                <tbody>{mockCampaigns.map(c => <tr key={c.id} className="border-b hover:bg-gray-50"><td className="p-4">{c.name}</td><td className="p-4">{c.targetSegment}</td><td className="p-4">{c.channel}</td><td className="p-4">{c.status}</td><td className="p-4">{c.engagementRate || 'N/A'}%</td></tr>)}</tbody>
            </table>
        </div>
    </div>
);
const AnalyticsView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Analytics & Reports</h1>
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">Comprehensive dashboards for sales, customer behavior, and operational efficiency are coming soon.</p>
        </div>
    </div>
);

// Intelligence Views
const SeasonalityView: React.FC = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Seasonality Intel</h1>
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
             <table className="w-full text-left">
                <thead><tr className="border-b"><th className="p-4">Product</th><th className="p-4">Trend</th><th className="p-4">Months</th></tr></thead>
                <tbody>
                    {mockSeasonalTrends.map(t => (
                        <tr key={t.productId} className="border-b hover:bg-gray-50">
                            <td className="p-4">{t.productName}</td>
                            <td className="p-4">{t.trend}</td>
                            <td className="p-4 text-sm">{t.months.map(m => new Date(0, m).toLocaleString('default', { month: 'short' })).join(', ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <AiInsight title="Procurement Planning" content="Strawberries are entering Peak Season. Now is the ideal time to run promotions and increase stock to maximize sales during this high-demand period."/>
    </div>
);
// #endregion

export default AdminView;

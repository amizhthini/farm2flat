
import { Product, SubscriptionBox, SubscriptionSize, Order, User, Farmer, Hub, CartItem, PortalUser, StaffMember, Supplier, Customer, PurchaseOrder, Business, Driver, Vehicle, Route, SeasonalTrend, Campaign, Ticket, SourcedProduct, Payment, Invoice } from '../types';

// Helper to generate IDs
const generateId = (prefix: string, index: number) => `${prefix}-${index}`;

// Raw Data from User Prompt
const RAW_CATALOG = {
  "Root Vegetables": [
    { name: "Carrots", price: 2.49, unit: "bunch" },
    { name: "Fresh Mini Carrots", price: 2.99, unit: "bag" },
    { name: "Beets", price: 2.99, unit: "bunch" },
    { name: "Turnips", price: 1.99, unit: "lb" },
    { name: "Sweet Potatoes", price: 1.99, unit: "lb" },
    { name: "Ontario Potatoes – White", price: 5.99, unit: "10lb bag" },
    { name: "Yukon Gold Potatoes", price: 6.99, unit: "10lb bag" },
    { name: "Red Potatoes", price: 6.49, unit: "10lb bag" },
    { name: "Russet Potatoes", price: 6.49, unit: "10lb bag" },
    { name: "Little Potatoes (EDM)", price: 4.49, unit: "bag" },
    { name: "Little Potatoes – Zingers", price: 4.99, unit: "bag" },
    { name: "LPC – Jazz Roasters", price: 4.99, unit: "bag" },
    { name: "Ginger (Chinese)", price: 3.99, unit: "lb" },
    { name: "Garlic (Chinese)", price: 0.60, unit: "bulb" },
    { name: "Garlic (Mexican)", price: 0.80, unit: "bulb" },
  ],
  "Cucumbers": [
    { name: "English Cucumbers", price: 1.99, unit: "each" },
    { name: "Dill Cucumbers (Mexican)", price: 2.49, unit: "lb" },
  ],
  "Peppers": [
    { name: "Green Peppers", price: 2.49, unit: "lb" },
    { name: "Red Bell Peppers", price: 3.99, unit: "lb" },
    { name: "Orange Bell Peppers", price: 3.99, unit: "lb" },
    { name: "Yellow Bell Peppers", price: 3.99, unit: "lb" },
    { name: "Poblano Pepper", price: 4.49, unit: "lb" },
    { name: "Jalapeno Pepper", price: 0.30, unit: "each" },
  ],
  "Tomatoes": [
    { name: "US Tomatoes (Florida)", price: 2.49, unit: "lb" },
    { name: "Roma Tomatoes (Cal)", price: 2.29, unit: "lb" },
    { name: "Campari Tomatoes", price: 4.99, unit: "pack" },
    { name: "Hothouse Tomatoes", price: 2.99, unit: "lb" },
  ],
  "Beans": [
    { name: "Green Beans", price: 3.49, unit: "lb" },
  ],
  "Leafy Greens (Western)": [
    { name: "Spinach", price: 2.99, unit: "bunch" },
    { name: "Kale", price: 2.99, unit: "bunch" },
    { name: "Head Lettuce", price: 2.99, unit: "head" },
    { name: "Red Leaf Lettuce", price: 2.49, unit: "head" },
    { name: "Green Leaf Lettuce", price: 2.49, unit: "head" },
    { name: "Romaine", price: 2.99, unit: "head" },
    { name: "Romaine Hearts", price: 4.99, unit: "3-pack" },
    { name: "Red Boston Lettuce", price: 3.49, unit: "head" },
    { name: "Endive", price: 3.99, unit: "each" },
    { name: "Escarole", price: 3.99, unit: "each" },
    { name: "Savoy Cabbage", price: 2.49, unit: "head" },
    { name: "Radicchio", price: 4.49, unit: "head" },
  ],
  "Cruciferous": [
    { name: "Broccoli", price: 3.49, unit: "head" },
    { name: "Cauliflower", price: 4.49, unit: "head" },
    { name: "Green Cabbage", price: 1.99, unit: "head" },
    { name: "Red Cabbage", price: 2.29, unit: "head" },
    { name: "Brussel Sprouts", price: 4.99, unit: "lb" },
  ],
  "Eggplant": [
    { name: "Eggplant (standard western)", price: 2.49, unit: "each" },
  ],
  "Herbs (Western)": [
    { name: "Cilantro", price: 1.29, unit: "bunch" },
    { name: "Plain Parsley", price: 1.29, unit: "bunch" },
    { name: "Curly Parsley", price: 1.29, unit: "bunch" },
    { name: "Coriander", price: 1.49, unit: "bunch" },
    { name: "Bunched Dill Weed", price: 1.99, unit: "bunch" },
    { name: "Mint", price: 1.99, unit: "bunch" },
  ],
  "Squash & Zucchini": [
    { name: "Green Zucchini", price: 1.99, unit: "lb" },
    { name: "Green Zucchini (Mexican)", price: 1.79, unit: "lb" },
    { name: "Butternut Squash", price: 1.49, unit: "lb" },
    { name: "Mexican-Gray Squash", price: 1.99, unit: "lb" },
  ],
  "Aromatics": [
    { name: "Cooking Onions", price: 3.99, unit: "bag" },
    { name: "Spanish Onions", price: 1.99, unit: "lb" },
    { name: "Red Onions", price: 2.29, unit: "lb" },
    { name: "White Onions", price: 2.49, unit: "lb" },
    { name: "Green Onions", price: 0.99, unit: "bunch" },
    { name: "Leeks Can.", price: 3.49, unit: "bunch" },
    { name: "Celery", price: 2.99, unit: "stalk" },
  ],
  "Melons": [
    { name: "Seedless Watermelon", price: 7.99, unit: "each" },
    { name: "Honeydew Melons", price: 5.99, unit: "each" },
    { name: "Cantaloupe", price: 4.99, unit: "each" },
  ],
  "Premium": [
    { name: "Avocadoes", price: 2.49, unit: "each" },
  ],
  "Tropical Fruits": [
    { name: "Pineapple", price: 4.99, unit: "each" },
    { name: "Mangoes", price: 1.99, unit: "each" },
    { name: "Ataulfo Mangoes", price: 2.29, unit: "each" },
    { name: "Oranges", price: 1.25, unit: "each" },
    { name: "Limes", price: 0.69, unit: "each" },
    { name: "Lemons", price: 0.89, unit: "each" },
    { name: "Juice Oranges", price: 0.99, unit: "each" },
  ],
  "Asian Greens": [
    { name: "Shanghai Choy", price: 2.49, unit: "lb" },
    // Spinach shared, already listed above
  ],
  "Misc Greens": [
    { name: "Arugula-type items", price: 4.99, unit: "clamshell" },
  ],
  "Sprouts & Microgreens": [
    { name: "ALFALFA AND ONION SPRO", price: 3.99, unit: "pack" },
    { name: "ALFALFA BABY ONION SPRO", price: 3.99, unit: "pack" },
    { name: "ALFALFA BROCCOLI SPROU", price: 4.49, unit: "pack" },
    { name: "ALFALFA PEA SHOOTS", price: 4.49, unit: "pack" },
    { name: "ALFALFA SPICY SPROUTS", price: 3.99, unit: "pack" },
    { name: "ALFALFA SPROUTS", price: 3.49, unit: "pack" },
    { name: "BEAN SPROUTS", price: 1.99, unit: "bag" },
    { name: "MICRO BROCCOLI CLAM", price: 5.99, unit: "clamshell" },
    { name: "MICRO CABBAGE CLAM", price: 5.99, unit: "clamshell" },
    { name: "MICRO CILANTRO CLAM", price: 6.49, unit: "clamshell" },
    { name: "MICRO CRUNCHY MIX CLAM C", price: 6.49, unit: "clamshell" },
    { name: "MICRO KALE CLAM", price: 5.99, unit: "clamshell" },
    { name: "RAINBOW MIX CLAM", price: 6.49, unit: "clamshell" },
    { name: "SUNFLOWER SHOOTS CLAM C", price: 5.49, unit: "clamshell" },
    { name: "SUNFLOWER SPROUTS", price: 4.99, unit: "pack" },
    { name: "SLEGERS MICRO BROCCOLI", price: 5.49, unit: "pack" },
    { name: "SLEGERS MIXED SPROUTS", price: 5.49, unit: "pack" },
  ],
  "Lettuce & Mixes": [
    { name: "ARUGULA BABY", price: 4.99, unit: "clamshell" },
    { name: "ARUGULA BABY ORG US", price: 5.99, unit: "clamshell" },
    { name: "ARUGULA BABY QV", price: 5.49, unit: "clamshell" },
    { name: "ARUGULA, LITTLE BEAR", price: 5.49, unit: "clamshell" },
    { name: "BOSTON HYDRO", price: 3.49, unit: "head" },
    { name: "BOSTON HYDRO GRN GRN", price: 3.49, unit: "head" },
    { name: "BOSTON HYDRO RED GRN", price: 3.49, unit: "head" },
    { name: "GREEN LEAF HYDRO", price: 3.49, unit: "head" },
    { name: "GREEN OAK", price: 3.49, unit: "head" },
    { name: "ICEBERG LETTUCE, JUMBO QV", price: 2.99, unit: "head" },
    { name: "ICEBERG LETTUCE, REGULAR", price: 2.49, unit: "head" },
    { name: "ICEBERG LETTUCE, WRAP QV", price: 2.99, unit: "head" },
    { name: "LETTUCE BABY GEM", price: 4.49, unit: "pack" },
    { name: "LOLLA ROSA", price: 3.49, unit: "head" },
    { name: "MACHE LETTUCE", price: 4.99, unit: "pack" },
    { name: "ROMAINE HYDRO", price: 3.49, unit: "head" },
    { name: "ROMAINE, BABY GREEN", price: 4.49, unit: "pack" },
    { name: "SLEGERS MIX LETTUCE", price: 3.99, unit: "pack" },
    { name: "SLEGERS ROMAINE LETTUCE", price: 3.99, unit: "pack" },
    { name: "SLEGERS SUMMER SALAD", price: 3.99, unit: "pack" },
    { name: "TRIO LIVING LETTUCE", price: 4.99, unit: "pack" },
    { name: "EMERALD SPRING MIX", price: 5.99, unit: "clamshell" },
    { name: "ORG SPRING MIX", price: 6.99, unit: "clamshell" },
    { name: "SPRING MIX", price: 5.49, unit: "clamshell" },
    { name: "SPRING MIX ORG US", price: 6.49, unit: "clamshell" },
    { name: "SPRING MIX QV", price: 5.99, unit: "clamshell" },
  ],
  "Herbs (Detailed)": [
    { name: "BASIL", price: 2.49, unit: "pack" },
    { name: "BASIL CDN", price: 2.49, unit: "pack" },
    { name: "BASIL US", price: 2.99, unit: "pack" },
    { name: "BASIL, OPAL", price: 2.99, unit: "pack" },
    { name: "BASIL, THAI", price: 2.99, unit: "pack" },
    { name: "BAY LEAVES US", price: 3.49, unit: "pack" },
    { name: "CHERVIL US", price: 3.49, unit: "pack" },
    { name: "CILANTRO SEEDLING", price: 4.99, unit: "tray" },
    { name: "CILANTRO US", price: 1.49, unit: "bunch" },
    { name: "CURRY LEAF", price: 2.49, unit: "pack" },
    { name: "DILLWEED", price: 1.99, unit: "bunch" },
    { name: "LAVENDER US", price: 3.99, unit: "bunch" },
    { name: "LEMON BALM US", price: 2.99, unit: "pack" },
    { name: "LEMON GRASS US", price: 2.99, unit: "stalk" },
    { name: "LEMON THYME US", price: 2.99, unit: "pack" },
    { name: "MARJORAM US", price: 2.99, unit: "pack" },
    { name: "MINT MOR", price: 2.49, unit: "bunch" },
    { name: "OREGANO", price: 2.49, unit: "pack" },
    { name: "ROSEMARY", price: 2.49, unit: "pack" },
    { name: "SAGE", price: 2.49, unit: "pack" },
    { name: "SAVORY", price: 2.49, unit: "pack" },
    { name: "TARRAGON", price: 2.99, unit: "pack" },
    { name: "THYME", price: 2.49, unit: "pack" },
  ],
  "Plant-Based": [
    { name: "TOFU FIRM", price: 2.99, unit: "pack" },
    { name: "TOFU SILKEN", price: 2.99, unit: "pack" },
    { name: "TOFU SMOKED", price: 3.49, unit: "pack" },
    { name: "TEMPEH", price: 4.49, unit: "pack" },
    { name: "SEITAN", price: 5.99, unit: "pack" },
    { name: "VEG BURGER", price: 6.99, unit: "pack" },
    { name: "VEG SAUSAGE", price: 6.99, unit: "pack" },
  ],
  "Misc & Specialty": [
    { name: "EDIBLE FLOWERS MIX", price: 7.99, unit: "pack" },
    { name: "EDIBLE FLOWERS ROSE", price: 8.99, unit: "pack" },
    { name: "MUSHROOM SHIITAKE", price: 6.99, unit: "lb" },
    { name: "MUSHROOM OYSTER", price: 7.99, unit: "lb" },
    { name: "MUSHROOM WHITE", price: 3.49, unit: "pack" },
    { name: "MUSHROOM BROWN", price: 3.99, unit: "pack" },
    { name: "SPROUT GARNISH", price: 3.99, unit: "pack" },
    { name: "ALGAE SEAWEED", price: 4.99, unit: "pack" },
    { name: "SPROUT SAMPLER", price: 5.99, unit: "pack" },
  ],
  "Ethnic & Exotic": [
    { name: "Bamboo Shoots", price: 3.99, unit: "can" },
    { name: "Green Coconuts", price: 3.49, unit: "each" },
    { name: "Hawaiian Plantain", price: 2.49, unit: "lb" },
    { name: "Indian Red Carrots (China)", price: 2.99, unit: "lb" },
    { name: "Kabocha Squash", price: 1.99, unit: "lb" },
    { name: "Sugarcane", price: 4.99, unit: "stalk" },
    { name: "Baby Okra", price: 4.99, unit: "lb" },
    { name: "Indian Okra", price: 4.49, unit: "lb" },
    { name: "Chinese Eggplant", price: 2.99, unit: "lb" },
    { name: "Indian Eggplant Graffiti", price: 3.49, unit: "lb" },
    { name: "Pea Eggplant", price: 5.99, unit: "lb" },
    { name: "Thai Eggplant PM", price: 4.49, unit: "lb" },
    { name: "Chinese Bittermelon", price: 3.49, unit: "lb" },
    { name: "Indian Bittermelon", price: 3.99, unit: "lb" },
    { name: "Hungarian Peppers", price: 3.99, unit: "lb" },
    { name: "Long Chilli Green", price: 4.99, unit: "lb" },
    { name: "Mix Scotch Bonnet", price: 6.99, unit: "lb" },
    { name: "Red Scotch Bonnet", price: 6.99, unit: "lb" },
    { name: "Serrano Peppers", price: 4.99, unit: "lb" },
    { name: "Thai Chilli – Red", price: 5.99, unit: "lb" },
    { name: "Thai Chilli – Green", price: 5.99, unit: "lb" },
    { name: "Armenian Cucumber", price: 3.99, unit: "each" },
    { name: "Ash Gourd", price: 2.49, unit: "lb" },
    { name: "Bengali Squash", price: 2.99, unit: "lb" },
    { name: "Chayote", price: 1.49, unit: "each" },
    { name: "Chinese Okra", price: 3.99, unit: "lb" },
    { name: "Indian Long Squash", price: 2.99, unit: "lb" },
    { name: "Pumpkin Large – Fairytale", price: 8.99, unit: "each" },
    { name: "Snake Gourd", price: 3.49, unit: "lb" },
    { name: "Tindora", price: 3.99, unit: "lb" },
    { name: "Green Long Beans", price: 3.99, unit: "bunch" },
    { name: "Purple Valor Beans", price: 4.49, unit: "lb" },
    { name: "Valor Beans", price: 4.29, unit: "lb" },
    { name: "White Long Beans", price: 3.99, unit: "bunch" },
  ],
  "Leaves & Roots": [
    { name: "Culantro / Shadow Benny", price: 2.99, unit: "bunch" },
    { name: "Curry Leaves", price: 2.49, unit: "pack" },
    { name: "Drumstick Leaves", price: 3.49, unit: "bunch" },
    { name: "Gongura Leaves", price: 3.49, unit: "bunch" },
    { name: "Mango Leaf", price: 1.99, unit: "pack" },
    { name: "Neem Leaf", price: 2.99, unit: "pack" },
    { name: "Aloe Vera", price: 2.99, unit: "leaf" },
    { name: "Breadfruit", price: 5.99, unit: "each" },
    { name: "Cassava", price: 1.99, unit: "lb" },
    { name: "Eddoes", price: 2.49, unit: "lb" },
    { name: "Ginger (China)", price: 2.99, unit: "lb" },
    { name: "Ginger (Peru)", price: 4.99, unit: "lb" },
    { name: "Jicama", price: 1.99, unit: "lb" },
    { name: "Malanga Coco (Purple)", price: 3.49, unit: "lb" },
    { name: "Turmeric", price: 6.99, unit: "lb" },
    { name: "White Yam", price: 2.99, unit: "lb" },
    { name: "Yellow Yam", price: 2.99, unit: "lb" },
  ],
  "Other Veg & Fruit": [
    { name: "Banana Flower", price: 4.99, unit: "each" },
    { name: "Banana Stem", price: 3.99, unit: "stalk" },
    { name: "Coconut Wrapped", price: 3.99, unit: "each" },
    { name: "Dosakai", price: 2.99, unit: "lb" },
    { name: "Green Mango", price: 2.49, unit: "each" },
    { name: "Green Papaya", price: 3.49, unit: "each" },
    { name: "Jackfruit Green", price: 1.99, unit: "lb" },
    { name: "Tomatillo", price: 3.99, unit: "lb" },
    { name: "Fresh Guava", price: 4.99, unit: "clamshell" },
    { name: "Jackfruit Ripe", price: 8.99, unit: "pack" },
    { name: "Quenepas / Guinep", price: 5.99, unit: "lb" },
    { name: "Rambutan", price: 7.99, unit: "lb" },
    { name: "Thai Banana", price: 2.49, unit: "hand" },
  ],
  "Indian": [
    { name: "Amla", price: 4.99, unit: "lb" },
    { name: "Arbee", price: 3.49, unit: "lb" },
    { name: "Betel Leaves", price: 4.99, unit: "pack" },
    { name: "Bombay Onion", price: 2.99, unit: "bag" },
    { name: "Chiku", price: 6.99, unit: "lb" },
    { name: "Drumsticks", price: 4.99, unit: "lb" },
    { name: "Guar Beans", price: 4.49, unit: "lb" },
    { name: "Kantola", price: 5.99, unit: "lb" },
    { name: "Parwal", price: 4.99, unit: "lb" },
    { name: "Shallots", price: 3.99, unit: "lb" },
    { name: "Suran", price: 3.49, unit: "lb" },
    { name: "Tinda", price: 3.99, unit: "lb" },
  ]
};

// Generate Mock Products
export const mockProducts: Product[] = Object.entries(RAW_CATALOG).flatMap(([category, items], catIndex) => {
  return items.map((item, itemIndex) => {
    // Determine a consistent "Farmer" based on category
    let farmer = "Green Acres Farm";
    if (category.includes("Fruit") || category.includes("Melon")) farmer = "Sunnyvale Orchards";
    if (category.includes("Indian") || category.includes("Asian") || item.name.includes("Thai") || item.name.includes("Chinese")) farmer = "Riverbend Gardens";
    if (category.includes("Root") || item.name.includes("Potato")) farmer = "Prairie Harvest";

    // Generate a placeholder image that contains the text of the product name
    const encodedName = encodeURIComponent(item.name);
    // Rotating colors for categories to look nice
    const colors = ["e9f5e9", "fff3e0", "e3f2fd", "f3e5f5", "ffebee", "f1f8e9", "e1bee7", "ffccbc"];
    const color = colors[catIndex % colors.length];
    const textColor = "1f2937";
    const imageUrl = `https://placehold.co/400x300/${color}/${textColor}?text=${encodedName}`;

    return {
      id: generateId('p', catIndex * 1000 + itemIndex),
      name: item.name,
      price: item.price,
      unit: item.unit,
      imageUrl: imageUrl,
      farmer: farmer,
      category: category,
      subcategory: category, // simplifying for this view
      availableDate: '2024-06-01',
      status: 'Available',
      quantity: Math.floor(Math.random() * 200) + 10,
      moq: 1,
      isSeasonal: Math.random() > 0.7
    };
  });
});

export const mockSubscriptionBoxes: SubscriptionBox[] = [
    {
        id: 'sb1',
        type: 'Veggie',
        ethnicityFocus: 'Standard',
        size: SubscriptionSize.Small,
        price: 25.00,
        description: 'A weekly selection of essential vegetables for one person.',
        contentsSample: ['Carrots', 'Potatoes', 'Onions', 'Broccoli', 'Lettuce'],
        imageUrl: 'https://placehold.co/400x300/e9f5e9/1f2937?text=Veggie+Box',
        currentContents: ['p-0', 'p-6', 'p-100', 'p-200'],
    },
    {
        id: 'sb2',
        type: 'Veggie',
        ethnicityFocus: 'Standard',
        size: SubscriptionSize.Medium,
        price: 40.00,
        description: 'Perfect for couples or small families, a variety of fresh veggies.',
        contentsSample: ['Carrots', 'Potatoes', 'Onions', 'Broccoli', 'Lettuce', 'Tomatoes', 'Peppers'],
        imageUrl: 'https://placehold.co/400x300/e9f5e9/1f2937?text=Family+Veggie+Box',
        currentContents: ['p-0', 'p-6', 'p-100', 'p-200', 'p-300', 'p-201'],
    },
    {
        id: 'sb3',
        type: 'Fruit',
        ethnicityFocus: 'Standard',
        size: SubscriptionSize.Medium,
        price: 35.00,
        description: 'A delicious assortment of seasonal fruits for 2-3 people.',
        contentsSample: ['Apples', 'Bananas', 'Oranges', 'Berries', 'Grapes'],
        imageUrl: 'https://placehold.co/400x300/fff3e0/1f2937?text=Fruit+Box',
        currentContents: ['p-910'],
    },
    {
        id: 'sb4',
        type: 'Mixed',
        ethnicityFocus: 'Asian',
        size: SubscriptionSize.Medium,
        price: 45.00,
        description: 'A mix of fruits and veggies common in Asian cuisine.',
        contentsSample: ['Bok Choy', 'Daikon Radish', 'Ginger', 'Napa Cabbage', 'Apples', 'Pears'],
        imageUrl: 'https://placehold.co/400x300/f3e5f5/1f2937?text=Asian+Fusion+Box',
        currentContents: ['p-12', 'p-511'],
    },
];

const MOCK_ORDER_ITEMS: CartItem[] = mockProducts.slice(0, 3).map((p, i): CartItem => ({
    cartId: `mock-cart-${p.id}-${i}`,
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl,
    quantity: i + 1,
    type: 'product',
    unit: p.unit,
}));

export const mockOrders: Order[] = [
  { 
    id: 'o1', 
    userId: 'u1', 
    date: '2023-10-26', 
    items: MOCK_ORDER_ITEMS, 
    total: MOCK_ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    status: 'Delivered',
    orderType: 'one_time',
    paymentStatus: 'paid',
    deliveryDetails: {
        estimatedArrival: 'October 27, 2023',
        trackingStatus: 'Delivered'
    } 
  },
  { 
    id: 'o2', 
    userId: 'b1', 
    date: '2023-10-29', 
    items: mockProducts.slice(2, 4).map((p,i): CartItem => ({
        cartId: `mock-cart-${p.id}-${i+3}`,
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        quantity: 1,
        type: 'product',
        unit: p.unit,
    })), 
    total: 4.50, 
    status: 'Processing',
    orderType: 'one_time',
    paymentStatus: 'paid',
    deliveryDetails: {
        estimatedArrival: 'November 3, 2023',
        trackingStatus: 'Out for Delivery'
    }
  },
  { 
    id: 'o3', 
    userId: 'u1', 
    date: '2023-11-02', 
    items: [
        ...mockProducts.slice(4, 7).map((p,i): CartItem => ({
            cartId: `mock-cart-${p.id}-${i+5}`,
            id: p.id,
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl,
            quantity: 2,
            type: 'product',
            unit: p.unit,
        })),
        { cartId: 'mock-cart-sb1', id: 'sb1', name: 'Veggie Box (Small)', price: 25.00, imageUrl: '', quantity: 1, type: 'subscription' }
    ], 
    total: 37.50, 
    status: 'Pending',
    orderType: 'subscription',
    paymentStatus: 'pending',
    deliveryDetails: {
        estimatedArrival: 'November 8, 2023',
        trackingStatus: 'Order Confirmed'
    } 
  },
];

export const mockUser: User = {
    id: 'u1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    postalCode: 'M5V 2T6',
    orderHistory: mockOrders.filter(o => o.userId === 'u1'),
    familySize: 2,
    preferences: ['organic', 'local-only'],
    regularPurchaseList: ['p-0', 'p-5'],
    groceryBudget: { amount: 100, period: 'Weekly' },
    loyaltyCredits: 75.50,
    lifetimeValue: 450.75,
};

export const mockPortalUsers: PortalUser[] = [
  {
    id: 'admin1',
    email: 'admin@farm2flat.com',
    password: 'adminpassword',
    name: 'Super Admin',
    role: 'admin',
  },
  {
    id: 'farmer1',
    email: 'farmer@greenacres.com',
    password: 'farmerpassword',
    name: 'John Farmer (Green Acres)',
    role: 'farmer',
  },
  {
    id: 'biz1',
    email: 'buyer@restaurant.com',
    password: 'businesspassword',
    name: 'The Grand Restaurant',
    role: 'business',
  },
];


// --- New Mock Data for Portals ---

export const mockStaff: StaffMember[] = [
    { id: 's1', name: 'Maria Garcia', role: 'Farm Hand', contact: '555-1234' },
    { id: 's2', name: 'Tom Chen', role: 'Logistics Manager', contact: '555-5678' },
];

export const mockFarmerSuppliers: Supplier[] = [
    { id: 'sup1', name: 'Guelph Seed Co.', category: 'Seeds', contactEmail: 'sales@guelphseed.com' },
    { id: 'sup2', name: 'AgriPak Solutions', category: 'Packaging', contactEmail: 'contact@agripak.com' },
];

export const mockFarmerDirectOrders: Order[] = [
    {
        id: 'd-o1',
        userId: 'farmer1',
        customerId: 'cust1',
        date: '2024-07-25',
        items: [
            { cartId: 'fc1', id: 'p1', name: 'Organic Carrots', price: 2.50, imageUrl: '', quantity: 20, type: 'product', unit: 'bunch' },
            { cartId: 'fc2', id: 'p3', name: 'Red Bell Peppers', price: 1.50, imageUrl: '', quantity: 30, type: 'product', unit: 'each' },
        ],
        total: 95.00,
        status: 'Delivered',
    }
];

export const mockFarmerCustomers: Customer[] = [
    { id: 'cust1', name: 'The Corner Cafe', type: 'Restaurant', contactEmail: 'orders@cornercafe.com', orderHistory: mockFarmerDirectOrders },
    { id: 'cust2', name: 'Local Roots Grocer', type: 'Grocer', contactEmail: 'buyer@localroots.com' },
    { id: 'cust3', name: 'Farm2Flat', type: 'Platform', contactEmail: 'procurement@farm2flat.com' },
];

export const mockFarmerPurchases: PurchaseOrder[] = [
    { id: 'po1', supplierId: 'sup1', date: '2024-03-15', items: [{ name: 'Carrot Seeds', quantity: 50, unit: 'packet' }], total: 125.00, status: 'Received' },
    { id: 'po2', supplierId: 'sup2', date: '2024-05-10', items: [{ name: 'Cardboard Boxes', quantity: 200, unit: 'box' }], total: 350.00, status: 'Pending' },
];


export const mockFarmers: Farmer[] = [
    { 
        id: 'f1', 
        name: 'Green Acres Farm', 
        location: 'Guelph, ON', 
        specialty: ['Vegetables', 'Root Crops'],
        geolocation: { lat: 43.5448, lng: -80.2482 },
        certifications: ['Certified Organic', 'Local Food Plus'],
        description: 'A family-owned farm specializing in root vegetables and sustainable farming practices.',
        farmImageUrl: 'https://picsum.photos/id/1015/600/400',
        operatingHours: 'Mon-Sat: 9am - 5pm',
        publicProfileBlurb: 'Fresh, organic vegetables straight from our family to yours.',
        productIds: ['p1', 'p3', 'p7'],
        staff: mockStaff,
        suppliers: mockFarmerSuppliers,
        customers: mockFarmerCustomers,
        purchaseHistory: mockFarmerPurchases,
        performanceScore: 92,
    },
    { 
        id: 'f2', 
        name: 'Sunnyvale Orchards', 
        location: 'Niagara, ON', 
        specialty: ['Fruits', 'Apples', 'Tomatoes'], 
        productIds: ['p2', 'p5'],
        performanceScore: 95,
    },
    { 
        id: 'f3', 
        name: 'Riverbend Gardens', 
        location: 'Ottawa, ON', 
        specialty: ['Leafy Greens', 'Herbs'], 
        productIds: ['p4', 'p6', 'p8'],
        performanceScore: 88,
    },
    { 
        id: 'f4', 
        name: 'Prairie Harvest', 
        location: 'Brant, ON', 
        specialty: ['Grains', 'Potatoes'],
        performanceScore: 81,
    },
];

export const mockBusinessProducts: Product[] = [
    { id: 'bp1', name: 'Garden Salad', price: 12.50, unit: 'plate', imageUrl: 'https://placehold.co/400x300?text=Salad', farmer: 'The Grand Restaurant', moq: 1, isSeasonal: true },
    { id: 'bp2', name: 'Tomato Soup', price: 8.00, unit: 'bowl', imageUrl: 'https://placehold.co/400x300?text=Soup', farmer: 'The Grand Restaurant', moq: 1, isSeasonal: true },
    { id: 'bp3', name: 'Roast Chicken', price: 24.00, unit: 'plate', imageUrl: 'https://placehold.co/400x300?text=Chicken', farmer: 'The Grand Restaurant', moq: 1, isSeasonal: false },
];

export const mockBusinessCustomerOrders: Order[] = [
    {
        id: 'b-cust-o1',
        userId: 'biz1',
        customerId: 'bcust1',
        date: '2024-07-28',
        items: [
            { cartId: 'bc1', id: 'bp1', name: 'Garden Salad', price: 12.50, imageUrl: '', quantity: 10, type: 'product', unit: 'plate' },
        ],
        total: 125.00,
        status: 'Delivered',
    }
];

export const mockBusinessCustomers: Customer[] = [
    { id: 'bcust1', name: 'Regular Diner A', type: 'Individual', contactEmail: 'diner-a@example.com', orderHistory: mockBusinessCustomerOrders },
    { id: 'bcust2', name: 'Corporate Catering Client', type: 'Individual', contactEmail: 'catering@example.com' }
];

export const mockBusinesses: Business[] = [
    {
        id: 'b1',
        name: 'The Grand Restaurant',
        type: 'Restaurant',
        location: 'Toronto, ON',
        contactEmail: 'buyer@restaurant.com',
        staff: [{ id: 'bs1', name: 'Chef Antoine', role: 'Head Chef', contact: 'chef@restaurant.com' }],
        suppliers: [{id: 'fhub', name: 'Farm2Flat', category: 'Fresh Produce', contactEmail: 'sales@farm2flat.com'}],
        customers: mockBusinessCustomers,
        purchaseHistory: mockOrders.filter(o => o.userId === 'b1'),
        products: mockBusinessProducts,
    }
]


export const mockFarmerProducts: Product[] = [
    { ...mockProducts[0], category: 'Vegetable', subcategory: 'Root', availableDate: '2024-05-20', status: 'Available', quantity: 150, farmer: 'Green Acres Farm', moq: 10, isSeasonal: true }, 
    { ...mockProducts[2], category: 'Vegetable', subcategory: 'Fruit Vegetable', availableDate: '2024-05-22', status: 'Available', quantity: 80, farmer: 'Green Acres Farm', moq: 5, isSeasonal: true },
    { ...mockProducts[6], category: 'Vegetable', subcategory: 'Tuber', availableDate: '2024-05-25', status: 'Unavailable', quantity: 0, farmer: 'Green Acres Farm', moq: 20, isSeasonal: false }, 
    { ...mockProducts[3], category: 'Vegetable', subcategory: 'Leafy Green', availableDate: '2024-05-20', status: 'Available', quantity: 120, farmer: 'Riverbend Gardens', moq: 15, isSeasonal: true }, 
    { ...mockProducts[4], category: 'Fruit', subcategory: 'Pome', availableDate: '2024-06-01', status: 'Available', quantity: 200, farmer: 'Sunnyvale Orchards', moq: 25, isSeasonal: false }, 
];

export const mockImportedFarmerProducts: Product[] = [
    { id: 'imp1', name: 'Zucchini', price: 1.75, unit: 'each', imageUrl: 'https://placehold.co/400x300?text=Zucchini', farmer: 'Green Acres Farm', category: 'Vegetable', subcategory: 'Fruit Vegetable', availableDate: '2024-06-10', status: 'Available', quantity: 90, moq: 12, isSeasonal: true },
    { id: 'imp2', name: 'Strawberries', price: 5.50, unit: 'quart', imageUrl: 'https://placehold.co/400x300?text=Strawberries', farmer: 'Green Acres Farm', category: 'Fruit', subcategory: 'Berry', availableDate: '2024-06-15', status: 'Available', quantity: 60, moq: 1, isSeasonal: true },
];


export const mockHubs: Hub[] = [
    { id: 'h1', postalCodePrefix: 'M', location: 'Toronto Downtown Core' },
    { id: 'h2', postalCodePrefix: 'K', location: 'Ottawa Region' },
    { id: 'h3', postalCodePrefix: 'L', location: 'Greater Toronto Area' },
];

export const mockHubFarmerMap: Record<string, string[]> = {
    'h1': ['f1', 'f2'],
    'h2': ['f3'],
    'h3': ['f1', 'f4'],
};

// --- Super Admin Mock Data ---
export const mockDrivers: Driver[] = [
    { id: 'd1', name: 'Carlos Ray', vehicleId: 'v1', contact: '555-0101', status: 'On Duty' },
    { id: 'd2', name: 'Susan Ivanova', vehicleId: 'v2', contact: '555-0102', status: 'Off Duty' },
    { id: 'd3', name: 'Michael Garibaldi', vehicleId: 'v3', contact: '555-0103', status: 'On Duty' },
];

export const mockVehicles: Vehicle[] = [
    { id: 'v1', licensePlate: 'FRESH-1', model: 'Refrigerated Van', capacity: 500, status: 'Active' },
    { id: 'v2', licensePlate: 'FARM-2-U', model: 'Cargo Van', capacity: 300, status: 'Active' },
    { id: 'v3', licensePlate: 'DELIVER-3', model: 'Refrigerated Van', capacity: 500, status: 'Maintenance' },
];

export const mockRoutes: Route[] = [
    { id: 'r1', driverId: 'd1', hubId: 'h1', orders: ['o1', 'o3'], status: 'In Progress', estimatedCompletion: '2024-07-28 14:00' },
    { id: 'r2', driverId: 'd3', hubId: 'h2', orders: ['o2'], status: 'Planned', estimatedCompletion: '2024-07-28 16:00' },
];

export const mockSeasonalTrends: SeasonalTrend[] = [
    { productId: 'p2', productName: 'Heirloom Tomatoes', months: [5, 6, 7, 8], trend: 'Peak Season' },
    { productId: 'p5', productName: 'Gala Apples', months: [8, 9, 10], trend: 'Peak Season' },
    { productId: 'imp2', productName: 'Strawberries', months: [5, 6], trend: 'High Supply' },
    { productId: 'p7', productName: 'Potatoes', months: [0,1,2,3,4,5,6,7,8,9,10,11], trend: 'High Supply' },
    { productId: 'imp3', productName: 'Asparagus', months: [3, 4, 5], trend: 'Low Supply' },
];

export const mockCampaigns: Campaign[] = [
    { id: 'c1', name: 'Summer Fruit Festival', targetSegment: 'All Users', channel: 'Email', status: 'Completed', sentDate: '2024-06-15', engagementRate: 22.5 },
    { id: 'c2', name: 'Welcome Offer - 10% Off', targetSegment: 'New Users', channel: 'Push Notification', status: 'Active' },
    { id: 'c3', name: 'Weekly Veggie Box Promo', targetSegment: 'High-Value Customers', channel: 'SMS', status: 'Draft' },
];

export const mockTickets: Ticket[] = [
    { id: 't1', userId: 'u1', userName: 'Jane Doe', userRole: 'user', subject: 'Late Delivery', description: 'My order o3 was supposed to arrive yesterday but I have not received it yet.', status: 'Open', priority: 'High', createdDate: '2023-11-03', assignedTo: 'admin1' },
    { id: 't2', userId: 'farmer1', userName: 'John Farmer', userRole: 'farmer', subject: 'Payment not received for Q3', description: 'The quarterly payment for our produce has not been reflected in our account.', status: 'In Progress', priority: 'Urgent', createdDate: '2023-10-30', assignedTo: 'admin1' },
    { id: 't3', userId: 'biz1', userName: 'The Grand Restaurant', userRole: 'business', subject: 'Incorrect produce in order o2', description: 'We received spinach instead of kale in our last order.', status: 'Resolved', priority: 'Medium', createdDate: '2023-10-30' },
];

// Mapping over standard products to create sourced products for admin view
export const mockSourcedProducts: SourcedProduct[] = mockProducts.map(p => ({
    id: `sp-${p.id}`,
    name: p.name,
    baseProductName: p.name,
    supplierId: 'f1', // Simplifying for mock
    supplierName: p.farmer,
    costPrice: p.price * 0.6, // Assuming 40% margin
    unit: p.unit,
    imageUrl: p.imageUrl,
    category: p.category || 'Vegetable',
    publishStatus: 'unpublished',
    sellingPrice: p.price,
    publishTarget: ['retail', 'wholesale'],
    availableQuantity: p.quantity
}));


export const mockPayments: Payment[] = [
    { id: 'pay_1', orderId: 'o1', userId: 'u1', userName: 'Jane Doe', amount: 30.50, date: '2023-10-26', status: 'Completed', method: 'Credit Card' },
    { id: 'pay_2', orderId: 'o2', userId: 'b1', userName: 'The Grand Restaurant', amount: 4.50, date: '2023-10-29', status: 'Completed', method: 'Credit Card' },
    { id: 'pay_3', orderId: 'o3', userId: 'u1', userName: 'Jane Doe', amount: 12.50, date: '2023-11-02', status: 'Pending', method: 'PayPal' },
];

export const mockInvoices: Invoice[] = [
    { id: 'inv_f1_1', entityId: 'f1', entityName: 'Green Acres Farm', entityType: 'Supplier', date: '2023-10-01', dueDate: '2023-10-31', amount: 1250.00, status: 'Paid' },
    { id: 'inv_b1_1', entityId: 'b1', entityName: 'The Grand Restaurant', entityType: 'Customer', date: '2023-10-15', dueDate: '2023-11-15', amount: 890.00, status: 'Pending' },
    { id: 'inv_f2_1', entityId: 'f2', entityName: 'Sunnyvale Orchards', entityType: 'Supplier', date: '2023-09-20', dueDate: '2023-10-20', amount: 980.50, status: 'Overdue' },
];

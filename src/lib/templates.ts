import {
    LayoutDashboard,
    KanbanSquare,
    FolderKanban,
    ShoppingBag,
    Youtube,
    Music,
    Film,
    Store,
    Calculator,
    CheckSquare,
    Cloud,
    Link,
    Rocket,
    Briefcase,
    Calendar,
    Sparkles,
    BarChart3,
    Users,
    FolderOpen,
    ShoppingCart,
    CreditCard,
    Gamepad2,
    Clock,
    type LucideIcon,
} from "lucide-react";

export type TemplateCategory =
    | "all"
    | "landing-pages"
    | "dashboards"
    | "games"
    | "tools"
    | "e-commerce";

export type TemplateDifficulty = "beginner" | "intermediate" | "advanced";

export interface Template {
    id: string;
    name: string;
    description: string;
    category: Exclude<TemplateCategory, "all">;
    prompt: string;
    icon: LucideIcon;
    tags: string[];
    difficulty: TemplateDifficulty;
    estimatedTime: string;
}

// Dependency constraint for all templates
const DEPENDENCY_CONSTRAINT = `

IMPORTANT: Do not install or import any external npm packages. Use only built-in React hooks like useState, useEffect, and useRef. Use native browser APIs like localStorage and fetch. Use Tailwind CSS for all styling. For drag-and-drop, use HTML5 drag events. For touch gestures, use native touch events. For charts, create simple SVG or CSS-based visualizations. Use CSS transitions for animations.`;

// Professional design guidelines
const DESIGN_GUIDELINES = `

DESIGN REQUIREMENTS - VERY IMPORTANT:
- Use a professional color scheme with ONE primary accent color (blue, indigo, purple, emerald, or teal - NOT gray)
- Apply the accent color to: buttons, links, icons, highlights, and interactive elements
- Use neutral backgrounds (white/slate-50 in light mode, slate-900/slate-950 in dark mode)
- Add subtle shadows (shadow-sm, shadow-md) and borders for depth
- Include smooth hover effects with scale and color transitions
- Use proper spacing (p-4, p-6, gap-4) for a clean, organized layout
- Implement a modern, polished UI that looks professional and production-ready
- Avoid pure black/white - use slate-900 and white instead
- Add visual interest with gradients on hero sections (from-blue-500 to-purple-600)
- Ensure all interactive elements have clear hover and active states
- The final result should look like a real, professional application - NOT a basic prototype`;

export const TEMPLATES: Template[] = [
    // ===== LANDING PAGES =====
    {
        id: "saas-landing",
        name: "SaaS Landing Page",
        description: "Modern SaaS product landing with pricing",
        category: "landing-pages",
        prompt:
            "Build a modern SaaS landing page with: hero section with gradient background and CTA buttons, features grid (6 features with icons from lucide-react), pricing cards (3 tiers with feature lists), testimonials section with customer quotes, FAQ accordion using details/summary HTML elements, and footer with links. Use a clean design with primary accent color (blue or purple), smooth CSS transitions, and responsive Tailwind layout. Include a sticky navbar with logo and navigation links." +
            DEPENDENCY_CONSTRAINT +
            DESIGN_GUIDELINES,
        icon: Rocket,
        tags: ["saas", "pricing", "hero", "features"],
        difficulty: "intermediate",
        estimatedTime: "15-20 min",
    },
    {
        id: "product-launch",
        name: "Product Launch Page",
        description: "Countdown timer and email signup",
        category: "landing-pages",
        prompt:
            "Create a product launch page with: large hero section with product mockup placeholder, countdown timer to launch date (use setInterval and Date objects), email signup form with validation using React state, key features section (4-6 features), social proof badges, and early bird pricing section. Use bold typography, vibrant gradient backgrounds (Tailwind), and CSS animations. Include social media links and a progress bar showing signup goals using CSS width percentage." +
            DEPENDENCY_CONSTRAINT +
            DESIGN_GUIDELINES,
        icon: Sparkles,
        tags: ["launch", "countdown", "signup", "marketing"],
        difficulty: "intermediate",
        estimatedTime: "15-20 min",
    },
    {
        id: "portfolio-landing",
        name: "Portfolio Landing",
        description: "Personal portfolio with projects showcase",
        category: "landing-pages",
        prompt:
            "Build a personal portfolio landing page with: hero section with name and tagline, about section with photo placeholder and bio, skills grid with icons (lucide-react) and proficiency bars (CSS width), projects gallery (grid of 6-9 projects with hover effects using CSS), contact form with validation using React state, and social links. Use a modern, minimal design with smooth scroll behavior (CSS scroll-behavior: smooth) and dark mode support using Tailwind dark: classes." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Briefcase,
        tags: ["portfolio", "personal", "projects", "contact"],
        difficulty: "beginner",
        estimatedTime: "10-15 min",
    },
    {
        id: "event-registration",
        name: "Event Registration",
        description: "Event details with ticket booking",
        category: "landing-pages",
        prompt:
            "Create an event registration page with: hero banner with event date and location, event details section, speaker/agenda timeline using CSS grid, ticket selection with quantity picker (useState), registration form (name, email, ticket type) with validation, payment summary, and confirmation modal using conditional rendering. Use event-themed colors, clear CTAs, and mobile-responsive Tailwind design. Include countdown to event using setInterval and social sharing buttons." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Calendar,
        tags: ["event", "registration", "tickets", "booking"],
        difficulty: "intermediate",
        estimatedTime: "20-25 min",
    },
    {
        id: "coming-soon",
        name: "Coming Soon Page",
        description: "Minimal coming soon with email capture",
        category: "landing-pages",
        prompt:
            "Build a minimal coming soon page with: centered logo, large heading with launch message, countdown timer (days, hours, minutes, seconds) using setInterval and Date calculations, email subscription form with success state (useState), social media icons (lucide-react), and subtle animated background using CSS keyframes and gradients. Use clean typography, ample whitespace, and a single accent color. Keep it simple and elegant." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Clock,
        tags: ["coming-soon", "minimal", "email", "countdown"],
        difficulty: "beginner",
        estimatedTime: "5-10 min",
    },

    // ===== DASHBOARDS =====
    {
        id: "analytics-dashboard",
        name: "Analytics Dashboard",
        description: "Charts, metrics, and data visualization",
        category: "dashboards",
        prompt:
            "Create an analytics dashboard with: top stat cards (4 metrics with trend indicators using arrows), simple line chart using SVG path elements, bar chart using div elements with height percentages, pie chart using CSS conic-gradient, data table with sorting (useState to track sort) and pagination (slice array), date range picker using native input type='date', and export button. Use a clean layout with sidebar navigation, top header with search and profile menu. Include dark mode using Tailwind dark: classes and responsive design." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: BarChart3,
        tags: ["analytics", "charts", "metrics", "data"],
        difficulty: "advanced",
        estimatedTime: "25-30 min",
    },
    {
        id: "admin-panel",
        name: "Admin Panel",
        description: "User management and settings",
        category: "dashboards",
        prompt:
            "Build an admin panel with: sidebar navigation, top header with breadcrumbs and user menu, user management table (list, search using filter(), edit, delete with useState), role management section, settings page with tabs using conditional rendering (general, security, notifications), activity log, and confirmation modals using conditional rendering. Use professional styling with clear hierarchy, good spacing, and intuitive navigation. All state management with useState and useEffect." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: LayoutDashboard,
        tags: ["admin", "users", "management", "settings"],
        difficulty: "advanced",
        estimatedTime: "30-35 min",
    },
    {
        id: "crm-dashboard",
        name: "CRM Dashboard",
        description: "Sales pipeline and customer tracking",
        category: "dashboards",
        prompt:
            "Create a CRM dashboard with: sales pipeline kanban board using HTML5 drag-and-drop (onDragStart, onDragOver, onDrop events), recent contacts list with avatar placeholders, revenue chart using SVG or div-based bars, top deals table, activity timeline, quick actions panel, and filter sidebar. Use a modern design with color-coded deal stages, smooth CSS transitions, and responsive Tailwind layout. Include search using filter() and export functionality." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Users,
        tags: ["crm", "sales", "pipeline", "customers"],
        difficulty: "advanced",
        estimatedTime: "30-35 min",
    },
    {
        id: "project-management",
        name: "Project Management",
        description: "Tasks, timeline, and team collaboration",
        category: "dashboards",
        prompt:
            "Build a project management dashboard with: project overview cards, task list with status filters using filter(), simple Gantt chart using CSS grid and positioned divs, team members section with avatar placeholders, file attachments area, comments/activity feed, and progress indicators using CSS width. Use tabs for different views (list, board, timeline) with conditional rendering, include HTML5 drag-and-drop for tasks, and add due date highlighting using date comparisons." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: FolderOpen,
        tags: ["projects", "tasks", "timeline", "collaboration"],
        difficulty: "advanced",
        estimatedTime: "30-35 min",
    },
    {
        id: "ecommerce-admin",
        name: "E-commerce Admin",
        description: "Orders, products, and inventory",
        category: "dashboards",
        prompt:
            "Create an e-commerce admin dashboard with: sales overview cards, recent orders table with status badges, product inventory list with stock alerts, revenue chart using div-based bars or SVG, top-selling products section, and quick actions (add product, process order). Use a clean layout with sidebar navigation, include search using filter() and filters with useState, and add status indicators for orders (pending, shipped, delivered) using colored badges." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Store,
        tags: ["ecommerce", "orders", "inventory", "sales"],
        difficulty: "advanced",
        estimatedTime: "30-35 min",
    },

    // ===== GAMES =====
    {
        id: "tic-tac-toe",
        name: "Tic-Tac-Toe",
        description: "Classic X and O game",
        category: "games",
        prompt:
            "Build a tic-tac-toe game with: 3x3 grid board using CSS grid, player turn indicator, win detection logic using array checks, score tracking with useState, reset button, and game over modal showing winner using conditional rendering. Use smooth CSS transitions for moves, highlight winning combination with CSS classes, and add click sound effects using Audio API (optional). Include player vs player mode with clean, modern UI and responsive Tailwind design." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Gamepad2,
        tags: ["game", "classic", "multiplayer", "logic"],
        difficulty: "beginner",
        estimatedTime: "10-15 min",
    },
    {
        id: "memory-card",
        name: "Memory Card Game",
        description: "Match pairs of cards",
        category: "games",
        prompt:
            "Create a memory card game with: grid of face-down cards (4x4 or 6x6) using CSS grid, flip animation on click using CSS transform, match detection with useState, move counter, timer using setInterval, score tracking, and win condition. Use colorful card designs with emoji or colored backgrounds, smooth flip animations with CSS, and celebration effect on win using CSS animations. Include difficulty levels (easy, medium, hard) and restart button. Make it responsive and fun!" +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Sparkles,
        tags: ["game", "memory", "cards", "matching"],
        difficulty: "intermediate",
        estimatedTime: "20-25 min",
    },
    {
        id: "snake-game",
        name: "Snake Game",
        description: "Classic snake with food collection",
        category: "games",
        prompt:
            "Build a snake game with: game grid using CSS grid or divs, snake movement using arrow keys (onKeyDown), food spawning at random positions, collision detection (walls and self) using coordinate checks, score tracking, speed increase with setInterval, and game over screen. Use grid-based rendering with colored divs, smooth movement updates, and retro-modern styling. Include pause/resume with spacebar, high score tracking in localStorage, and restart functionality. Make controls responsive and intuitive." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Gamepad2,
        tags: ["game", "classic", "arcade", "snake"],
        difficulty: "advanced",
        estimatedTime: "30-35 min",
    },
    {
        id: "2048-clone",
        name: "2048 Clone",
        description: "Merge tiles to reach 2048",
        category: "games",
        prompt:
            "Create a 2048 game clone with: 4x4 grid using CSS grid, tile merging logic using array manipulation, arrow key controls (onKeyDown) AND touch gesture support using onTouchStart/onTouchMove/onTouchEnd for mobile, score tracking, new tile spawning (2 or 4) at random empty positions, win condition (2048 tile), game over detection when no moves available, and undo button storing previous state. Use smooth slide animations with CSS transitions, color-coded tiles with Tailwind, and clean modern design. Include best score tracking in localStorage and restart functionality. Make it mobile-friendly with touch gestures." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Calculator,
        tags: ["game", "puzzle", "2048", "logic"],
        difficulty: "advanced",
        estimatedTime: "30-35 min",
    },

    // ===== TOOLS =====
    {
        id: "calculator",
        name: "Calculator",
        description: "Basic calculator with operations",
        category: "tools",
        prompt:
            "Build a calculator app with: number pad (0-9) using buttons, basic operations (+, -, ×, ÷), decimal point, equals button, clear/AC button, display screen showing current input and result using useState, and keyboard support using onKeyDown. Use a clean, modern design with large buttons, smooth press animations using CSS active state, and proper calculation logic with eval() or manual parsing. Include memory functions (M+, M-, MR, MC) and percentage button. All state management with useState." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Calculator,
        tags: ["calculator", "math", "utility", "numbers"],
        difficulty: "beginner",
        estimatedTime: "15-20 min",
    },
    {
        id: "todo-list",
        name: "Todo List",
        description: "Task management with filters",
        category: "tools",
        prompt:
            "Create a todo list app with: add task input, task list with checkboxes, delete button, edit functionality using inline editing, filter tabs (all, active, completed) using filter(), clear completed button, and task counter. Use localStorage for persistence with useEffect, smooth animations for add/remove using CSS transitions, and clean UI. Include priority levels (high, medium, low) with color coding and due date picker using native input type='date'. All state with useState." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: CheckSquare,
        tags: ["todo", "tasks", "productivity", "list"],
        difficulty: "intermediate",
        estimatedTime: "20-25 min",
    },
    {
        id: "weather-app",
        name: "Weather App",
        description: "Current weather and forecast",
        category: "tools",
        prompt:
            "Build a weather app with: city search input, current weather display (temperature, condition, humidity, wind), 5-day forecast cards, weather icons using lucide-react or emoji, location detection button using Geolocation API, and unit toggle (°C/°F). Use mock weather data in useState (or free API like OpenWeatherMap if available), include smooth transitions, weather-themed gradient backgrounds based on condition, and responsive Tailwind design. Add favorite cities feature with localStorage and hourly forecast." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Cloud,
        tags: ["weather", "forecast", "api", "location"],
        difficulty: "intermediate",
        estimatedTime: "25-30 min",
    },
    {
        id: "url-shortener",
        name: "URL Shortener",
        description: "Shorten and track links",
        category: "tools",
        prompt:
            "Create a URL shortener with: URL input with validation using regex, shorten button generating random short codes, generated short URL display, copy to clipboard button using navigator.clipboard API, URL history list stored in localStorage, click counter for each link, and QR code generator using a simple SVG grid pattern. Use localStorage for persistence, include link analytics (clicks, creation date), and add custom alias option. Use clean, minimal design with clear CTAs and Tailwind styling." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: Link,
        tags: ["url", "shortener", "links", "utility"],
        difficulty: "intermediate",
        estimatedTime: "20-25 min",
    },

    // ===== E-COMMERCE =====
    {
        id: "product-catalog",
        name: "Product Catalog",
        description: "Browse products with filters",
        category: "e-commerce",
        prompt:
            "Build a product catalog with: product grid with image placeholders and prices, category sidebar with filters using filter(), search bar filtering by name, sort dropdown (price, rating, newest) using sort(), product detail modal with image gallery using conditional rendering, add to cart button, and pagination using slice(). Use mock product data in useState, include hover effects on cards with CSS, rating stars using lucide-react icons, stock badges, and responsive Tailwind layout. Add wishlist toggle with localStorage and quick view." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: ShoppingBag,
        tags: ["products", "catalog", "filters", "shopping"],
        difficulty: "intermediate",
        estimatedTime: "25-30 min",
    },
    {
        id: "shopping-cart",
        name: "Shopping Cart",
        description: "Cart with quantity and totals",
        category: "e-commerce",
        prompt:
            "Create a shopping cart with: cart items list with product image placeholders, quantity selectors (+/- buttons), remove button, subtotal calculation using reduce(), shipping options with radio buttons, discount code input with validation, total price display, and checkout button. Use localStorage for cart persistence with useEffect, include empty cart state with illustration, smooth animations for add/remove using CSS transitions, and responsive Tailwind design. Add continue shopping link and save for later feature." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: ShoppingCart,
        tags: ["cart", "checkout", "shopping", "ecommerce"],
        difficulty: "intermediate",
        estimatedTime: "20-25 min",
    },
    {
        id: "checkout-flow",
        name: "Checkout Flow",
        description: "Multi-step checkout process",
        category: "e-commerce",
        prompt:
            "Build a checkout flow with: step indicator (shipping, payment, review) using conditional rendering, shipping address form with validation using useState, payment method selection (cards, PayPal) with radio buttons, order summary sidebar with items and total, promo code input, place order button, and confirmation page. Use form validation with error messages, progress indicator with CSS, smooth step transitions using CSS, and mobile-responsive Tailwind design. Include edit buttons for each step and order number generation using random strings." +
            DEPENDENCY_CONSTRAINT + DESIGN_GUIDELINES,
        icon: CreditCard,
        tags: ["checkout", "payment", "order", "ecommerce"],
        difficulty: "advanced",
        estimatedTime: "30-35 min",
    },
];

// Helper functions
export function getTemplatesByCategory(
    category: TemplateCategory
): Template[] {
    if (category === "all") return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return TEMPLATES.filter(
        (t) =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
}

export function getTemplateById(id: string): Template | undefined {
    return TEMPLATES.find((t) => t.id === id);
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
    all: "All Templates",
    "landing-pages": "Landing Pages",
    dashboards: "Dashboards",
    games: "Games",
    tools: "Tools",
    "e-commerce": "E-commerce",
};

export const CATEGORY_COUNTS: Record<Exclude<TemplateCategory, "all">, number> =
{
    "landing-pages": TEMPLATES.filter((t) => t.category === "landing-pages")
        .length,
    dashboards: TEMPLATES.filter((t) => t.category === "dashboards").length,
    games: TEMPLATES.filter((t) => t.category === "games").length,
    tools: TEMPLATES.filter((t) => t.category === "tools").length,
    "e-commerce": TEMPLATES.filter((t) => t.category === "e-commerce").length,
};


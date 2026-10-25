# LocalLens Mumbai 🧭

> **Discover Authentic Heritage, Iconic Dining & Historic Fortresses across the City of Dreams.**

LocalLens Mumbai is a modern, high-performance web application designed to help travelers, locals, and heritage enthusiasts explore authenticated Mumbai destinations — from century-old Irani cafés and Art Deco edifices to historic Maratha hill forts in the Sahyadris.

---

## 🌟 Key Features

### 1. 🗺️ Dual-Engine Interactive Maps (Split View & Full Map)
- **Split Map & Cards:** Explore listings alongside a sticky, responsive map that seamlessly expands to full viewport height without empty space while scrolling.
- **Dual Map Support:** Integrated with **Google Maps Platform** (with custom Dusk/Sunset and Sunlight night/day themes) and **MapLibre GL** with Carto OSM tiles.
- **Verified Coordinates:** Every plotted pin points to precise, authentic GPS coordinates across Mumbai and surrounding districts.

### 2. 🏛️ Authentic Directory & Verified Experience Notes
- **Categorized Explorations:** Heritage Hotels, Iconic Dining, Historic Bazaars, Art Deco Attractions, and Maratha Forts.
- **Image Verification Priority:** Prioritizes verified experiences using the `image_note` classification (`Verified exact match` listed first, followed by verified notes, then unverified).
- **Zero Hallucination Policy:** Ratings, schedules, and telephone numbers are verified from official municipal records or authentic community submissions.

### 3. 💼 Provider Portal & Establishment Management
- **Manual Price / Amount Input:** Providers can enter custom pricing (e.g. `₹500 for two`, `₹1,200`, `₹350 per person`) instead of being restricted to fixed presets.
- **Supabase Storage Integration:** Direct image upload pipeline with client-side preview, validation, and cloud storage hosting.
- **Strict Isolation:** Providers have private access to their own listings, preventing overlap with other providers' establishments.

### 4. 🛡️ Administrator Governance & Approval Workflow
- **Application Verification:** Review, approve, reject (with mandatory feedback reason), or suspend provider registration requests.
- **Direct Moderation:** Approve, edit, or hide public directory listings in real time.
- **User Role Management:** View active database users and assign Tourist, Provider, or Administrator permissions.

### 5. 🌐 Multilingual & Adaptive Theme Engine
- **Languages Supported:**
  - 🇬🇧 English
  - 🇮🇳 Hindi (हिंदी)
  - 🇮🇳 Marathi (मराठी)
  - 🇮🇳 Gujarati (ગુજરાતી)
- **Themes:**
  - 🌙 **Dusk & Sunset (Dark):** Deep atmospheric purple and amber tones.
  - ☀️ **Mumbai Daylight (Light):** Warm terracotta and crisp cream.
  - 💻 **System Default:** Automatically matches operating system preferences.

### 6. 📱 Universal Device Responsiveness
- Guaranteed compatibility across **Mobile** (320px–639px), **Tablet** (portrait & landscape 640px–1023px), and **Laptop/Desktop** (1024px+).
- Zero element collision, text truncation guards, overflow-x locking, and touch-scrolling controls.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com/) with custom HSL tokens & Glassmorphism |
| **State & Data Caching** | [TanStack React Query v5](https://tanstack.com/query/latest) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth & Storage) |
| **Mapping Engines** | [Google Maps JavaScript API](https://developers.google.com/maps) & [MapLibre GL](https://maplibre.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or higher)
- `npm` or `yarn` / `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/locallens-mumbai.git
   cd locallens-mumbai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Google Maps Platform (Optional - MapLibre fallback is enabled by default)
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Development** | `npm run dev` | Launches local Vite dev server with hot module reloading (HMR) |
| **Typecheck & Build** | `npm run build` | Compiles TypeScript and builds production bundles into `dist/` |
| **Preview** | `npm run preview` | Previews the production build locally |
| **Unit Tests** | `npm run test` | Executes schema and component tests using Vitest |
| **End-to-End Tests** | `npm run e2e` | Runs Playwright browser integration tests |

---

## 🗄️ Database Architecture

The application connects to Supabase PostgreSQL using Row Level Security (RLS). Core tables include:

- `public.profiles`: Stores user identity, avatar, role (`tourist`, `provider`, `admin`), provider approval status (`pending`, `approved`, `rejected`, `suspended`), and review notes.
- `public.experience` / `public.listings`: Heritage establishments, GPS coordinates, category, price level, operational hours, verified notes, and cover media.
- `public.reviews`: Community visitor reviews with numeric ratings and commentary.
- `public.favorites`: Tourist itinerary bookmarks and saved locations.
- `storage.buckets ('listings')`: Public asset storage bucket for establishment photography.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

# TableMaster.io

A comprehensive toolkit for tabletop RPG game masters, featuring name generators, interactive maps, soundscapes, and shop management systems.

## 🎮 Features

- **Name Generator** - Generate fantasy names for characters, places, and items
- **Interactive Maps** - Multiple fantasy world maps (Makono, Ankreal, Pirate, Fantasy)
- **Soundscape** - Ambient audio for immersive gameplay
- **Shop System** - Manage shops, items, and inventory for your campaigns
- **Admin Interface** - Create and edit shops and items

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Styled Components
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, REST API)
- **3D Graphics**: Three.js
- **2D Maps**: Leaflet, React Leaflet
- **Utilities**: D3 Delaunay, Simplex Noise, UUID

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for local Supabase development)
- Supabase CLI (optional, for local development)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tablemaster.io
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.development` file in the root directory:

```env
VITE_SUPABASE_PROJECT_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANONYMOUS_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

For production, create `.env.production` with your production Supabase credentials.

### 4. Set Up Local Supabase (Optional)

If you want to develop with a local Supabase instance:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init

# Start local Supabase (requires Docker)
supabase start

# Link to your production project (optional)
supabase link
```

The local Supabase instance will be available at:
- **API URL**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🗂️ Project Structure

```
src/
├── components/       # Reusable React components
│   ├── icons/       # Icon components
│   └── ...
├── pages/           # Page components (routes)
│   ├── AdminPage.tsx
│   ├── EditShopPage.tsx
│   ├── NameGeneratorPage.tsx
│   ├── MapGeneratorPage.tsx
│   ├── ShopPage.tsx
│   └── ...
├── services/        # Supabase service functions
│   ├── createShop.tsx
│   ├── updateShop.tsx
│   ├── getShop.tsx
│   └── getAllShops.tsx
├── supabaseClient.ts    # Supabase client configuration
├── database-generated.types.ts  # TypeScript types from Supabase
└── main.tsx         # Application entry point
```

## 🗄️ Database Schema

The application uses Supabase with the following main tables:

- **shop** - Shop information (name, location, type, description, opening hours)
- **shop_item** - Items available in shops
- **user** - User accounts
- **campaign** - Campaign data
- **Items** - General items catalog

## 🔧 Development

### Local Development with Supabase

1. Start local Supabase: `supabase start`
2. Ensure `.env.development` points to `http://127.0.0.1:54321`
3. Run `npm run dev`
4. Access Supabase Studio at http://127.0.0.1:54323 to manage your local database

### Syncing with Production

```bash
# Pull schema from production
supabase db pull

# Push local migrations to production
supabase db push

# View differences
supabase db diff
```

## 🌐 Routes

- `/` - Main page / Product page
- `/name-generator` - Name generator tool
- `/map/makonos` - Makono map
- `/map/ankreal` - Ankreal map
- `/map/pirat` - Pirate map
- `/map/fantasy` - Fantasy map
- `/soundscape` - Soundscape player
- `/shop` - Shop landing page
- `/shop/:uuid` - Individual shop page
- `/admin` - Admin dashboard
- `/admin/shop/:shopId` - Edit shop page

## 🔐 Environment Variables

| Variable | Description | Development Default |
|----------|-------------|---------------------|
| `VITE_SUPABASE_PROJECT_URL` | Supabase project URL | http://127.0.0.1:54321 |
| `VITE_SUPABASE_ANONYMOUS_KEY` | Supabase anonymous key | (local dev key) |

## 📝 Notes

- The project uses Vite's environment variable system - variables must be prefixed with `VITE_` to be accessible in the browser
- Local Supabase uses Docker - make sure Docker Desktop is running
- TypeScript types are generated from your Supabase schema

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request


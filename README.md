# TableMaster.io

A comprehensive toolkit for tabletop RPG game masters, featuring name generators, interactive maps, soundscapes, and shop management systems.

## 🎮 Features

-   **Name Generator** - Generate fantasy names for characters, places, and items
-   **Interactive Maps** - Multiple fantasy world maps (Makono, Ankreal, Pirate, Fantasy)
-   **Soundscape** - Ambient audio for immersive gameplay
-   **Shop System** - Manage shops, items, and inventory for your campaigns
-   **Admin Interface** - Create and edit shops and items

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Styled Components
-   **Routing**: React Router v6
-   **Backend**: Supabase (PostgreSQL, REST API)
-   **3D Graphics**: Three.js
-   **2D Maps**: Leaflet, React Leaflet
-   **Utilities**: D3 Delaunay, Simplex Noise, UUID

## 📋 Prerequisites

-   Node.js 18+ and npm
-   Docker Desktop (for local Supabase development)
-   Supabase CLI (optional, for local development)

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

-   **API URL**: http://127.0.0.1:54321
-   **Studio**: http://127.0.0.1:54323
-   **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📜 Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run ESLint

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

-   **shop** - Shop information (name, location, type, description, opening hours)
-   **shop_item** - Items available in shops
-   **user** - User accounts
-   **campaign** - Campaign data
-   **Items** - General items catalog

## 🔧 Development

### Local Development with Supabase

1. Start local Supabase: `supabase start`
2. Ensure `.env.development` points to `http://127.0.0.1:54321`
3. Run `npm run dev`
4. Access Supabase Studio at http://127.0.0.1:54323 to manage your local database

### Setting Up Google OAuth

The admin panel uses Google OAuth for authentication. To set it up:

#### For Local Development:

**IMPORTANT**: For local Supabase, OAuth providers must be configured via environment variables. The "Providers" section is not available in local Supabase Studio.

1. **Set Environment Variables** (required for local dev):

    You can add the Google OAuth credentials to your `.env.development` file:

    ```bash
    SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-client-id"
    SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="your-client-secret"
    ```

    Then restart Supabase using one of these methods:

    **Option A: Use the provided script** (easiest):

    ```bash
    ./start-supabase.sh
    ```

    **Option B: Export manually and restart**:

    ```bash
    export $(grep SUPABASE_AUTH_EXTERNAL_GOOGLE .env.development | xargs)
    supabase stop
    supabase start
    ```

    **Option C: Export directly**:

    ```bash
    export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-client-id"
    export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="your-client-secret"
    supabase stop
    supabase start
    ```

    **Note**: The environment variables must be set in the same terminal session where you run `supabase start`.

2. **Get Google OAuth Credentials** (if you don't have them):

    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select existing one
    - Enable **Google+ API** (or **Google Identity Services API**)
    - Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
    - Set application type to **"Web application"**
    - **IMPORTANT**: Add these authorized redirect URIs (both are needed):
        - `http://127.0.0.1:54321/auth/v1/callback` (Supabase callback - required)
        - `http://localhost:54321/auth/v1/callback` (alternative localhost version)
    - Copy the **Client ID** and **Client Secret**
    - **Note**: The redirect URI in Google Cloud Console must match Supabase's callback URL, NOT your app's URL

3. **For Production** (use Supabase Studio):

    - Go to your Supabase project dashboard (not local Studio)
    - Navigate to **Authentication** > **Providers**
    - Find **Google** and enable it
    - Add your Google OAuth credentials:
        - Client ID (from Google Cloud Console)
        - Client Secret (from Google Cloud Console)
    - Add authorized redirect URLs:
        - `https://your-domain.com/admin`
        - `https://your-project.supabase.co/auth/v1/callback`

4. **Setting Up Google Cloud Console**:
    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select existing one
    - Enable Google+ API
    - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
    - Set application type to "Web application"
    - **IMPORTANT**: Add authorized redirect URIs (these must match exactly):
        - For local dev: `http://127.0.0.1:54321/auth/v1/callback`
        - For production: `https://your-project.supabase.co/auth/v1/callback`
    - Copy the Client ID and Client Secret to Supabase
    - **Note**: The redirect URI is Supabase's callback URL, NOT your app's URL. Supabase handles the redirect to your app automatically.

#### Access Control:

For this POC:

-   **Anyone** (including anonymous/unauthenticated users) can **read** shops and items. This means the `/shop` pages are publicly accessible.
-   **Any authenticated user** (anyone who logs in with Google) can **create and edit** shops and items. The RLS policies have been configured to allow all authenticated users to manage shops and items.

**Note**: In production, you may want to restrict access to specific users or roles. You can do this by:

-   Modifying the RLS policies in the database
-   Adding role-based checks in the application code
-   Using Supabase's built-in role management features

### Syncing with Production

```bash
# View differences between local and production
supabase db diff --linked

# Push local migrations to production
supabase db push

# Pull schema from production (if you need to sync existing tables)
supabase db dump --linked --schema public --data-only=false > supabase/migrations/$(date +%Y%m%d%H%M%S)_production_schema.sql
```

**Note**: When pushing migrations, Supabase will only apply the changes specified in your migration files. Existing tables in production that aren't mentioned in your migrations will remain untouched. See `MIGRATION_GUIDE.md` for more details.

## 🌐 Routes

-   `/` - Main page / Product page
-   `/name-generator` - Name generator tool
-   `/map/makonos` - Makono map
-   `/map/ankreal` - Ankreal map
-   `/map/pirat` - Pirate map
-   `/map/fantasy` - Fantasy map
-   `/soundscape` - Soundscape player
-   `/shop` - Shop landing page
-   `/shop/:uuid` - Individual shop page
-   `/admin/login` - Admin login page
-   `/admin` - Admin dashboard (protected)
-   `/admin/shop/new` - Create new shop (protected)
-   `/admin/shop/:shopId` - View shop details (protected)
-   `/admin/shop/:shopId/edit` - Edit shop (protected)
-   `/admin/shop/:shopId/item/new` - Create new item (protected)
-   `/admin/shop/:shopId/item/:itemId/edit` - Edit item (protected)

## 🔐 Environment Variables

| Variable                      | Description            | Development Default    |
| ----------------------------- | ---------------------- | ---------------------- |
| `VITE_SUPABASE_PROJECT_URL`   | Supabase project URL   | http://127.0.0.1:54321 |
| `VITE_SUPABASE_ANONYMOUS_KEY` | Supabase anonymous key | (local dev key)        |

## 📝 Notes

-   The project uses Vite's environment variable system - variables must be prefixed with `VITE_` to be accessible in the browser
-   Local Supabase uses Docker - make sure Docker Desktop is running
-   TypeScript types are generated from your Supabase schema

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

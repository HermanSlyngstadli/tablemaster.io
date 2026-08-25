#!/bin/bash
# Script to start Supabase with Google OAuth environment variables
# This reads from .env.development and exports the variables before starting Supabase

cd "$(dirname "$0")"

# Load Google OAuth variables from .env.development
if [ -f .env.development ]; then
    export $(grep SUPABASE_AUTH_EXTERNAL_GOOGLE .env.development | xargs)
    echo "✓ Loaded Google OAuth credentials from .env.development"
else
    echo "⚠ Warning: .env.development not found"
fi

# Start Supabase
supabase start



# Lost & Found

A full-stack Lost & Found web application to help people reunite with their lost belongings.

## Features

- Post lost/found items with multiple images (up to 5)
- Dual upload options: camera capture or gallery selection
- Contact information (email/phone) for direct communication
- Secret verification system for marking items as found/returned
- Real-time search and filtering
- Dark mode support
- Image compression and CDN delivery
- Mobile-optimized responsive design

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, TanStack Query

**Backend:** Express.js, TypeScript, Neon PostgreSQL, Drizzle ORM, ImageKit CDN

## Setup Instructions

### Prerequisites
- Node.js 20+
- Neon PostgreSQL database
- ImageKit.io account

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id/

# Server (optional)
PORT=5000
```

### Installation & Running

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```


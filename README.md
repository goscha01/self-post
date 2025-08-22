# Post-It: Social Media Automation Platform

A comprehensive social media automation platform built with Next.js frontend and NestJS backend, featuring Google Business Profile integration for managing business profiles, scheduling posts, and tracking analytics.

## 🚀 Features

- **Google Business Profile Integration**: Connect and manage multiple business profiles
- **Social Media Automation**: Schedule and automate posts across platforms
- **Analytics Dashboard**: Track performance and engagement metrics
- **Multi-Platform Support**: Google Business Profile, with extensible architecture for other platforms
- **Real-time Updates**: Live data synchronization and monitoring

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React, TypeScript, and Tailwind CSS
- **Backend**: NestJS with TypeScript, TypeORM, and PostgreSQL
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth 2.0 with JWT
- **State Management**: Zustand for client-side state

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Zustand

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL (Supabase)
- Passport.js (Google OAuth)
- JWT Authentication

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)
- Google Cloud Console project with OAuth 2.0 credentials

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/goscha01/post-it.git
cd post-it
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT
JWT_SECRET=your-jwt-secret
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

### 4. Database Setup
```bash
cd backend
npm run migration:run
```

### 5. Start Development Servers

#### Backend
```bash
cd backend
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

## 🔧 Google OAuth Setup

### 1. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Business Profile API
4. Configure OAuth consent screen with offline access
5. Create OAuth 2.0 credentials

### 2. Required OAuth Scopes
- `profile`
- `email`
- `https://www.googleapis.com/auth/business.manage`

### 3. OAuth Consent Screen Settings
- **Access Type**: Must include "Offline"
- **Publishing Status**: "Published" or add users as "Test Users"

## 📁 Project Structure

```
post-it/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication & OAuth
│   │   ├── entities/        # TypeORM entities
│   │   ├── business-profile/ # Google Business Profile service
│   │   └── main.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── store/          # Zustand state management
│   ├── package.json
│   └── next.config.js
├── .gitignore
└── README.md
```

## 🔐 Authentication Flow

1. **OAuth Initiation**: User clicks "Connect Google" button
2. **Google Consent**: User grants permissions on Google's consent screen
3. **Token Exchange**: Google returns access token and refresh token
4. **Profile Creation**: Backend creates/updates user profile
5. **JWT Generation**: Backend generates JWT for authenticated sessions

## 📊 Business Profile Features

- **Account Management**: List and manage multiple business accounts
- **Location Data**: Access business locations, hours, and contact info
- **Reviews Management**: View and respond to customer reviews
- **Posts Management**: Create and schedule business posts
- **Analytics**: Track performance metrics and insights

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend Deployment
```bash
cd frontend
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting guide

## 🔄 Recent Updates

- Enhanced Google OAuth debugging and error handling
- Comprehensive business profile data fetching
- Force fresh consent functionality for OAuth issues
- Enhanced logging and debugging capabilities
- Business profile management UI improvements

---

**Built with ❤️ using Next.js, NestJS, and TypeScript**

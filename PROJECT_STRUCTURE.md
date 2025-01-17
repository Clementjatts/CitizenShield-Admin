# Project Structure

This document provides an overview of the CitizenShield Admin Dashboard project structure.

## Directory Structure

```
citizenshield-admin/
├── src/                          # Source code
│   ├── assets/                   # Static assets (images, icons)
│   │   ├── avatar.png
│   │   └── logo.png
│   ├── components/               # Reusable components
│   │   ├── cards/               # Card components
│   │   │   ├── AlertCard.tsx
│   │   │   ├── BlogArticleCard.tsx
│   │   │   ├── ForumPostCard.tsx
│   │   │   ├── MessageCard.tsx
│   │   │   ├── NotificationCard.tsx
│   │   │   └── UserCard.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── PublicHeader.tsx
│   │   │   └── Sider.tsx
│   │   ├── map/                 # Map-related components
│   │   │   └── MapView.tsx
│   │   ├── FileGallery.tsx
│   │   ├── FileUploader.tsx
│   │   └── ProtectedRoute.tsx
│   ├── config/                   # Configuration files
│   │   ├── App.tsx
│   │   └── firebaseConfig.ts
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/                    # Page components
│   │   └── EmergencyContacts.tsx
│   ├── types/                    # TypeScript type definitions
│   │   └── shared.ts
│   ├── utils/                    # Utility functions
│   │   ├── errorHandler.ts
│   │   └── locationUtils.ts
│   ├── views/                    # View components
│   │   ├── auth/                # Authentication views
│   │   │   ├── AuthPage.css
│   │   │   └── AuthPage.tsx
│   │   ├── dashboard/           # Dashboard views
│   │   │   ├── AlertsView.tsx
│   │   │   ├── BlogView.tsx
│   │   │   ├── ForumView.tsx
│   │   │   ├── MessagesView.tsx
│   │   │   ├── NotificationsView.tsx
│   │   │   └── UsersView.tsx
│   │   └── forms/               # Form components
│   │       ├── CreateArticleForm.tsx
│   │       └── CreateNotificationForm.tsx
│   ├── custom.d.ts              # Custom TypeScript declarations
│   ├── index.css                # Global styles
│   └── index.tsx                # Application entry point
├── public/                       # Public assets
├── .expo/                       # Expo configuration
├── node_modules/                # Dependencies
├── package.json                 # Project configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── README.md                    # Project documentation
```

## Key Components

### Authentication
- `AuthContext.tsx`: Manages authentication state
- `AuthPage.tsx`: Handles user login/registration

### Layout
- `Header.tsx`: Main application header
- `Sider.tsx`: Sidebar navigation
- `PublicHeader.tsx`: Header for public pages

### Dashboard Views
- `AlertsView.tsx`: Emergency alerts management
- `BlogView.tsx`: Blog articles management
- `ForumView.tsx`: Community forum management
- `MessagesView.tsx`: User messages handling
- `NotificationsView.tsx`: System notifications
- `UsersView.tsx`: User management

### Forms
- `CreateArticleForm.tsx`: Blog article creation
- `CreateNotificationForm.tsx`: System notification creation

### Map Components
- `MapView.tsx`: Interactive map implementation

### Utilities
- `errorHandler.ts`: Error handling utilities
- `locationUtils.ts`: Location-related utilities

## Configuration Files

### Firebase Configuration
`firebaseConfig.ts` contains Firebase configuration for:
- Authentication
- Firestore Database
- Storage
- Messaging

### Tailwind Configuration
`tailwind.config.js` manages:
- Theme customization
- Plugin configuration
- Dark mode settings

# CitizenShield Admin Dashboard

A comprehensive administrative dashboard for the CitizenShield platform, built with React and modern web technologies.

## Overview

CitizenShield Admin Dashboard is a powerful web application designed to manage and monitor citizen safety and community engagement. It provides administrators with tools to manage alerts, user communications, blog articles, and emergency contacts.

## Features

- **Alert Management**: Monitor and manage emergency alerts and incidents
- **User Management**: Oversee user accounts and permissions
- **Message Center**: Handle communication between users and administrators
- **Blog Management**: Create and manage blog articles
- **Forum Moderation**: Moderate community forum posts
- **Notification System**: Send and manage system-wide notifications
- **Interactive Map**: View and manage location-based data
- **File Management**: Upload and manage files and media

## Tech Stack

- React 18.3.1
- Firebase (Authentication & Database)
- Ant Design (UI Components)
- React Router DOM
- TailwindCSS
- Leaflet (Maps)
- TypeScript

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account and configuration

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd citizenshield-admin
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for a detailed overview of the project organization.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying or distribution of this project's files, via any medium, is strictly prohibited.

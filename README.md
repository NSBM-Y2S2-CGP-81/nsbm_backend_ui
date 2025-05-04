# NSBM Super App Admin Panel - Setup Guide

This repository contains the NSBM Super App Admin Panel frontend built with Next.js. The application serves as an administrative interface for managing NSBM Green University's system.

## Login Credentials

### Admin Login
- **Email:** admin@gmail.com
- **Password:** p4w4n10324

### MIC (Masters In Charge) Login
- **Email:** ieee@gmail.com or foss@gmail.com
- **Password:** p4w4n10324

## Getting Started

Follow these steps to set up and run the application locally:

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nsbm-backend-ui.git
   cd nsbm-backend-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `config.js` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_SERVER_ADDRESS=http://47.128.245.74:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Application Structure

The application is divided into three main sections:

1. **Admin Interface** - For university administrators
2. **MIC Interface** - For clubs and societies' Masters In Charge
3. **UniFresh Interface** - For food service vendors

You can access these interfaces from the main selection page when you first load the application.

## Features

### Admin Features
- User Management
- Event Management
- News Management
- Lecture Scheduling
- MongoDB Interface

### MIC Features
- Event Details
- Event Management
- Event Analysis
- Profile Management

### UniFresh Features
- Menu Management
- Order Management
- Sales Analysis
- Profile Management

## API Integration

The application integrates with a backend server running at `http://47.128.245.74:5000`. Authentication is handled through JWT tokens which are stored in localStorage after successful login.

## Technology Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- Recharts for data visualization
- Framer Motion for animations

## Development Notes

- Authentication tokens are stored in `localStorage` under the key `NEXT_PUBLIC_SYS_API`
- API calls use the fetcher utility which handles token renewal and error states
- The application uses responsive design and works on both desktop and mobile devices

## Building for Production

```bash
npm run build
# or
yarn build
```

Then, you can start the production server:

```bash
npm start
# or
yarn start
```

## Deployment

The application can be deployed to any hosting provider that supports Next.js applications, such as Vercel, Netlify, or a custom server.

For deploying to Vercel:

```bash
npm install -g vercel
vercel
```

# HR Administration System

This project is an HR Administration System built with the T3 stack, designed to manage employee details and departments. The system allows for role-based access control, where administrators can manage all aspects of the system, managers can manage their departments and subordinates, and employees can view and edit their own information.

## Features

- **Authentication**: Secure login system with role-based access control
- **Employee Management**: Create, view, edit, and filter employees
- **Department Management**: Create, view, edit, and filter departments
- **Role-Based Access Control**:
    - Admins: Full access to all employees and departments
    - Managers: Access to their departments and subordinates
    - Employees: Access to their own information only
- **Status Management**: Activate/deactivate employees and departments
- **Pagination**: View data in manageable pages
- **Search and Filtering**: Filter employees and departments by various criteria

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: NextAuth.js with Credentials Provider
- **API Layer**: tRPC
- **Form Validation**: Zod with react-hook-form
- **State Management**: React Query (via tRPC)
- **UI Components**:
    - Lucide React for icons
    - React Hot Toast for notifications
    - Geist font
- **Build Tools**:
    - ESLint for code linting
    - Prettier for code formatting
- **Deployment**: Render (with persistent SQLite storage)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hr-admin-system-tg.git
   cd hr-admin-system-tg
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="file:./db.sqlite"
   AUTH_SECRET="your-nextauth-secret"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database with initial admin user:
   ```bash
   npx prisma db seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application has been deployed on Render and is accessible at:

https://hr-admin-system-tg.onrender.com/

### Note about the Render Free Tier

This project is deployed on Render's free tier with the following characteristics:

- **Spin-down with inactivity**: The service automatically spins down after 15 minutes of inactivity.
- **Cold start delays**: When accessing the site after inactivity, the initial request may take up to 50 seconds while the service spins up.
- **Database persistence**: Unlike Vercel's ephemeral filesystem, Render allows SQLite database changes to persist between sessions.


### Default Admin User

The seeding script creates an admin user with the following credentials:
- **Email**: hradmin@test.com
- **Password**: TestPass1234

## Project Structure

```
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js pages and routes
│   │   ├── api/          # API endpoints
│   │   ├── departments/  # Department pages
│   │   ├── employees/    # Employee pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Login page
│   │   └── providers.tsx # Client providers
│   ├── components/       # Shared UI components
│   │   ├── auth/         # Authentication components
│   │   ├── departments/  # Department-specific components
│   │   ├── employees/    # Employee-specific components
│   │   └── ui/           # UI components
│   ├── lib/              # Utility functions
│   ├── server/           # Server-side code
│   │   ├── api/          # API routes and tRPC routers
│   │   ├── auth/         # Authentication configuration
│   │   └── db.ts         # Database client
│   ├── styles/           # Global styles
│   ├── trpc/             # tRPC client setup
│   └── types/            # TypeScript type definitions
└── ...
```

## Usage

### Login

Navigate to the home page to access the login form. Use the provided admin credentials or create new employees through the admin interface.

### Employees

- **List View**: View all employees (filtered based on user role)
- **Create/Edit**: Manage employee details
- **Filtering**: Filter employees by status, manager, or department

### Departments

- **List View**: View all departments (filtered based on user role)
- **Create/Edit**: Manage department details
- **Filtering**: Filter departments by status

## Role-Based Access

The system implements the following access controls:

- **HR Administrator (ADMIN)**:
    - Can view and edit all employees and departments
    - Can change an employee's manager and status
    - Can create/edit departments and assign managers
    - Can activate/deactivate employees and departments

- **Manager (MANAGER)**:
    - Can view all employees in their departments
    - Can view departments they manage
    - Can edit employee details except for manager and status
    - Cannot change an employee's manager or status
    - Cannot create or edit departments

- **Employee (EMPLOYEE)**:
    - Can only view and edit their own information
    - Cannot change their manager or status
    - Cannot view other employees or departments

## Automatic User Creation

When an employee is added, a user is automatically created with:
- Email: Same as the employee's email address
- Password: Password123# (default)
- Role: EMPLOYEE (automatically updated to MANAGER when assigned as department manager)

Role transitions are managed automatically:
- When an employee is assigned as a department manager, their role changes to MANAGER
- When an employee is removed as a department manager and doesn't manage any other departments or employees, their role reverts to EMPLOYEE

## Quick Start Script

For convenience, you can use the included setup script to quickly get started:

```bash
#!/bin/bash

# Install dependencies
npm install

# Set up the database
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed

# Start the development server
npm run dev
```

Save this as `setup.sh` in the root directory, and run:
```bash
chmod +x setup.sh
./setup.sh
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

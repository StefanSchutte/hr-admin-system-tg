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

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **API Layer**: tRPC
- **Form Validation**: Zod with react-hook-form

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hr-administration-system.git
   cd hr-administration-system
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
│   ├── components/       # UI components
│   ├── server/           # Server-side code
│   │   ├── api/          # API routes and tRPC routers
│   │   ├── auth/         # Authentication configuration
│   │   └── db.ts         # Database client
│   ├── types/            # TypeScript type definitions
│   ├── app/              # Next.js pages and routes
│   └── trpc/             # tRPC client setup
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

- **Manager (MANAGER)**:
    - Can view all employees in their departments
    - Can view departments they manage
    - Cannot change an employee's manager or status

- **Employee (EMPLOYEE)**:
    - Can only view and edit their own information
    - Cannot change their manager or status

## Automatic User Creation

When an employee is added, a user is automatically created with:
- Email: Same as the employee's email address
- Password: Password123# (default)
- Role: EMPLOYEE (automatically updated to MANAGER when assigned as department manager)

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

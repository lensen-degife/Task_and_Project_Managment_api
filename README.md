# Project Management API

A RESTful Project Management API built with **Node.js, TypeScript, Express, PostgreSQL, and Prisma ORM**. It provides secure authentication, project management, task tracking, team membership management, and comments.

## Live Deployment

- **API Base URL:** `https://project-managment-api-7bpk.onrender.com`
- **Health Check:** `https://project-managment-api-7bpk.onrender.com/health`
- **GitHub Repository:** `https://github.com/lensen-degife/project-managment-api`

## Features

### Authentication
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Retrieve the currently authenticated user.
- Protected routes.

### Project Management
- Create, retrieve, update, and delete projects.
- List projects accessible to the authenticated user.
- Project ownership and membership management.
- Role-based project permissions.

### Task Management
- Create, retrieve, update, and delete tasks.
- Assign tasks to project members.
- Filter tasks by relevant fields.
- Pagination for task listing.
- Task priorities and statuses.

### Project Membership
- Add members to projects.
- List project members.
- Change member roles.
- Remove members.
- Enforce role-based permissions.

### Comments
- Create comments on tasks.
- Retrieve comments.
- Update comments.
- Delete comments.
- Only comment authors can edit or delete their comments.

### Additional Features
- Request validation using Zod.
- Centralized error handling.
- Security middleware using Helmet.
- CORS configuration.
- Rate limiting for authentication routes.
- Environment variable validation.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| TypeScript | Type safety |
| Express.js | REST API framework |
| PostgreSQL | Relational database |
| Prisma ORM | Database access and migrations |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| Helmet | HTTP security headers |
| express-rate-limit | Request rate limiting |
| Neon | Hosted PostgreSQL |
| Render | API deployment |

## Project Structure

```text
project-managment-api/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── generated/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── members/
│   │   ├── projects/
│   │   └── tasks/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── prisma7.config.ts
└── tsconfig.json
```


## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/lensen-degife/project-managment-api
cd project-managment-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=your_database_connection_string
DIRECT_URL=your_direct_database_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

Never commit your actual `.env` file.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate deploy
```

For a fresh development database where you are creating a new migration, use:

```bash
npx prisma migrate dev --name init
```

### 6. Start development server

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:4000
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run typecheck` | Check TypeScript types |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate deploy` | Apply production migrations |

## API Endpoints

All API routes are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create a project |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/:id` | Get task details |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Comments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/comments` | Create a comment |
| GET | `/api/comments` | List comments |
| PATCH | `/api/comments/:id` | Update a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

### Project Members

Document your actual member routes here, including adding members, listing members, changing roles, and removing members.

**Note:** Protected endpoints require a valid JWT access token in the Authorization header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Error Handling

The API uses centralized error handling and consistent JSON responses.

Example:

```json
{
  "success": false,
  "message": "Project not found"
}
```

Common HTTP status codes:

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Resource conflict |
| 500 | Internal server error |

## Database

The application uses PostgreSQL with Prisma ORM.

Main database models include:

- User
- Project
- ProjectMember
- Task
- Comment

Database schema and migration files are located in the `prisma/` directory.

## Deployment

The API is deployed using **Render**, with **Neon PostgreSQL** as the hosted database.

Production environment variables are configured in the Render dashboard.

## API Testing

API endpoints were tested using Insomnia, including authentication, CRUD operations, validation, and authorization.

## Future Improvements

- Automated integration and unit tests.
- API documentation using Swagger/OpenAPI.
- CI/CD workflow with GitHub Actions.
- Additional monitoring and logging.

## Author

**Lensen Degife**

GitHub: [lensen-degife](https://github.com/lensen-degife)

Portfolio: [lensen-degife.vercel.app](https://lensen-degife.vercel.app/)

---

*Built as a backend engineering project to demonstrate REST API development, database design, authentication, authorization, and deployment.*

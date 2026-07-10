# Booking Platform API

A production style **Booking Platform REST API** built from NestJS. Users can register/login, manage services, and customers can book those services without needing an account.

---

## 1. Project Overview

The API exposes three domains:

- **Auth** — registration, login, and JWT access/refresh token issuance.
- **Services** — CRUD for bookable services, restricted to authenticated users.
- **Bookings** — public booking creation for customers, with authenticated management (list/view/update status/cancel).


## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens), bcrypt password hashing |
| Validation | class-validator / class-transformer |
| Docs | Swagger (OpenAPI) + Postman collection |
| Rate limiting | @nestjs/throttler |
| Containerization | Docker / docker-compose |


## 3. Installation

```bash
git clone <repo-url>
cd booking-platform-api
npm install
```

## 4. Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```


## 5. Database Setup & Migrations

**Option A — local PostgreSQL:**
```bash
# ensure PostgreSQL is running and DATABASE_URL in .env points to it
npx prisma migrate dev --name init
npm run prisma:seed
```

**Option B — Docker (recommended, zero local setup):**
```bash
docker-compose up --build
```
This starts PostgreSQL, waits for it to be healthy, runs `prisma migrate deploy`, then starts the API.

To open Prisma Studio (visual DB browser):
```bash
npm run prisma:studio
```

## 6. Running the Application

```bash
npm run start:dev     
npm run start        
npm run start:prod     
```

The API is served under a global prefix and version: `http://localhost:3000/api/v1`.

Every response follows one shape:
```json
{ "success": true, "message": "Booking created successfully", "data": { } }
```
```json
{ "success": false, "message": "Service with id \"...\" was not found.", "data": null, "path": "/api/v1/services/...", "timestamp": "..." }
```

## 7. API Documentation

- **Swagger UI:** `http://localhost:3000/docs` 
- **Postman collection:** `postman/Booking-Platform-API.postman_collection.json`

### Endpoints

**Auth**
| Method | Path | Auth |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Refresh token |

**Services** (all require `Authorization: Bearer <accessToken>`)
| Method | Path |
|---|---|
| POST | `/services` |
| GET | `/services?page=&limit=&search=&isActive=` |
| GET | `/services/:id` |
| PATCH | `/services/:id` |
| DELETE | `/services/:id` |

**Bookings**
| Method | Path | Auth |
|---|---|---|
| POST | `/bookings` | **Public** |
| GET | `/bookings?page=&limit=&status=&search=&serviceId=` | Required |
| GET | `/bookings/:id` | Required |
| PATCH | `/bookings/:id/status` | Required |
| PATCH | `/bookings/:id/cancel` | Required |

**Health**
| Method | Path |
|---|---|
| GET | `/health` |

## 8. Business Rules Enforced

- A booking must reference an existing, active service (`404`/`400` otherwise).
- Booking date cannot be in the past — validated both at the DTO level and re-checked server-side.
- A cancelled booking can never transition to any other status, including `COMPLETED`.
- A completed booking cannot be cancelled.
- Service management (create/update/delete) requires authentication; booking creation does not.
- Duplicate bookings for the same `serviceId` + `bookingDate` + `bookingTime` are rejected via a database unique constraint, surfaced as `409 Conflict`.

## 9. Testing

```bash
npm run test        # unit tests
npm run test:cov     
```

## Quick Start (TL;DR)

```bash
cp .env.example .env
docker-compose up --build
# API:     http://localhost:3000/api/v1
# Swagger: http://localhost:3000/docs
# Seeded user: admin@en2h.com / Password123!
```

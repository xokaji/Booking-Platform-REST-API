# Booking Platform API

A production-style **Booking Platform REST API**

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

# -Booking-Platform-REST-API-

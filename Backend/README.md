# SettleKar Backend

Smart Expense Splitting & Settlement System - Backend API

## Tech Stack

- **Java 21** + **Spring Boot 4.0.3**
- **Spring Security** (JWT + Google OAuth2)
- **Spring Data JPA** (Hibernate, MySQL)
- **Razorpay Java SDK** (Payment gateway)
- **AWS S3 SDK** (Receipt uploads)
- **Spring Mail** (Gmail SMTP)
- **Lombok** + **ModelMapper**

## How to Run

### Prerequisites
- Java 21+
- MySQL 8+ running on `localhost:3306`
- Database `settlekar_db` created

### Steps

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS settlekar_db;"

# Run the application
./mvnw spring-boot:run
```

Hibernate will auto-create all 12 tables on startup (`ddl-auto=update`).

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/verify?token=` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/health` | Health check |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/update-profile` | Update profile (incl. username) |
| POST | `/api/users/change-password` | Change password |
| POST | `/api/users/set-password` | Set password (Google users) |
| GET | `/api/users/search?q=` | Search users by username |
| GET | `/api/users/check-username?username=` | Check username availability |

### Groups (`/api/groups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group |
| GET | `/api/groups` | List user's groups (paginated) |
| GET | `/api/groups/{id}` | Get group details |
| PUT | `/api/groups/{id}` | Update group (admin) |
| DELETE | `/api/groups/{id}` | Delete group (admin) |
| POST | `/api/groups/{id}/lock` | Lock group (admin) |
| POST | `/api/groups/{id}/extend` | Extend hostel group (admin) |
| POST | `/api/groups/{id}/members` | Add member by username (admin) |
| DELETE | `/api/groups/{id}/members/{userId}` | Remove member (admin) |
| GET | `/api/groups/{id}/members` | List members |
| PUT | `/api/groups/{id}/members/{userId}/role` | Change member role (admin) |
| GET | `/api/groups/{id}/ledger` | View transaction ledger |

### Expenses (`/api/groups/{id}/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups/{id}/expenses` | Create expense |
| GET | `/api/groups/{id}/expenses` | List expenses (paginated, sortable) |
| GET | `/api/groups/{id}/expenses/{eid}` | Get expense details |
| PUT | `/api/groups/{id}/expenses/{eid}` | Update expense |
| DELETE | `/api/groups/{id}/expenses/{eid}` | Delete expense |
| POST | `/api/groups/{id}/expenses/{eid}/receipt` | Upload receipt (multipart) |

### Balances (`/api/groups/{id}/balances`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups/{id}/balances` | Pairwise balances |
| GET | `/api/groups/{id}/balances/summary` | Balance summary per member |
| GET | `/api/groups/{id}/balances/graph` | Debt graph (nodes + edges) |

### Settlements (`/api/groups/{id}/settlements`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups/{id}/settlements/optimize` | Optimized settlement suggestions |
| POST | `/api/groups/{id}/settlements` | Create settlement |
| GET | `/api/groups/{id}/settlements` | List settlements (paginated) |
| PUT | `/api/groups/{id}/settlements/{sid}/confirm` | Confirm settlement (receiver) |

### Payments (`/api/payments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify Razorpay payment |
| GET | `/api/payments/{pid}` | Get payment status |
| POST | `/api/payments/webhook` | Razorpay webhook (public) |

### Recurring Expenses (`/api/groups/{id}/recurring`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups/{id}/recurring` | Create recurring template |
| GET | `/api/groups/{id}/recurring` | List active templates |
| PUT | `/api/groups/{id}/recurring/{rid}` | Update template |
| DELETE | `/api/groups/{id}/recurring/{rid}` | Deactivate template |

### Analytics (`/api/groups/{id}/analytics`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups/{id}/analytics/category` | Category-wise breakdown |
| GET | `/api/groups/{id}/analytics/monthly` | Monthly breakdown |
| GET | `/api/groups/{id}/analytics/member` | Member-wise breakdown |

### Export (`/api/groups/{id}/export`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups/{id}/export/csv` | Download expenses as CSV |

## Database Entities (12 tables)

| Entity | Table | Description |
|--------|-------|-------------|
| User | `users` | User accounts (email, username, OAuth) |
| VerificationToken | `verification_tokens` | Email verification tokens |
| PasswordResetToken | `password_reset_tokens` | Password reset tokens |
| Group | `groups` | Expense groups (TRAVEL, HOSTEL, EVENT, FAMILY) |
| GroupMember | `group_members` | Group membership with roles |
| Expense | `expenses` | Individual expenses with split info |
| ExpenseShare | `expense_shares` | Per-user share of each expense |
| Settlement | `settlements` | Debt settlements between users |
| Payment | `payments` | Razorpay payment records |
| TransactionLedger | `transaction_ledger` | Immutable audit log |
| RecurringExpense | `recurring_expenses` | Recurring expense templates |
| PaymentReminder | `payment_reminders` | Payment reminder records |

## Configuration

All configuration is in `src/main/resources/application.properties`:

- **Database**: MySQL connection (host, port, credentials)
- **JWT**: Secret key, expiration time
- **OAuth2**: Google client ID/secret
- **Email**: Gmail SMTP credentials
- **Razorpay**: Test key ID/secret
- **AWS S3**: Bucket name, region, access keys

## Scheduled Tasks

| Schedule | Task |
|----------|------|
| Daily 2:00 AM | Process recurring expenses |
| Daily 9:00 AM | Send payment reminders |
| Daily midnight | Auto-lock expired groups, send monthly hostel summaries |

<div align="center">

# SettleKar

**Split expenses. Settle debts. Stay friends.**

A full-stack expense management and settlement platform with AI-powered receipt scanning, real-time balance tracking, and integrated payments.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AWS](https://img.shields.io/badge/AWS-S3_|_RDS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

[![Hackathon](https://img.shields.io/badge/Anirveda_Economania-Hackathon_2026-ff6b6b?style=for-the-badge)](#)

---

[Features](#-key-features) &bull; [Architecture](#-system-architecture) &bull; [Product Screens](#-product-screens) &bull; [Tech Stack](#-tech-stack) &bull; [Quick Start](#-quick-start) &bull; [API Reference](#-api-reference) &bull; [Database](#-database-schema) &bull; [Team](#-team)

</div>

---

## Key Features

### Expense Management
- Create groups (Travel, Hostel, Event, Custom) and invite members via join codes
- Add expenses with **equal, percentage, or custom** splits
- Real-time balance tracking with pairwise debt visualization
- **Min-cash-flow algorithm** — minimizes the number of transactions needed to settle all debts

### Payments & Settlement
- **Razorpay integration** for in-app payments (UPI, cards, net banking)
- Settlement creation, tracking, and confirmation workflow
- Automated escalating reminders: 3-day gentle &rarr; 7-day formal via email

### AI-Powered Receipt Scanner
- Upload a receipt image &rarr; auto-extracts description, amount, and category
- **PaddleOCR** running on a FastAPI microservice
- Receipts stored on **AWS S3** with presigned URLs for secure access

### Analytics & Reporting
- Category-wise spending breakdown (pie charts)
- Monthly spending trends (bar charts)
- Member contribution analysis
- Debt graph visualization with numbered nodes
- Export group ledger as **CSV**

### Authentication & Security
- Email/password signup with email verification
- **Google OAuth2** login
- Password reset flow with secure tokens
- JWT-based session management

### Smart Notifications
- HTML-styled email templates (verification, welcome, settlement confirmation)
- Escalating reminder system (gentle &rarr; formal &rarr; repeat)
- Monthly hostel group summaries

---

## Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Backend** | Java 21, Spring Boot 4.0, Spring Security, Spring Data JPA | REST API, business logic, auth |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Recharts | SPA with responsive UI and charts |
| **ML Service** | Python, FastAPI, PaddleOCR, PaddlePaddle | Receipt scanning microservice |
| **Database** | PostgreSQL 15+ (AWS RDS) | Persistent data storage |
| **Payments** | Razorpay Payment Gateway | UPI, cards, net banking |
| **Storage** | AWS S3 | Receipt image storage |
| **Auth** | JWT + Google OAuth2 | Authentication & authorization |
| **Email** | Spring Mail (Gmail SMTP) | Transactional emails & reminders |

</div>

---

## System Architecture

```mermaid
graph TB
    subgraph Client
        A[React SPA<br/>Vite + Tailwind]
    end

    subgraph Backend["Spring Boot API"]
        B[REST Controllers]
        C[Service Layer]
        D[Spring Security<br/>JWT + OAuth2]
    end

    subgraph ML["ML Microservice"]
        E[FastAPI]
        F[PaddleOCR Engine]
    end

    subgraph External["External Services"]
        G[(PostgreSQL<br/>AWS RDS)]
        H[AWS S3<br/>Receipt Storage]
        I[Razorpay<br/>Payment Gateway]
        J[Gmail SMTP<br/>Email Service]
    end

    A -->|REST API| B
    B --> D
    B --> C
    C --> G
    C -->|Receipt Scan| E
    E --> F
    C --> H
    C --> I
    C --> J
```

### Cloud Architecture (Scalability View)

<div align="center">
<img src="IMAGES/screenshot-01.png" alt="Cloud architecture ensuring scalability" width="900"/>
</div>

---

## User Flow

```mermaid
flowchart TD
    A([Sign Up / Login]) --> B{New User?}
    B -->|Yes| C[Email Verification]
    B -->|No| D[Dashboard]
    C --> D

    D --> E[Create or Join Group]
    E --> F[Add Expense]

    F --> G{Has Receipt?}
    G -->|Yes| H[Upload Receipt<br/>AI Auto-Extract]
    G -->|No| I[Manual Entry]
    H --> J[Choose Split Method]
    I --> J

    J --> K[View Balances & Debts]
    K --> L[Get Settlement Suggestions]
    L --> M[Pay via Razorpay]
    M --> N[Settlement Confirmed]
    N --> O[Email Notification Sent]

    K --> P[View Analytics]
    K --> Q[Export CSV]
```

---

## Project Structure

```
SettleKar/
├── Backend/                        # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/settlekar/backend/
│   │       ├── config/             # Security, CORS, Razorpay config
│   │       ├── controller/         # REST controllers
│   │       ├── dto/                # Request/Response DTOs
│   │       ├── entity/             # JPA entities
│   │       ├── enums/              # ExpenseCategory, SplitMethod, etc.
│   │       ├── repository/         # Spring Data repositories
│   │       └── service/            # Business logic
│   └── src/main/resources/
│       └── application.properties
│
├── Frontend/
│   └── settlekar-frontend/         # React + Vite SPA
│       ├── src/
│       │   ├── api/                # Axios API clients
│       │   ├── components/         # Reusable UI components
│       │   ├── contexts/           # Auth context
│       │   ├── hooks/              # Custom React hooks
│       │   ├── lib/                # Utilities, formatters
│       │   └── pages/              # Route-level page components
│       └── index.html
│
├── ML/
│   └── receipt-scanner/            # FastAPI OCR microservice
│       ├── app/
│       │   ├── main.py             # FastAPI app entry
│       │   ├── ocr_engine.py       # PaddleOCR wrapper
│       │   └── receipt_parser.py
│       └── requirements.txt
│
└── Documents/
    ├── start-settlekar.sh          # Start all 3 services
    └── cleanup_db.sh               # Reset database
```

---

## Quick Start

### Prerequisites

| Tool | Version | Install |
|:-----|:--------|:--------|
| Java | 21 | `brew install openjdk@21` |
| Node.js | 18+ | `brew install node` |
| Python | 3.10+ | `brew install python` |
| PostgreSQL | 15+ | `brew install postgresql@17` |
| Maven | — | Bundled via `mvnw` wrapper |

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/<your-username>/SettleKar.git
cd SettleKar
```

**2. Create the database**

```bash
brew services start postgresql@17
psql postgres -c "CREATE DATABASE settlekar_db;"
```

> Update credentials in `Backend/src/main/resources/application.properties` if needed.

**3. Start all services (one command)**

```bash
bash Documents/start-settlekar.sh
```

This launches:

| Service | URL |
|:--------|:----|
| ML Service | `http://localhost:8000` |
| Backend API | `http://localhost:8080` |
| Frontend | `http://localhost:5173` |

Press `Ctrl+C` to stop all services.

<details>
<summary><strong>Or start each service individually</strong></summary>

```bash
# ML Service
cd ML/receipt-scanner
source venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Backend
cd Backend
./mvnw spring-boot:run

# Frontend
cd Frontend/settlekar-frontend
npm install
npm run dev
```

</details>

---

## API Reference

<details>
<summary><strong>Auth</strong></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login with email/password |
| `GET` | `/api/auth/verify-email` | Verify email token |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |

</details>

<details>
<summary><strong>Groups</strong></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/groups` | Create a group |
| `GET` | `/api/groups` | List user's groups |
| `GET` | `/api/groups/{id}` | Get group details |
| `POST` | `/api/groups/{id}/join` | Join via invite code |
| `GET` | `/api/groups/{id}/members` | List group members |

</details>

<details>
<summary><strong>Expenses</strong></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/groups/{id}/expenses` | Add expense |
| `GET` | `/api/groups/{id}/expenses` | List expenses (paginated) |
| `PUT` | `/api/groups/{id}/expenses/{eid}` | Update expense |
| `DELETE` | `/api/groups/{id}/expenses/{eid}` | Delete expense |

</details>

<details>
<summary><strong>Balances & Settlements</strong></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/groups/{id}/balances/summary` | Balance summary |
| `GET` | `/api/groups/{id}/balances/pairwise` | Pairwise debts |
| `GET` | `/api/groups/{id}/balances/graph` | Debt graph data |
| `GET` | `/api/groups/{id}/settlements/suggestions` | Min-cash-flow suggestions |
| `POST` | `/api/groups/{id}/settlements` | Create settlement |

</details>

<details>
<summary><strong>Payments</strong></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature |

</details>

<details>
<summary><strong>Receipt Scanner</strong></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/receipts/scan` | Upload receipt &rarr; auto-extract fields |

</details>

<details>
<summary><strong>Analytics & Export</strong></summary>

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/groups/{id}/analytics/category` | Category breakdown |
| `GET` | `/api/groups/{id}/analytics/monthly` | Monthly trends |
| `GET` | `/api/groups/{id}/analytics/members` | Member contributions |
| `GET` | `/api/groups/{id}/export/csv` | Download CSV ledger |

</details>

---

## Database Schema

```mermaid
erDiagram
    USER ||--o{ GROUP_MEMBER : joins
    GROUP ||--o{ GROUP_MEMBER : has
    GROUP ||--o{ EXPENSE : contains
    USER ||--o{ EXPENSE : creates
    EXPENSE ||--o{ EXPENSE_SHARE : splits_into
    USER ||--o{ EXPENSE_SHARE : owes
    GROUP ||--o{ SETTLEMENT : tracks
    SETTLEMENT ||--o| PAYMENT : paid_via
    GROUP ||--o{ TRANSACTION_LEDGER : logs
    GROUP ||--o{ RECURRING_EXPENSE : schedules
    SETTLEMENT ||--o{ PAYMENT_REMINDER : triggers

    USER {
        bigint id PK
        string email UK
        string name
        string password_hash
        string oauth_provider
        boolean email_verified
    }

    GROUP {
        bigint id PK
        string name
        enum type
        string join_code UK
        bigint created_by FK
    }

    EXPENSE {
        bigint id PK
        bigint group_id FK
        bigint paid_by FK
        decimal amount
        enum category
        enum split_method
        string receipt_url
    }

    SETTLEMENT {
        bigint id PK
        bigint group_id FK
        bigint from_user FK
        bigint to_user FK
        decimal amount
        enum status
    }

    PAYMENT {
        bigint id PK
        bigint settlement_id FK
        string razorpay_order_id
        string razorpay_payment_id
        enum status
    }
```

<details>
<summary><strong>Entity Reference</strong></summary>

| Entity | Description |
|:-------|:------------|
| `User` | User accounts with email/OAuth and roles |
| `Group` | Expense groups (Travel, Hostel, Event, Custom) |
| `GroupMember` | Group membership with roles (OWNER, ADMIN, MEMBER) |
| `Expense` | Individual expenses with category, split method, receipt URL |
| `ExpenseShare` | Per-member share of each expense |
| `Settlement` | Debt settlement records between two members |
| `Payment` | Razorpay payment records linked to settlements |
| `TransactionLedger` | Immutable audit log of all group activity |
| `RecurringExpense` | Scheduled recurring expenses |
| `PaymentReminder` | Escalating reminder tracking (GENTLE &rarr; FORMAL) |
| `VerificationToken` | Email verification tokens |
| `PasswordResetToken` | Password reset tokens |

</details>

---

## Security

| Concern | Implementation |
|:--------|:---------------|
| Authentication | JWT tokens + Google OAuth2 |
| Password Storage | BCrypt hashing |
| API Protection | Spring Security filters on all endpoints |
| Payment Verification | Razorpay signature verification (HMAC SHA256) |
| File Access | AWS S3 presigned URLs (time-limited) |
| Email Tokens | Cryptographically random, single-use, time-expiring |
| CORS | Whitelisted origins only |

---

## Future Improvements

- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] Multi-currency support with automatic conversion
- [ ] Recurring expense automation
- [ ] Group chat / comments on expenses
- [ ] Advanced analytics dashboard with export to PDF
- [ ] Docker Compose for one-command deployment
- [ ] CI/CD pipeline with GitHub Actions

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "Add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

---

## Team

Built by **Mission ImCodeable** for the [Anirveda Economania Hackathon](https://github.com/).

<!-- Add team member details below -->
<!-- | Name | Role | GitHub |
|:-----|:-----|:-------|
| Your Name | Full Stack Developer | [@username](https://github.com/username) | -->

---

## Product Screens

Screens are arranged by importance and user journey progression.

### 1. Core User Flow

<div align="center">
<img src="IMAGES/user_flow.png" alt="SettleKar user flow" width="950"/>
</div>

### 2. Onboarding & Entry

| Sign Up with OAuth2 | Sign In with OAuth2 |
|:-------------------:|:-------------------:|
| <img src="IMAGES/screenshot-07.png" alt="Sign up page with OAuth2" width="420"/> | <img src="IMAGES/screenshot-08.png" alt="Sign in page with OAuth2" width="420"/> |

### 3. Home Experience (Part 1 to Part 5)

| Home Screen Pt 1 | Home Screen Pt 2 | Home Screen Pt 3 |
|:----------------:|:----------------:|:----------------:|
| <img src="IMAGES/screenshot-02.png" alt="Home screen part 1" width="300"/> | <img src="IMAGES/screenshot-03.png" alt="Home screen part 2" width="300"/> | <img src="IMAGES/screenshot-04.png" alt="Home screen part 3" width="300"/> |

| Home Screen Pt 4 | Home Screen Pt 5 |
|:----------------:|:----------------:|
| <img src="IMAGES/screenshot-05.png" alt="Home screen part 4" width="420"/> | <img src="IMAGES/screenshot-06.png" alt="Home screen part 5" width="420"/> |

### 4. Post-Login Core Pages

| Dashboard | Groups with Analytics | Analytics Page |
|:---------:|:---------------------:|:--------------:|
| <img src="IMAGES/screenshot-09.png" alt="Dashboard page after login" width="300"/> | <img src="IMAGES/screenshot-10.png" alt="Groups page with analytics" width="300"/> | <img src="IMAGES/screenshot-14.png" alt="Analytics page having complete info" width="300"/> |

### 5. Expense, Balances, and Settlements

| Add Expense Popup | Balance Graph and Pie Chart | Razorpay Integration |
|:-----------------:|:---------------------------:|:--------------------:|
| <img src="IMAGES/screenshot-11.png" alt="Add expense popup" width="300"/> | <img src="IMAGES/screenshot-12.png" alt="Balance graph and pie chart" width="300"/> | <img src="IMAGES/screenshot-13.png" alt="Razorpay integration" width="300"/> |

### 6. Profile & Data Model

| Profile Settings | Database Schema |
|:----------------:|:---------------:|
| <img src="IMAGES/screenshot-15.png" alt="Profile settings page" width="420"/> | <img src="IMAGES/database_schema.png" alt="Database schema" width="420"/> |

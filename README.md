# 🏥 Pharventory - Pharmacy Inventory System

[![NestJS](https://img.shields.io/badge/NestJS-000000?style=for-the-badge&logo=nestjs&logoColor=red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-000000?style=for-the-badge&logo=typescript&logoColor=blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-000000?style=for-the-badge&logo=postgresql&logoColor=blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-000000?style=for-the-badge&logo=docker&logoColor=blue)](https://www.docker.com/)

Pharventory is a pharmacy inventory management system designed to simplify and optimize medication management for pharmacies and hospitals.
The system addresses complex stock management challenges, minimizes human error, and improves operational efficiency by providing real-time tracking, expiration control, and business data analytics.

---

## ✨ Key Features

### 📊 Dashboard Overview
- **Sales Analytics** -
  - Sales Trend (date range selectable)
  - Top 10 Products (by Revenue / Units Sold)
- **Stock Status Overview**
    - Out of Stock
    - Critical Stock (< 25)
    - Low Stock (< 100)
    - Expired / Expiring Batches
  
### 💊Inventory Management
- **Advanced Search & Filtering**
  - Filter by stock status (Normal, Low Stock, Critical Stock, Out of Stock)
  - Separate views for expired and near-expiry medicines
- **Medicine List Management**
- **create/read/update operations for medicines and batches**
- **Medicine image upload (Google Cloud Storage)**
- **Category & Unit can be created if they do not exist**


### 📦Stock Log
- **Stock movement tracking (IN, OUT, ADJUST)**
- **Linked medicine and batch details**
- **Operator tracking**
- **Timestamped transaction records**
**This system reduces operational errors and supports future audit requirements.**

### 🧾 Receipt History
- **This system reduces operational errors and supports future audit requirements.**
- **View dispensed medicines, quantities, prices, patient names, and timestamps**
- **Synchronized withdispensing systems**
  
### 💳 Dispensing System
- **FEFO (First Expire First Out) – automatically selects batches with the nearest expiration date**
- **Automatic price and total calculation**
- **Transactional dispensing to ensure data consistency**
- **Instant receipt generation and printable output**

### 🔐 Security
- **JWT Authentication**
- **Secure password hashing with bcrypt** 




## 🏗️ System Architecture

### Backend (NestJS)
```
src/
├── modules/
│   ├── auth/              # Authentication system
│   ├── medicines/         # Medicine management
│   ├── medicine-batches/  # Batch / lot management
│   ├── dispense/          # Dispensing system
│   ├── receipts/          # Receipt management
│   ├── stock-logs/        # Stock movement logs
│   ├── category/          # Medicine categories
│   ├── units/             # Measurement units
│   ├── import-excel/      # Excel import (in progress)
│   ├── upload/            # Image upload
│   ├── roles/             # Role & permission management
│   └── users/             # User management
├── config/                # Application configuration
└── main.ts                # Application entry point
```

### Frontend (Next.js)
```
app/
├── dashboard/             # Main dashboard page
├── inventory/             # Inventory management page
├── dispense/              # Dispensing page
├── receipt/               # Receipt history page
├── stocklogs/             # Stock movement logs page
├── login/                 # Authentication page
├── components/            # Shared components
├── hooks/                 # Custom React hooks
├── store/                 # State management
└── types/                 # TypeScript type definitions
```

---

## 🛠️ Tech Stack

### Backend
- **NestJS** - API Framework  
- **TypeScript** - Type-safe development
- **PostgreSQL/Supabase** - Primary database
- **TypeORM** - ORM for database operations
- **JWT**/bcrypt - Authentication token
- **Google Cloud Storage** - File storage
- **Google cloud run** Deployment
- **Docker** - Containerization

### Frontend
- **Next.js 16** - React framework with SSR
- **TypeScript** - Type safety
- **React Query** - Data fetching และ caching
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Component library
- **Chartjs** - Chartjs
- **Lucide React** - Icon library

## 🔧 Highlights

### 🎯 Smart Inventory Management
- Automated stock control
- FEFO-based dispensing
- Dedicated views for expired and low-stock medicines

### 📈 Business
- Stock turnover and sales analytics
- Fully transactional data handling

---

## 🎯 Business Impact

### ✅ Improved Efficiency
- Reduced inventory management time
- Fewer data entry and dispensing errors
- Faster dispensing workflow

### 💰 Cost Reduction
- Minimized losses from expired medicines
- Improved staff productivity






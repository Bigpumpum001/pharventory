# 🏥 Pharventory - Pharmacy Management System

## 📋 ฟังก์ชันหลักที่พัฒนา (CV Version)

### 🔐 Authentication System
- JWT-based login/logout พร้อม role-based access control
- Password hashing ด้วย bcrypt
- User authentication และ authorization

### 💊 Medicine Management
- CRUD operations สำหรับจัดการข้อมูลยา
- จัดการรูปภาพยา (image upload ไป Google Cloud Storage)
- จัดการหมวดหมู่ยา และหน่วยนับ
- ค้นหาและกรองข้อมูลยา

### 📦 Batch & Stock Management
- จัดการ lot number และวันหมดอายุ
- ระบบติดตามสต็อกแบบ real-time
- FEFO (First Expire First Out) algorithm
- Stock logging ทุกการเคลื่อนไหว

### 💳 Dispensing System
- ระบบจ่ายยาแบบ transaction
- สร้างใบเสร็จ/ใบจ่ายยาอัตโนมัติ
- ลดสต็อกตาม batch ที่ใกล้หมดอายุก่อน
- คำนวณราคาและสรุปยอด

### 📊 Dashboard & Analytics
- Real-time KPIs (revenue, stock, alerts)
- Sales trend chart แบบ interactive
- Top selling medicines analysis
- Stock alerts (critical, low, expired)

### 📈 Reporting System
- Stock movement logs
- Receipt history
- Sales reports ตามช่วงเวลา
- Export to Excel functionality

### 📤 Excel Import/Export
- Import medicines จาก Excel file
- Import batches พร้อม validation
- Template-based import
- Error handling และ data validation

### 🏷️ Category & Unit Management
- จัดการหมวดหมู่ยา
- จัดการหน่วยนับ (units)
- Hierarchy management

### 👥 User & Role Management
- Multi-role system
- User permissions
- Activity logging

### 🔔 Alert System
- Critical stock alerts
- Expiry date notifications
- Low stock warnings
- Real-time notifications

### 📱 Frontend Features
- Responsive design (Next.js + TypeScript)
- Real-time updates ด้วย React Query
- Modern UI ด้วย Tailwind CSS + shadcn/ui
- Mobile-friendly interface

### 🗄️ Database & Infrastructure
- PostgreSQL database พร้อม TypeORM
- Redis caching
- Google Cloud Storage integration
- Docker containerization

---
**Tech Stack:** NestJS, Next.js, TypeScript, PostgreSQL, Redis, Google Cloud Storage

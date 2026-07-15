# Grainex 🌾

Grainex is a modern, production-ready, multi-tenant Software as a Service (SaaS) platform built to automate inventory operations, point-of-sale (POS) billing, and revenue analytics for grocery stores and supermarkets.

---

## 🚀 Features

- **Multi-Tenant Architecture**: Complete data isolation. Store owners register and manage their own dashboards independently.
- **Fast Point of Sale (POS)**: Lightweight, mobile-responsive billing counter with instant product search and transactions recording.
- **Smart Inventory Warnings**: Predictive low-stock alerts dynamically highlighted in the catalog lists.
- **Super Admin Controller**: A centralized panel to monitor total platform statistics and suspend/reactivate store accounts.
- **Transactional Notifications**: Automated email alerts for new store signups and contact submissions powered by Gmail SMTP / Resend API.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Vanilla CSS
- **Backend**: Python (Flask), SQLite, signed session tokens (itsdangerous)
- **Deployment Ready**: Fully decoupled architecture with environment variable configuration

---

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+

### 1. Clone & Initialize Git
```bash
git clone <your-repository-url>
cd Grainex
```

### 2. Backend Setup
1. Navigate to the backend directory and set up a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Create a `.env` file inside the `backend/` folder:
   ```env
   SECRET_KEY=your-custom-jwt-secret-key
   ADMIN_EMAIL=admin@grainex.com
   ADMIN_PASSWORD=adminpassword
   
   # Optional: Email Setup (Gmail SMTP)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-gmail-16-digit-app-password
   ```
3. Run the backend server:
   ```bash
   python app.py
   ```
   The backend will run on `http://127.0.0.1:5000`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://127.0.0.1:5173` in your browser.

---

## 🔒 Security & Data Leaks Prevention

This project has been pre-configured with a strict `.gitignore` setup to prevent any accidental credentials leaks.
The following files are **automatically ignored** and will never be committed to GitHub:
- `backend/.env` (contains API keys and SMTP app passwords)
- `database/grocery.db` (contains local binary SQLite database data)
- `venv/` & `node_modules/` (virtual environments and large packages)

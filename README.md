# VeriClass™ - Institutional Attendance & Academic Verification Portal

VeriClass is an institutional-grade attendance and academic operations portal engineered for colleges and universities. It features real-time classroom in-person photo verification, GPS radius geofencing, student scholar management, teacher portals, and administrative oversight.

---

## 🚀 Quick Start (Run on Localhost)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** (comes with Node.js) or **pnpm** / **yarn** / **bun**

### 1. Installation
Open your terminal inside the unzipped project folder:

```bash
# Install dependencies
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Your app will be live at:
```
http://localhost:3000
```
*(or `http://localhost:5173` if port 3000 is occupied).*

### 3. Production Build & Local Preview
```bash
# Build production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 🌐 Multi-Device Cloud Sync & Hosting Guide

### Why data wasn't syncing across devices previously:
A pure client-side static build only saves information to the local phone's or computer's browser cache (`localStorage`). If a teacher started attendance on her phone, the student's phone could not see it because there was no centralized server database connecting them.

### How VeriClass now works (Full-Stack Express + Vite):
VeriClass now includes a dedicated backend server (`server.ts` compiled to `dist/server.cjs`):
- **Centralized Database**: Stores institutional records, students, faculty, classrooms, assignments, and attendance sessions in `data/institution_db.json`.
- **Live Multi-Device Synchronization**: Every 2.5 seconds, all connected devices (phones, tablets, laptops) synchronize with the server API (`/api/sync`).
- **Instant Attendance Broadcasting**: When a faculty member initiates attendance on their smartphone, students enrolled in that section instantly see the active attendance prompt and geofencing challenge on their respective devices within 2 seconds.
- **Biometric Presence Capture**: When a student verifies presence with a photo and GPS, the teacher's live monitor updates in real time with the student's photo and verification status.

---

## 📱 Testing Across Phones on Localhost / Wi-Fi (No Hosting Needed)

You can test real-time multi-device sync right now on your home or college Wi-Fi:

1. Start the server on your computer:
   ```bash
   npm run dev
   ```
2. Find your computer's local IP address:
   - **Windows**: Open Command Prompt and run `ipconfig` (look for *IPv4 Address*, e.g., `192.168.1.45`).
   - **Mac / Linux**: Open Terminal and run `ifconfig` or `ip a` (look for `inet 192.168.x.x`).
3. Open the browser on the teacher's phone:
   ```
   http://192.168.1.45:3000
   ```
   Log in as Teacher (e.g., `TCH-101`) and start a live attendance session.
4. Open the browser on the student's phone:
   ```
   http://192.168.1.45:3000
   ```
   Log in as Student (e.g., `SCH-2024-001`). Within 2 seconds, the student's phone will show the live attendance alert and allow them to verify their presence!

---

## ☁️ Deploying to Render (Free Web Service with Data Persistence)

Deploy VeriClass as a **Web Service** (not a Static Site) so the Node.js Express server runs and keeps data synchronized:

1. Push this project to your GitHub repository.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. Connect your repository.
4. Fill in the following settings:
   - **Name**: `vericlass` (or your chosen institution name)
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
5. In **Advanced** -> **Add Environment Variable**:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
6. *(Optional for permanent long-term storage)*:
   Under **Disks**, add a Persistent Disk with Mount Path `/app/data` so data is preserved even across Render container redeployments.
7. Click **Deploy Web Service**.
8. Render will give you a public URL (e.g., `https://vericlass.onrender.com`).
   - Open this URL on any teacher's phone, student's phone, or computer anywhere in the world! All devices will now stay 100% in sync!

---

## ⚡ Deploying to Railway / Fly.io / VPS

### Railway
1. Click **New Project** -> **Deploy from GitHub repo**.
2. Railway auto-detects `package.json` scripts:
   - Build: `npm run build`
   - Start: `npm start`
3. Set Port variable to `3000`.

### VPS (Ubuntu / Debian with PM2)
```bash
git clone <your-repo-url>
cd vericlass
npm install
npm run build
npm install -g pm2
pm2 start dist/server.cjs --name "vericlass"
```

---

## ⚡ Deploying to Vercel or Netlify

### Vercel
1. Install Vercel CLI (`npm i -g vercel`) or connect via [vercel.com](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**.

### Netlify
1. Connect via [netlify.com](https://netlify.com).
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. In `public/_redirects` (or netlify settings):
   ```
   /*    /index.html   200
   ```

---

## 🐳 Running with Docker

You can build and run VeriClass with Docker:

```dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t vericlass .
docker run -p 3000:80 vericlass
```

---

## 🔐 Default Access Credentials

### 1. Student Portal
- **Scholar No**: `SCH-2024-001` (Aarav Sharma - CSE Sec A)
- **Scholar No**: `SCH-2024-002` (Diya Patel - CSE Sec A)
- **Scholar No**: `SCH-2024-004` (Priya Nair - AI & DS Sec A)
*(Or click any sample student on the login view)*

### 2. Faculty / Teacher Portal
- **Teacher No**: `FAC-CS-101` (Dr. Vikramaditya Sen - Professor & Head)
- **Teacher No**: `FAC-AI-103` (Dr. Rajeshwari Raman - AI Lead)
*(Or click any sample faculty member on the login view)*

### 3. Administrator Console
- **Master Authorization Code**: `VeriClass#Admin93017`
- Or use email: `admin@vericlass.edu` / password: `admin`
- Direct access button: Click the **Key icon** in the top-right of the login screen.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Client Compression**: JSZip
- **Geodesy**: Haversine Formula (GPS Proximity Calculation)

---

## 📄 License
Apache-2.0 License. Designed for higher education institutions.

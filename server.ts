import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_ACADEMIC_MATERIALS,
  INITIAL_ADMINS,
  INITIAL_BRANCHES,
  INITIAL_CLASSROOMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORT_CARDS,
  INITIAL_SECTIONS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
} from './src/data/mockData';

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'institution_db.json');

interface DatabaseSchema {
  version: number;
  branches: any[];
  sections: any[];
  classrooms: any[];
  teachers: any[];
  students: any[];
  admins: any[];
  academicMaterials: any[];
  materialSubmissions: any[];
  reportCards: any[];
  notifications: any[];
  attendanceSessions: any[];
  lastUpdated: string;
}

function getInitialDatabase(): DatabaseSchema {
  const initialSession = {
    id: 'sess-live-01',
    teacherId: 'teacher-101',
    teacherName: 'Prof. Rajesh Verma',
    teacherNo: 'TCH-101',
    branchId: 'branch-cse',
    sectionId: 'sec-cse-a',
    classroomId: 'room-302',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Algorithms & Geofenced Verification',
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    status: 'active',
    records: [
      {
        id: 'rec-init-01',
        sessionId: 'sess-live-01',
        studentId: 'stud-202',
        studentName: 'Priya Sharma',
        scholarNo: 'SCH-2024-002',
        rollNo: '24CS002',
        timestamp: '10:04 AM',
        livePhotoUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        distanceMeters: 12.4,
        isInsideGeofence: true,
        verificationScore: 98,
        status: 'verified',
      },
    ],
  };

  return {
    version: Date.now(),
    branches: INITIAL_BRANCHES,
    sections: INITIAL_SECTIONS,
    classrooms: INITIAL_CLASSROOMS,
    teachers: INITIAL_TEACHERS,
    students: INITIAL_STUDENTS,
    admins: INITIAL_ADMINS,
    academicMaterials: INITIAL_ACADEMIC_MATERIALS,
    materialSubmissions: [],
    reportCards: INITIAL_REPORT_CARDS,
    notifications: INITIAL_NOTIFICATIONS,
    attendanceSessions: [initialSession],
    lastUpdated: new Date().toISOString(),
  };
}

let inMemoryDb: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.version === 'number') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading database file, using default seed:', err);
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing database file:', err);
  }
}

inMemoryDb = loadDatabase();

async function startServer() {
  const app = express();

  // Allow high-res camera selfies and image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers for multi-device network access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      version: inMemoryDb.version,
    });
  });

  // Full state endpoint
  app.get('/api/state', (req, res) => {
    res.json({
      version: inMemoryDb.version,
      data: inMemoryDb,
    });
  });

  // Fast polling endpoint for multi-device sync
  app.get('/api/sync', (req, res) => {
    const clientVersion = Number(req.query.v);
    if (!isNaN(clientVersion) && clientVersion === inMemoryDb.version) {
      return res.json({ changed: false, version: inMemoryDb.version });
    }
    return res.json({
      changed: true,
      version: inMemoryDb.version,
      data: inMemoryDb,
    });
  });

  // Push updates endpoint from any device
  app.post('/api/sync', (req, res) => {
    try {
      const incoming = req.body;
      if (!incoming || typeof incoming !== 'object') {
        return res.status(400).json({ error: 'Invalid state payload' });
      }

      const newVersion = Date.now();
      inMemoryDb = {
        ...inMemoryDb,
        ...incoming,
        version: newVersion,
        lastUpdated: new Date().toISOString(),
      };

      saveDatabase(inMemoryDb);

      return res.json({
        success: true,
        version: newVersion,
        lastUpdated: inMemoryDb.lastUpdated,
      });
    } catch (err: any) {
      console.error('Error saving sync state:', err);
      return res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // Reset to initial seed
  app.post('/api/reset', (req, res) => {
    const initial = getInitialDatabase();
    inMemoryDb = initial;
    saveDatabase(initial);
    return res.json({ success: true, version: initial.version, data: initial });
  });

  // Vite middleware in dev mode, static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VeriClass Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});

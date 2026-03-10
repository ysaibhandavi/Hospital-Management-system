import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
  );
`);

// Seed some doctors if none exist
const doctorCount = db.prepare("SELECT COUNT(*) as count FROM doctors").get() as { count: number };
if (doctorCount.count === 0) {
  const insertDoctor = db.prepare("INSERT INTO doctors (name, specialization, password) VALUES (?, ?, ?)");
  insertDoctor.run("Dr. Smith", "Cardiology", "password123");
  insertDoctor.run("Dr. Johnson", "Neurology", "password123");
  insertDoctor.run("Dr. Williams", "Pediatrics", "password123");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;
    try {
      const insert = db.prepare("INSERT INTO patients (name, email, password) VALUES (?, ?, ?)");
      insert.run(name, email, password);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM patients WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json({ success: true, user: { name: user.name, role: 'patient' } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/doctors", (req, res) => {
    const doctors = db.prepare("SELECT name, specialization FROM doctors").all();
    res.json(doctors);
  });

  app.post("/api/book", (req, res) => {
    const { patientName, doctorName, date, time } = req.body;
    const insert = db.prepare("INSERT INTO appointments (patient_name, doctor_name, date, time) VALUES (?, ?, ?, ?)");
    insert.run(patientName, doctorName, date, time);
    res.json({ success: true });
  });

  app.get("/api/appointments", (req, res) => {
    const appointments = db.prepare("SELECT * FROM appointments").all();
    res.json(appointments);
  });

  app.get("/api/admin/data", (req, res) => {
    const patients = db.prepare("SELECT name, email FROM patients").all();
    const doctors = db.prepare("SELECT name, specialization FROM doctors").all();
    const appointments = db.prepare("SELECT * FROM appointments").all();
    res.json({ patients, doctors, appointments });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import { connectDatabase } from "./db/connect.js";
import contactRouter from "./routers/contactrouter.js";
import AdminRouter from "./routers/Adminrouter.js";
import projectRouter from "./routers/projectrouter.js";
import Project from "./model/projectschema.js"; // add this import

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 25000;

// Add session middleware
app.use(session({
  secret: "your_secret_key", // use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

// EJS setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

 
// Home page (renders home.ejs)
app.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    const projectsWithUrl = projects.map(p => ({
      ...p.toObject(),
      imageUrl: p.image ? "/" + p.image.replace(/\\/g, "/") : null
    }));
    res.render("home", { success: null, error: null, projects: projectsWithUrl });
  } catch (err) {
    res.render("home", { success: null, error: "Failed to load projects", projects: [] });
  }
});
 

// Use the contact router for form submissions
app.use("/", contactRouter);
app.use("/", AdminRouter);
app.use("/", projectRouter);

// Default 404 route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use(express.static("public"))

// Connect to the database
connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database. Server not started.", error);
  });
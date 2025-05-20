import express from "express";
import bcrypt from "bcrypt";
import Admin from "../model/Adminschema.js";
import Project from "../model/projectschema.js";
// import imageSchema from "../model/imageschema.js"; // If needed

const router = express.Router();

const adminEmail = "sanjeet@gmail.com";
const adminPassword = "manish";

// Middleware to check admin session
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect("/");
  }
}

// Home page: logout admin if present
router.get("/", (req, res) => {
  if (req.session) req.session.destroy(() => {});
  res.render("home", { error: null, success: null });
});

// Render the admin panel (require login)
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    const projectsWithUrl = projects.map(p => ({
      ...p.toObject(),
      imageUrl: p.image ? "/" + p.image.replace(/\\/g, "/") : null
    }));
    res.render("admin", { name: "Admin", projects: projectsWithUrl });
  } catch (error) {
    res.render("admin", { name: "Admin", projects: [], error: "Failed to load projects" });
  }
});

// Handle login form submission
router.post("/login", async (req, res) => {
  const { email, Password } = req.body;
  try {
    if (email === adminEmail && Password === adminPassword) {
      if (req.session) req.session.isAdmin = true;
      const projects = await Project.find().sort({ createdAt: -1 });
      const projectsWithUrl = projects.map(p => ({
        ...p.toObject(),
        imageUrl: p.image ? "/" + p.image.replace(/\\/g, "/") : null
      }));
      return res.render("admin", { name: "Admin", projects: projectsWithUrl });
    } else {
      if (req.session) req.session.isAdmin = false;
      return res.render("home", { error: "Invalid credentials", success: null });
    }
  } catch (error) {
    if (req.session) req.session.isAdmin = false;
    console.error("Login error:", error);
    return res.render("home", { error: "Server error", success: null });
  }
});

export default router;
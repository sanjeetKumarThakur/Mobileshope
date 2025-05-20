import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Project from "../model/projectschema.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir + "/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET /projects - list all projects
 
// ...existing code...

 // ...existing code...

// GET /admin - render admin panel with projects
// ...existing code...

// GET /projects - list all projects as JSON (API, not for adding)
router.get("/projects", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        const projectsWithUrl = projects.map(p => ({
            ...p.toObject(),
            imageUrl: p.image ? `/${p.image.replace(/\\/g, "/")}` : null
        }));
        res.json(projectsWithUrl);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Get single project by ID
router.get("/projects/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found" });
        const projectObj = project.toObject();
        projectObj.imageUrl = project.image ? `/${project.image.replace(/\\/g, "/")}` : null;
        res.json(projectObj);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch project" });
    }
});

// Update project by ID
router.put("/projects/:id", upload.single("image"), async (req, res) => {
    try {
        const { projectNumber, description, date } = req.body;
        const update = {
            projectNumber,
            description,
            date: date ? new Date(date) : undefined
        };
        if (req.file) {
            update.image = req.file.path;
        }
        const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!project) return res.status(404).json({ error: "Project not found" });
        const projectObj = project.toObject();
        projectObj.imageUrl = project.image ? `/${project.image.replace(/\\/g, "/")}` : null;
        res.json({ success: true, project: projectObj });
    } catch (err) {
        res.status(500).json({ error: "Failed to update project" });
    }
});

// Delete project by ID
router.delete("/projects/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete project" });
    }
});

// POST /projects - add new project
 // ...existing code...
router.post("/projects", upload.single("image"), async (req, res) => {
    try {
        const { projectNumber, description, date } = req.body;
        const image = req.file ? req.file.path : null;
        // Convert date string to Date object
        const parsedDate = date ? new Date(date) : null;
        if (!projectNumber || !description || !parsedDate || !image) {
            return res.status(400).json({ error: "All fields are required." });
        }
        const project = new Project({
            projectNumber,
            description,
            date: parsedDate,
            image
        });
        await project.save();
        // Prepare project object with imageUrl for frontend
        const projectObj = project.toObject();
        projectObj.imageUrl = project.image ? `/${project.image.replace(/\\/g, "/")}` : null;
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            res.json({ success: true, project: projectObj });
        } else {
            res.redirect("/admin");
        }
    } catch (err) {
        console.error("POST /projects error:", err);
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            res.status(500).json({ error: err.message || "Failed to add project" });
        } else {
            res.status(500).send("Failed to add project");
        }
    }
});

// Mark project as completed
router.put("/projects/:id/completed", async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { completed: true },
            { new: true }
        );
        if (!project) return res.status(404).json({ error: "Project not found" });
        const projectObj = project.toObject();
        projectObj.imageUrl = project.image ? `/${project.image.replace(/\\/g, "/")}` : null;
        res.json({ success: true, project: projectObj });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark as completed" });
    }
});

export default router;

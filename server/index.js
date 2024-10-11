const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: "https://3-w-fawn.vercel.app",
  })
);

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://gademanicharan12:3W@cluster0.iw5ke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Define Submission schema
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socialMediaHandle: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model("Submission", submissionSchema);

// API routes
app.post("/api/submissions", upload.array("images"), async (req, res) => {
  try {
    const { name, socialMediaHandle } = req.body;
    const images = req.files.map((file) => file.filename);

    const submission = new Submission({ name, socialMediaHandle, images });
    await submission.save();

    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Serve placeholder image
app.use(
  "/placeholder-image.jpg",
  express.static(path.join(__dirname, "public", "placeholder-image.jpg"))
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

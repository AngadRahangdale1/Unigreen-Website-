const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    /https:\/\/unigreen-.*\.vercel\.app/,
    'https://www.unigreenin.in',
    'https://unigreenin.in',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_SECRET_KEY || '').trim(),
});

// Configure Multer memory storage (buffers files in memory before uploading to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // limit file size to 10MB
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running successfully!' });
});

// Image upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Stream upload to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'Unigreen-cloud-images', // Using the specified key/folder name
      resource_type: 'auto',
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Cloudinary upload failed', details: error.message });
      }
      res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      });
    }
  );

  uploadStream.end(req.file.buffer);
});

// Image list route
app.get('/api/images', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:Unigreen-cloud-images')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    const images = (result.resources || []).map(file => ({
      url: file.secure_url,
      public_id: file.public_id,
      created_at: file.created_at,
      width: file.width,
      height: file.height,
    }));
    res.json({ success: true, images });
  } catch (error) {
    console.error('Failed to fetch images from Cloudinary:', error);
    // Return empty list instead of crashing/failing if search index is not initialized yet
    res.json({ success: false, images: [], error: error.message });
  }
});

// POST Route for Contact Form with Nodemailer
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  if (!emailUser || !emailPass) {
    console.error('Nodemailer error: EMAIL_USER or EMAIL_PASS is not configured in the environment.');
    return res.status(500).json({
      success: false,
      error: 'Mail server configuration is missing. Please check your backend .env file.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      family: 4
    });

    const mailOptions = {
      from: emailUser,
      to: emailUser,
      replyTo: email,
      subject: `New Enquiry from ${name} — Unigreen Website`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #00FF66; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 0;">New Contact Form Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 8px 0; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">Sent automatically from the Unigreen website contact form.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Nodemailer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


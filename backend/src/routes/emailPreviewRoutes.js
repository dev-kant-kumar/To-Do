const express = require("express");
const { getTemplateContent } = require("../utils/mailer");
const EmailPreviewRoutes = express.Router();

EmailPreviewRoutes.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-src 'self';"
  );
  next();
});

const getCookie = (req, name) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    const [key, val] = cookie.split("=");
    if (key === name) return decodeURIComponent(val);
  }
  return null;
};

const checkPreviewCode = (req, res, next) => {
  const secretCode = process.env.EMAIL_PREVIEW_CODE;
  if (!secretCode) {
    return res.status(500).send("Server configuration error - EMAIL_PREVIEW_CODE not set.");
  }

  const code = req.query.code || getCookie(req, "email_preview_code");

  if (code !== secretCode) {
    if (req.path !== "/") {
      return res.status(403).send("Forbidden - Invalid preview code.");
    }
    
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>todo. Mailer - Secure Access</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #05050a;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
          }
          .login-card {
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            box-sizing: border-box;
            text-align: center;
            animation: fadeIn 0.4s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .logo {
            display: inline-flex;
            align-items: center;
            margin-bottom: 28px;
          }
          .check-box {
            background-color: #9333ea;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }
          .logo-text {
            font-size: 24px;
            font-weight: 800;
            margin-left: 12px;
            letter-spacing: -0.5px;
          }
          h1 {
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 8px;
            font-weight: 700;
          }
          p {
            color: #a1a1aa;
            font-size: 14px;
            margin-bottom: 28px;
            line-height: 1.5;
          }
          .input-group {
            margin-bottom: 24px;
            text-align: left;
          }
          label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #a1a1aa;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          input {
            width: 100%;
            background-color: #18181b;
            border: 1px solid #27272a;
            color: white;
            padding: 14px 16px;
            border-radius: 12px;
            font-size: 14px;
            box-sizing: border-box;
            transition: all 0.2s;
          }
          input:focus {
            outline: none;
            border-color: #d946ef;
            box-shadow: 0 0 0 2px rgba(217, 70, 239, 0.2);
          }
          button {
            width: 100%;
            background: linear-gradient(135deg, #a855f7, #d946ef);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          button:hover {
            opacity: 0.95;
            transform: translateY(-1px);
          }
          button:active {
            transform: translateY(0);
          }
          .error-message {
            color: #ef4444;
            font-size: 13px;
            margin-top: 16px;
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 12px;
            border-radius: 8px;
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="login-card">
          <div class="logo">
            <div class="check-box">✓</div>
            <div class="logo-text">todo<span style="color:#d946ef;">.</span> Mailer</div>
          </div>
          <h1>Secure Preview Portal</h1>
          <p>Please enter your developer passcode to view and test backend email templates.</p>
          
          <div class="input-group">
            <label for="passcode">Developer Passcode</label>
            <input type="password" id="passcode" placeholder="••••••••••••" autocomplete="current-password">
          </div>
          
          <button id="submit-btn" onclick="verifyCode()">Access Dashboard</button>
          
          <div class="error-message" id="error-box">
            Incorrect passcode. Access Denied.
          </div>
        </div>

        <script>
          async function verifyCode() {
            const codeInput = document.getElementById('passcode');
            const submitBtn = document.getElementById('submit-btn');
            const errorBox = document.getElementById('error-box');
            const code = codeInput.value;
            if (!code) return;
            
            submitBtn.disabled = true;
            submitBtn.innerText = "Verifying...";
            errorBox.style.display = 'none';

            try {
              const response = await fetch('/email/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
              });

              if (response.ok) {
                window.location.reload();
              } else {
                errorBox.style.display = 'block';
                codeInput.value = '';
                codeInput.focus();
              }
            } catch (err) {
              console.error(err);
              alert("Verification request failed. Please check backend connection.");
            } finally {
              submitBtn.disabled = false;
              submitBtn.innerText = "Access Dashboard";
            }
          }
          
          document.getElementById('passcode').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              verifyCode();
            }
          });
        </script>
      </body>
      </html>
    `);
  }

  if (req.query.code && getCookie(req, "email_preview_code") !== secretCode) {
    res.cookie("email_preview_code", secretCode, { maxAge: 86400000, path: "/", sameSite: "lax", httpOnly: true });
  }

  next();
};

// Main Single Route Previewer Dashboard
EmailPreviewRoutes.get("/", checkPreviewCode, (req, res) => {
  const code = req.query.code || getCookie(req, "email_preview_code");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>todo. Email Preview Center</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #05050a;
          color: #f4f4f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        .sidebar {
          width: 300px;
          background-color: #09090b;
          border-right: 1px solid #27272a;
          display: flex;
          flex-direction: column;
          padding: 28px;
          box-sizing: border-box;
        }
        .logo {
          display: flex;
          align-items: center;
          margin-bottom: 36px;
        }
        .check-box {
          background-color: #9333ea;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .logo-text {
          font-size: 20px;
          font-weight: 800;
          margin-left: 10px;
          letter-spacing: -0.5px;
        }
        .nav-tabs {
          list-style-type: none;
          padding: 0;
          margin: 0;
          flex-grow: 1;
        }
        .nav-item {
          margin-bottom: 12px;
        }
        .nav-btn {
          width: 100%;
          background: none;
          border: 1px solid transparent;
          padding: 14px 18px;
          text-align: left;
          color: #a1a1aa;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background-color: #18181b;
          color: white;
        }
        .nav-btn.active {
          background-color: #27272a;
          border-color: #3f3f46;
          color: #c084fc;
        }
        .main-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          background-color: #05050a;
        }
        .header {
          height: 72px;
          border-bottom: 1px solid #27272a;
          display: flex;
          align-items: center;
          padding: 0 40px;
          background-color: #09090b;
        }
        .header h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .preview-container {
          flex-grow: 1;
          padding: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: auto;
        }
        .preview-frame {
          width: 100%;
          max-width: 540px;
          height: 100%;
          border: 1px solid #27272a;
          border-radius: 20px;
          background-color: #05050a;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="sidebar">
        <div class="logo">
          <div class="check-box">✓</div>
          <div class="logo-text">todo<span style="color:#d946ef;">.</span> Mailer</div>
        </div>
        <ul class="nav-tabs">
          <li class="nav-item">
            <button class="nav-btn active" onclick="loadPreview('verification', this)">1. Verification OTP</button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" onclick="loadPreview('welcome', this)">2. Welcome Letter</button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" onclick="loadPreview('reset-password', this)">3. Reset Password OTP</button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" onclick="loadPreview('confirmation', this)">4. Security Confirmation</button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" onclick="loadPreview('delete-account-otp', this)">5. Delete Account OTP</button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" onclick="loadPreview('goodbye', this)">6. Goodbye Farewell</button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" onclick="loadPreview('streak-warning', this)">7. Streak Warning</button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" onclick="loadPreview('streak-lost', this)">8. Streak Lost</button>
          </li>
        </ul>
        <div style="margin-top: auto;">
          <button class="nav-btn" onclick="lockDashboard()" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2); justify-content: center;">
            🔒 Lock Previewer
          </button>
        </div>
      </div>
      <div class="main-content">
        <div class="header">
          <h2 id="preview-title">Verification OTP</h2>
        </div>
        <div class="preview-container">
          <iframe id="preview-iframe" class="preview-frame" src="/email/verification?code=${code}"></iframe>
        </div>
      </div>

      <script>
        function loadPreview(template, button) {
          // Update iframe source
          document.getElementById('preview-iframe').src = '/email/' + template + '?code=${code}';
          
          // Update header title
          const titleMap = {
            'verification': 'Verification OTP',
            'welcome': 'Welcome Letter',
            'reset-password': 'Reset Password OTP',
            'confirmation': 'Security Confirmation',
            'delete-account-otp': 'Delete Account OTP',
            'goodbye': 'Goodbye Farewell',
            'streak-warning': 'Streak Warning (At Risk)',
            'streak-lost': 'Streak Lost Notification'
          };
          document.getElementById('preview-title').innerText = titleMap[template];
          
          // Update active nav button
          const buttons = document.querySelectorAll('.nav-btn');
          buttons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
        }

        async function lockDashboard() {
          try {
            await fetch('/email/logout', { method: 'POST' });
          } catch (err) {
            console.error("Logout request failed:", err);
          }
          // Clear client-side fallback and redirect
          document.cookie = "email_preview_code=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
          window.location.href = "/email";
        }
      </script>
    </body>
    </html>
  `);
});

// Authentication login endpoint (sets secure httpOnly cookie)
EmailPreviewRoutes.post("/login", (req, res) => {
  const { code } = req.body;
  const secretCode = process.env.EMAIL_PREVIEW_CODE;

  if (!secretCode) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (code === secretCode) {
    res.cookie("email_preview_code", secretCode, { 
      maxAge: 86400000, // 1 day
      httpOnly: true, 
      path: "/", 
      sameSite: "lax" 
    });
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: "Invalid passcode" });
});

// Logout endpoint (clears cookie)
EmailPreviewRoutes.post("/logout", (req, res) => {
  res.clearCookie("email_preview_code", { path: "/" });
  return res.status(200).json({ success: true });
});

EmailPreviewRoutes.get("/verification", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("verification", { otp: "354921" });
  res.send(html);
});

EmailPreviewRoutes.get("/welcome", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("welcome", { name: "Dev Kant Kumar" });
  res.send(html);
});

EmailPreviewRoutes.get("/reset-password", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("reset-password", { otp: "782046" });
  res.send(html);
});

EmailPreviewRoutes.get("/confirmation", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("confirmation", { name: "Dev Kant Kumar" });
  res.send(html);
});

EmailPreviewRoutes.get("/delete-account-otp", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("delete-account-otp", { otp: "409281" });
  res.send(html);
});

EmailPreviewRoutes.get("/goodbye", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("goodbye", { name: "Dev Kant Kumar" });
  res.send(html);
});

EmailPreviewRoutes.get("/streak-warning", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("streak-warning", { name: "Dev Kant Kumar", streak: "5" });
  res.send(html);
});

EmailPreviewRoutes.get("/streak-lost", checkPreviewCode, (req, res) => {
  const html = getTemplateContent("streak-lost", { name: "Dev Kant Kumar", streak: "7" });
  res.send(html);
});

module.exports = EmailPreviewRoutes;

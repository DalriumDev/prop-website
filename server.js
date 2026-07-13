const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ============================================
// Middleware
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ============================================
// دیتابیس موقت (در حافظه) - برای تست
// ============================================
// این دیتابیس با ری‌استارت سرور پاک میشه
// برای تولید از MongoDB واقعی استفاده کن

const usersDB = [];
const challengesDB = [];

// ============================================
// توابع کمکی
// ============================================
function findUserByEmail(email) {
  return usersDB.find(user => user.email === email);
}

function findUserById(id) {
  return usersDB.find(user => user.id === id);
}

function generateId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function generateChallengeId() {
  return 'ch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ============================================
// توابع JWT
// ============================================
const JWT_SECRET = process.env.JWT_SECRET || 'ayandehsazan_secret_key_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ============================================
// Middleware احراز هویت
// ============================================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'لطفاً وارد حساب خود شوید' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'لطفاً وارد حساب خود شوید' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'توکن نامعتبر است، دوباره وارد شوید' });
  }

  req.user = decoded;
  next();
}

// ============================================
// مسیرهای API
// ============================================

// صفحه اصلی
app.get('/', (req, res) => {
  res.json({
    message: '🚀 آینده‌سازان API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/profile',
      challenges: 'GET /api/challenges',
      createChallenge: 'POST /api/challenges'
    }
  });
});

// وضعیت سلامت
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    usersCount: usersDB.length,
    challengesCount: challengesDB.length
  });
});

// ============================================
// ثبت‌نام
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // اعتبارسنجی
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: '❌ تمامی فیلدها الزامی هستند' 
      });
    }

    if (fullName.length < 3) {
      return res.status(400).json({ 
        message: '❌ نام باید حداقل ۳ کاراکتر باشد' 
      });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ 
        message: '❌ ایمیل معتبر نیست' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: '❌ رمز عبور باید حداقل ۸ کاراکتر باشد' 
      });
    }

    // بررسی تکراری نبودن ایمیل
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        message: '❌ این ایمیل قبلاً ثبت شده است' 
      });
    }

    // هش کردن رمز عبور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ساخت کاربر جدید
    const newUser = {
      id: generateId(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // ذخیره در دیتابیس موقت
    usersDB.push(newUser);
    console.log(`✅ کاربر جدید ثبت شد: ${newUser.email}`);

    // تولید توکن
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: '✅ ثبت‌نام با موفقیت انجام شد',
      token: token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('❌ خطا در ثبت‌نام:', error);
    res.status(500).json({ 
      message: '❌ خطا در سرور: ' + error.message 
    });
  }
});

// ============================================
// ورود
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // اعتبارسنجی
    if (!email || !password) {
      return res.status(400).json({ 
        message: '❌ ایمیل و رمز عبور الزامی هستند' 
      });
    }

    // پیدا کردن کاربر
    const user = findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ 
        message: '❌ ایمیل یا رمز عبور اشتباه است' 
      });
    }

    // بررسی رمز عبور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: '❌ ایمیل یا رمز عبور اشتباه است' 
      });
    }

    // تولید توکن
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: '✅ ورود با موفقیت انجام شد',
      token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ خطا در ورود:', error);
    res.status(500).json({ 
      message: '❌ خطا در سرور: ' + error.message 
    });
  }
});

// ============================================
// دریافت پروفایل (نیاز به احراز هویت)
// ============================================
app.get('/api/profile', authMiddleware, (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        message: '❌ کاربر یافت نشد' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت پروفایل:', error);
    res.status(500).json({ 
      message: '❌ خطا در سرور: ' + error.message 
    });
  }
});

// ============================================
// ثبت چالش جدید (نیاز به احراز هویت)
// ============================================
app.post('/api/challenges', authMiddleware, (req, res) => {
  try {
    const { plan, amount, txHash } = req.body;

    if (!plan || !amount || !txHash) {
      return res.status(400).json({ 
        message: '❌ تمامی فیلدها الزامی هستند' 
      });
    }

    // اعتبارسنجی پلن
    const validPlans = ['10k', '25k', '50k', '100k'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ 
        message: '❌ پلن نامعتبر است' 
      });
    }

    // ساخت چالش جدید
    const newChallenge = {
      id: generateChallengeId(),
      userId: req.user.id,
      userEmail: req.user.email,
      plan: plan,
      amount: Number(amount),
      txHash: txHash.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    challengesDB.push(newChallenge);
    console.log(`✅ چالش جدید ثبت شد: ${newChallenge.id} - کاربر: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: '✅ چالش با موفقیت ثبت شد! تیم پشتیبانی تراکنش را بررسی می‌کند.',
      challenge: newChallenge
    });

  } catch (error) {
    console.error('❌ خطا در ثبت چالش:', error);
    res.status(500).json({ 
      message: '❌ خطا در سرور: ' + error.message 
    });
  }
});

// ============================================
// دریافت لیست چالش‌های کاربر (نیاز به احراز هویت)
// ============================================
app.get('/api/challenges', authMiddleware, (req, res) => {
  try {
    const userChallenges = challengesDB.filter(
      ch => ch.userId === req.user.id
    );

    res.json({
      success: true,
      challenges: userChallenges
    });

  } catch (error) {
    console.error('❌ خطا در دریافت چالش‌ها:', error);
    res.status(500).json({ 
      message: '❌ خطا در سرور: ' + error.message 
    });
  }
});

// ============================================
// دریافت لیست همه کاربران (فقط برای تست)
// ============================================
app.get('/api/users', (req, res) => {
  try {
    const users = usersDB.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('❌ خطا:', error);
    res.status(500).json({ 
      message: '❌ خطا در سرور' 
    });
  }
});

// ============================================
// هندل کردن مسیرهای پیدا نشده (404)
// ============================================
app.use((req, res) => {
  res.status(404).json({
    message: '❌ مسیر مورد نظر پیدا نشد',
    path: req.path
  });
});

// ============================================
// اجرای سرور
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 آینده‌سازان - سرور در حال اجرا');
  console.log('='.repeat(50));
  console.log(`🌐 آدرس: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`💚 وضعیت: ${new Date().toISOString()}`);
  console.log(`👥 کاربران ثبت‌شده: ${usersDB.length}`);
  console.log(`📋 چالش‌های ثبت‌شده: ${challengesDB.length}`);
  console.log('='.repeat(50));
});

// ============================================
// نمایش اطلاعات در کنسول هر بار که درخواست میاد
// ============================================
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});
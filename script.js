// ============================================
// SITE CONFIG
// ============================================
var NAV_ITEMS = [
  { key: 'index', href: 'index.html', label: 'خانه' },
  { key: 'challenges', href: 'challenges.html', label: 'خرید چالش' },
  { key: 'rules', href: 'rules.html', label: 'قوانین' },
  { key: 'support', href: 'support.html', label: 'پشتیبانی' }
];

// ============================================
// API CONFIG - آدرس سرور در Render
// ============================================
const API_BASE_URL = 'https://prop-website-tpqz.onrender.com';
const API_URL = `${API_BASE_URL}/api`;

console.log('📡 API URL:', API_URL);

// ============================================
// توابع احراز هویت
// ============================================
function isLoggedIn() {
  return !!localStorage.getItem('authToken');
}

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function redirectToLogin(redirectTo) {
  localStorage.setItem('redirectAfterLogin', redirectTo || (window.location.pathname.split('/').pop() + window.location.search));
  window.location.href = 'login.html';
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}

// ============================================
// API REQUESTS
// ============================================
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_URL}${endpoint}`;
  console.log('📤 ارسال به:', url);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const token = getAuthToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'خطا در ارتباط با سرور');
    }

    return result;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('❌ سرور در دسترس نیست! لطفاً:\n1. اتصال اینترنت خود را بررسی کنید\n2. آدرس سرور: ' + API_URL);
    }
    throw error;
  }
}

// ============================================
// HEADER / FOOTER
// ============================================
function buildHeaderHTML(active) {
  var links = NAV_ITEMS.map(function(item) {
    var cls = item.key === active ? ' class="active"' : '';
    return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
  }).join('');

  var actions;
  if (isLoggedIn()) {
    var dashLink = active === 'dashboard' ? '' : '<a href="dashboard.html" class="btn btn-ghost btn-sm">داشبورد</a>';
    actions = dashLink + '<a href="#" class="btn btn-gold btn-sm" id="logoutBtn">خروج</a>';
  } else {
    actions = '<a href="login.html" class="btn btn-ghost btn-sm">ورود</a><a href="signup.html" class="btn btn-gold btn-sm">ثبت‌نام</a>';
  }

  return (
    '<header>' +
      '<div class="wrap nav">' +
        '<a href="index.html" class="logo"><span class="mark"></span> آینده‌سازان</a>' +
        '<button class="burger" aria-label="باز کردن منو" aria-expanded="false" aria-controls="mainNav">☰</button>' +
        '<nav class="navlinks" id="mainNav">' + links + '</nav>' +
        '<div class="nav-actions">' + actions + '</div>' +
      '</div>' +
    '</header>' +
    '<div class="ticker"><div class="ticker-track" id="tickerTrack"></div></div>'
  );
}

function buildFooterHTML() {
  var loggedIn = isLoggedIn();
  var authLink = loggedIn
    ? '<a href="dashboard.html">داشبورد</a>'
    : '<a href="login.html">ورود</a>';

  return (
    '<footer>' +
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<a href="index.html" class="logo"><span class="mark"></span> آینده‌سازان</a>' +
          '<div class="foot-links">' +
            '<a href="challenges.html">خرید چالش</a>' +
            '<a href="rules.html">قوانین</a>' +
            '<a href="support.html">پشتیبانی</a>' +
            authLink +
          '</div>' +
        '</div>' +
        '<p class="disclaimer">معامله در بازارهای مالی دارای ریسک از دست دادن سرمایه است و ممکن است برای همه معامله‌گران مناسب نباشد. عملکرد گذشته تضمینی برای نتایج آینده نیست.</p>' +
      '</div>' +
    '</footer>'
  );
}

function initHeader(active) {
  var el = document.getElementById('site-header');
  if (!el) return;
  el.outerHTML = buildHeaderHTML(active);

  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

function initFooter() {
  var el = document.getElementById('site-footer');
  if (!el) return;
  el.outerHTML = buildFooterHTML();
}

// ============================================
// BURGER MENU
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  var burger = document.querySelector('.burger');
  var navlinks = document.querySelector('.navlinks');

  if (burger && navlinks) {
    burger.addEventListener('click', function() {
      var open = navlinks.classList.toggle('open');
      burger.textContent = open ? '✕' : '☰';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navlinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navlinks.classList.remove('open');
        burger.textContent = '☰';
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
});

// ============================================
// TICKER DATA
// ============================================
var tickerData = [
  ['طلای جهانی', '+2.3%', 'up'],
  ['شاخص S&P', '-0.8%', 'down'],
  ['بیت‌کوین', '+5.1%', 'up'],
  ['EUR/USD', '+1.2%', 'up'],
  ['نفت برنت', '-1.5%', 'down'],
  ['طلا', '+0.9%', 'up'],
  ['شاخص دلار', '-0.4%', 'down'],
  ['NASDAQ', '+3.2%', 'up']
];

function renderTicker() {
  var track = document.getElementById('tickerTrack');
  if (!track) return;

  var html = '';
  for (var r = 0; r < 2; r++) {
    for (var i = 0; i < tickerData.length; i++) {
      var item = tickerData[i];
      html += '<span class="tick">' + item[0] + ' <b>آینده‌سازان</b> <span class="' + item[2] + '">' + item[1] + '</span></span>';
    }
  }
  track.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderTicker);

// ============================================
// SPLASH SCREEN
// ============================================
function hideSplash() {
  var splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(function() {
      splash.style.display = 'none';
    }, 800);
  }
}

if (document.readyState === 'complete') {
  setTimeout(hideSplash, 1200);
} else {
  window.addEventListener('load', function() {
    setTimeout(hideSplash, 1200);
  });
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function initScrollProgress() {
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.id = 'scrollProgress';
  document.body.prepend(bar);

  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollProgress);
} else {
  initScrollProgress();
}

// ============================================
// CARD TOUCH EFFECTS
// ============================================
function initCardTouch() {
  document.querySelectorAll('.ticket-card, .cell, .panel').forEach(function(card) {
    card.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
    }, { passive: true });
    card.addEventListener('touchend', function() {
      this.style.transform = '';
    }, { passive: true });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardTouch);
} else {
  initCardTouch();
}

// ============================================
// FORM HELPERS
// ============================================
function showFormMessage(msgEl, text) {
  if (!text) text = msgEl.dataset.defaultText || msgEl.textContent;
  if (text) msgEl.textContent = text;
  msgEl.classList.add('show');
  msgEl.setAttribute('role', 'status');
}

function showFieldError(input, hintEl, text) {
  input.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
  if (hintEl) {
    hintEl.textContent = text;
    hintEl.classList.add('error');
  }
}

function clearFieldError(input, hintEl, restoreText) {
  input.classList.remove('invalid');
  input.removeAttribute('aria-invalid');
  if (hintEl) {
    hintEl.textContent = restoreText || '';
    hintEl.classList.remove('error');
  }
}

// ============================================
// LOGIN FORM
// ============================================
function initLoginForm() {
  var form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var email = document.getElementById('lemail').value.trim();
    var password = document.getElementById('lpassword').value;
    var msg = document.getElementById('loginMsg');
    var btn = form.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.textContent = '⏳ در حال ورود...';

    try {
      const result = await apiRequest('/auth/login', 'POST', { email, password });

      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userEmail', result.user.email);
      localStorage.setItem('userName', result.user.fullName);

      showFormMessage(msg, '✅ ورود با موفقیت انجام شد! در حال انتقال...');

      var redirectUrl = localStorage.getItem('redirectAfterLogin') || 'dashboard.html';
      localStorage.removeItem('redirectAfterLogin');

      setTimeout(function() {
        window.location.href = redirectUrl;
      }, 1200);
    } catch (error) {
      showFormMessage(msg, '❌ ' + error.message);
      msg.style.borderColor = 'var(--red)';
      msg.style.color = 'var(--red)';
      btn.disabled = false;
      btn.textContent = 'ورود';
    }
  });
}

// ============================================
// SIGNUP FORM
// ============================================
function initSignupForm() {
  var form = document.getElementById('signupForm');
  if (!form) return;

  var pass = document.getElementById('password');
  var pass2 = document.getElementById('password2');
  var hint = pass2.closest('.field').querySelector('.field-hint');

  function checkMatch() {
    if (!pass2.value) {
      clearFieldError(pass2, hint, '');
      return true;
    }
    if (pass.value !== pass2.value) {
      showFieldError(pass2, hint, 'رمز عبور و تکرار آن یکسان نیستند');
      return false;
    }
    clearFieldError(pass2, hint, '✅ رمزها مطابقت دارند');
    return true;
  }

  pass2.addEventListener('input', checkMatch);
  pass.addEventListener('input', function() {
    if (pass2.value) checkMatch();
  });

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!checkMatch()) {
      pass2.focus();
      return;
    }

    var msg = document.getElementById('signupMsg');
    var fullName = document.getElementById('fullname').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var btn = form.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.textContent = '⏳ در حال ثبت‌نام...';

    try {
      const result = await apiRequest('/auth/register', 'POST', {
        fullName,
        email,
        password
      });

      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userEmail', result.user.email);
      localStorage.setItem('userName', result.user.fullName);

      showFormMessage(msg, '✅ ثبت‌نام با موفقیت انجام شد! در حال انتقال...');

      setTimeout(function() {
        window.location.href = 'challenges.html';
      }, 1500);
    } catch (error) {
      showFormMessage(msg, '❌ ' + error.message);
      msg.style.borderColor = 'var(--red)';
      msg.style.color = 'var(--red)';
      btn.disabled = false;
      btn.textContent = 'ساخت حساب';
    }
  });
}

// ============================================
// SUPPORT FORM
// ============================================
function initSupportForm() {
  var form = document.getElementById('supportForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var msg = document.getElementById('supportMsg');
    showFormMessage(msg);
    form.reset();
    setTimeout(function() {
      msg.classList.remove('show');
    }, 5000);
  });
}

// ============================================
// PAYMENT PAGE
// ============================================
var PLANS = {
  '10k': { label: '۱۰,۰۰۰ دلار', price: '$59', usdt: '۵۹' },
  '25k': { label: '۲۵,۰۰۰ دلار', price: '$129', usdt: '۱۲۹' },
  '50k': { label: '۵۰,۰۰۰ دلار', price: '$229', usdt: '۲۲۹' },
  '100k': { label: '۱۰۰,۰۰۰ دلار', price: '$429', usdt: '۴۲۹' }
};

var WALLET_ADDRESS = 'TQmZ5q3x9Y7v2W4k8L6nP1oR3sT5uV7wX9';
var TX_HASH_PATTERN = /^[a-fA-F0-9]{64}$/;

function initPaymentPage() {
  var submitBtn = document.getElementById('submitHash');
  if (!submitBtn) return;

  var urlParams = new URLSearchParams(window.location.search);
  var plan = urlParams.get('plan') || '25k';
  var selected = PLANS[plan] || PLANS['25k'];

  document.getElementById('planDisplay').textContent = selected.label;
  document.getElementById('priceDisplay').textContent = selected.price;
  document.getElementById('usdtDisplay').textContent = selected.usdt + ' USDT';
  document.getElementById('usdtAmount').textContent = selected.usdt + ' USDT';

  var copyBtn = document.getElementById('copyBtn');
  var addressEl = document.getElementById('walletAddress');

  function flashCopied(btn) {
    btn.textContent = '✅ کپی شد!';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = '📋 کپی آدرس';
      btn.classList.remove('copied');
    }, 3000);
  }

  copyBtn.addEventListener('click', function() {
    var address = addressEl.textContent;
    var btn = this;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(function() {
        flashCopied(btn);
      }).catch(function() {
        fallbackCopy(address, btn);
      });
    } else {
      fallbackCopy(address, btn);
    }
  });

  function fallbackCopy(text, btn) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      flashCopied(btn);
    } catch (err) {
      alert('لطفاً آدرس را دستی کپی کنید: ' + text);
    }
    document.body.removeChild(textArea);
  }

  var txHash = document.getElementById('txHash');
  var hashHint = document.getElementById('txHashHint');
  var msg = document.getElementById('paymentMsg');

  function validateHash(showError) {
    var value = txHash.value.trim();
    if (!value) {
      clearFieldError(txHash, hashHint, 'هش را از صرافی یا کیف پول خود کپی کنید');
      return false;
    }
    if (!TX_HASH_PATTERN.test(value)) {
      if (showError) {
        showFieldError(txHash, hashHint, '❌ هش باید ۶۴ کاراکتر عددی-حروفی (hex) باشد');
      }
      return false;
    }
    clearFieldError(txHash, hashHint, '✅ فرمت هش معتبر است');
    return true;
  }

  txHash.addEventListener('blur', function() { validateHash(true); });
  txHash.addEventListener('focus', function() {
    txHash.classList.remove('invalid');
    txHash.removeAttribute('aria-invalid');
  });

  submitBtn.addEventListener('click', async function() {
    if (!validateHash(true)) {
      txHash.focus();
      return;
    }

    var btn = this;
    btn.disabled = true;
    btn.textContent = '⏳ در حال ثبت...';

    try {
      const plan = urlParams.get('plan') || '25k';
      const amount = parseFloat(selected.usdt);
      const txHashValue = txHash.value.trim();

      await apiRequest('/challenges', 'POST', {
        plan: plan,
        amount: amount,
        txHash: txHashValue
      });

      showFormMessage(msg, '✅ درخواست شما با موفقیت ثبت شد! تیم پشتیبانی تراکنش را بررسی می‌کند.');

      document.getElementById('step2').classList.remove('active');
      document.getElementById('step2').classList.add('done');
      document.getElementById('step2').querySelector('.num').textContent = '✓';

      document.getElementById('step3').classList.remove('active');
      document.getElementById('step3').classList.add('done');
      document.getElementById('step3').querySelector('.num').textContent = '✓';

      btn.textContent = '✅ ثبت شد';
      btn.style.opacity = '0.6';
      txHash.disabled = true;

    } catch (error) {
      showFormMessage(msg, '❌ ' + error.message);
      msg.style.borderColor = 'var(--red)';
      msg.style.color = 'var(--red)';
      btn.disabled = false;
      btn.textContent = '✅ ثبت هش و ارسال درخواست';
    }
  });
}

// ============================================
// DASHBOARD - LOAD DATA
// ============================================
async function loadDashboardData() {
  if (!isLoggedIn()) return;

  try {
    const profile = await apiRequest('/profile');
    const userName = profile.user?.fullName || localStorage.getItem('userName') || 'معامله‌گر';
    
    const nameEl = document.querySelector('.dash-head h1');
    if (nameEl) {
      nameEl.textContent = `سلام، ${userName} گرامی 👋`;
    }

    const challenges = await apiRequest('/challenges');
    console.log('📊 چالش‌های کاربر:', challenges);
    
  } catch (error) {
    console.error('خطا در بارگذاری داشبورد:', error);
  }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 آینده‌سازان - نسخه تولید');
  console.log('🌐 آدرس سرور:', API_URL);
  
  initLoginForm();
  initSignupForm();
  initSupportForm();
  initPaymentPage();
  
  if (document.querySelector('.dash-head')) {
    loadDashboardData();
  }
});
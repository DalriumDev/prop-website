// ============================================
// SITE CONFIG
// ============================================
var NAV_ITEMS = [
  { key: 'index', href: 'index.html', label: 'خانه' },
  { key: 'challenges', href: 'challenges.html', label: 'خرید چالش' },
  { key: 'rules', href: 'rules.html', label: 'قوانین' },
  { key: 'support', href: 'support.html', label: 'پشتیبانی' }
];

function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function redirectToLogin(redirectTo) {
  localStorage.setItem('redirectAfterLogin', redirectTo || (window.location.pathname.split('/').pop() + window.location.search));
  window.location.href = 'login.html';
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  window.location.href = 'index.html';
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
    var dashLink = active === 'dashboard' ? '' : '<a href="dashboard.html" class="btn btn-ghost">داشبورد</a>';
    actions = dashLink + '<a href="#" class="btn btn-gold" id="logoutBtn">خروج</a>';
  } else {
    actions = '<a href="login.html" class="btn btn-ghost">ورود</a><a href="signup.html" class="btn btn-gold">ثبت‌نام</a>';
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
    });

    navlinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navlinks.classList.remove('open');
        burger.textContent = '☰';
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

// ============================================
// FAQ ACCORDION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.faq-item').forEach(function(item, i) {
    var btn = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    var answerId = 'faqAnswer' + i;
    answer.id = answerId;
    btn.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    btn.setAttribute('aria-controls', answerId);

    btn.addEventListener('click', function() {
      var wasOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(function(other) {
        if (other !== item) {
          other.classList.remove('open');
          var otherBtn = other.querySelector('.faq-q');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !wasOpen);
      btn.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
    });
  });
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
  }
}

if (document.readyState === 'complete') {
  setTimeout(hideSplash, 1500);
} else {
  window.addEventListener('load', function() {
    setTimeout(hideSplash, 1500);
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
// CARD MOUSE GLOW EFFECT
// ============================================
function initCardGlow() {
  document.querySelectorAll('.ticket-card, .cell, .panel').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = this.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      this.style.setProperty('--mouse-x', x + '%');
      this.style.setProperty('--mouse-y', y + '%');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardGlow);
} else {
  initCardGlow();
}

// ============================================
// GENERIC FORM
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
// LOGIN
// ============================================
function initLoginForm() {
  var form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', document.getElementById('lemail').value);

    var msg = document.getElementById('loginMsg');
    showFormMessage(msg);

    var redirectUrl = localStorage.getItem('redirectAfterLogin') || 'dashboard.html';
    localStorage.removeItem('redirectAfterLogin');

    setTimeout(function() {
      window.location.href = redirectUrl;
    }, 1200);
  });
}

// ============================================
// SIGNUP
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
    clearFieldError(pass2, hint, 'رمزها مطابقت دارند ✓');
    return true;
  }

  pass2.addEventListener('input', checkMatch);
  pass.addEventListener('input', function() {
    if (pass2.value) checkMatch();
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!checkMatch()) {
      pass2.focus();
      return;
    }

    var msg = document.getElementById('signupMsg');
    showFormMessage(msg);

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', document.getElementById('email').value);

    setTimeout(function() {
      window.location.href = 'payment.html';
    }, 1500);
  });
}

// ============================================
// SUPPORT
// ============================================
function initSupportForm() {
  var form = document.getElementById('supportForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var msg = document.getElementById('supportMsg');
    showFormMessage(msg);
    form.reset();
  });
}

// ============================================
// PAYMENT
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
    navigator.clipboard.writeText(address).then(function() {
      flashCopied(btn);
    }).catch(function() {
      var textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      flashCopied(btn);
    });
  });

  var txHash = document.getElementById('txHash');
  var hashHint = document.getElementById('txHashHint');
  var msg = document.getElementById('paymentMsg');

  function validateHash(showError) {
    var value = txHash.value.trim();
    if (!value) {
      clearFieldError(txHash, hashHint, 'هش را از صرافی یا کیف پول خود کپی کنید و در اینجا بچسبانید');
      return false;
    }
    if (!TX_HASH_PATTERN.test(value)) {
      if (showError) {
        showFieldError(txHash, hashHint, 'هش تراکنش باید ۶۴ کاراکتر عددی-حروفی (hex) باشد');
      }
      return false;
    }
    clearFieldError(txHash, hashHint, 'فرمت هش معتبر است ✓');
    return true;
  }

  txHash.addEventListener('blur', function() { validateHash(true); });
  txHash.addEventListener('focus', function() {
    txHash.classList.remove('invalid');
    txHash.removeAttribute('aria-invalid');
  });

  submitBtn.addEventListener('click', function() {
    if (!validateHash(true)) {
      txHash.focus();
      return;
    }

    showFormMessage(msg);

    document.getElementById('step2').classList.remove('active');
    document.getElementById('step2').classList.add('done');
    document.getElementById('step2').querySelector('.num').textContent = '✓';

    document.getElementById('step3').classList.remove('active');
    document.getElementById('step3').classList.add('done');
    document.getElementById('step3').querySelector('.num').textContent = '✓';

    this.disabled = true;
    this.textContent = '✅ درخواست ثبت شد';
    this.style.opacity = '0.6';

    txHash.disabled = true;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initLoginForm();
  initSignupForm();
  initSupportForm();
  initPaymentPage();
});
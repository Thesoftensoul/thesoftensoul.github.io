// ============================================
// THE SOFTEN SOUL - FORM HANDLER
// Simple Working Version
// ============================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzoE5i7BO51jbUtHUm_FoB2sZCSd5LqTwhABe25JRGwpbBSHTXcT6aazdKBarOLaR6Q/exec';

// Rate limiting
const RATE_LIMIT_MS = 5000;
let lastSubmissionTime = 0;

// ============================================
// INITIALIZE FORM
// ============================================

function initIntakeForm() {
  console.log('Form handler loaded');
  
  const form = document.getElementById('intakeForm');
  if (!form) {
    console.error('Form not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check honeypot
    const honeypot = form.querySelector('[name="honeypot"]');
    if (honeypot && honeypot.value !== '') {
      return;
    }

    // Check consent
    const consent = form.querySelector('#consent');
    if (!consent.checked) {
      alert('Please confirm your consent before submitting.');
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      alert('Please wait a moment before submitting again.');
      return;
    }

    // Collect data
    const formData = {
      formType: 'intake',
      name: getValue(form, '#name'),
      email: getValue(form, '#email'),
      phone: getValue(form, '#phone'),
      serviceInterest: getValue(form, '#serviceInterest'),
      bringsYouHere: getValue(form, '#bringsYouHere'),
      hopeToAchieve: getValue(form, '#hopeToAchieve'),
      biggestChallenge: getValue(form, '#biggestChallenge'),
      startTimeline: getValue(form, '#startTimeline'),
      bestTime: getValue(form, '#bestTime'),
      contactMethod: getValue(form, '#contactMethod'),
      howHeard: getValue(form, '#howHeard'),
      notes: getValue(form, '#notes')
    };

    // Validate
    if (!validate(formData)) {
      return;
    }

    // Submit
    await submit(formData, form);
  });
}

// ============================================
// SUBMIT FORM
// ============================================

async function submit(formData, form) {
  const submitBtn = form.querySelector('#submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  try {
    // Show loading
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'flex';

    // Send to Google
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    // Update rate limit
    lastSubmissionTime = Date.now();

    // Show thank you
    showThankYou();

  } catch (error) {
    console.error('Error:', error);
    alert('There was a problem. Please email us at contact@hello.theselfcaremethod.com');
    
    submitBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoading) btnLoading.style.display = 'none';
  }
}

// ============================================
// SHOW THANK YOU MESSAGE
// ============================================

function showThankYou() {
  // Hide everything
  const formHeader = document.getElementById('formHeader');
  const formCard = document.querySelector('.form-card');
  const thankYouMessage = document.getElementById('thankYouMessage');
  const privacyNote = document.querySelector('.privacy-note');

  if (formHeader) formHeader.style.display = 'none';
  if (formCard) formCard.style.display = 'none';
  if (privacyNote) privacyNote.style.display = 'none';
  
  // Show thank you
  if (thankYouMessage) {
    thankYouMessage.style.display = 'block';
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// VALIDATION
// ============================================

function validate(data) {
  if (!data.name || data.name.length < 2) {
    alert('Please enter your full name.');
    return false;
  }

  if (!isValidEmail(data.email)) {
    alert('Please enter a valid email address.');
    return false;
  }

  if (!data.serviceInterest) {
    alert('Please select which service you\'re interested in.');
    return false;
  }

  if (!data.bringsYouHere || data.bringsYouHere.length < 10) {
    alert('Please tell us more about what brings you here.');
    return false;
  }

  if (!data.hopeToAchieve || data.hopeToAchieve.length < 10) {
    alert('Please tell us what you hope to achieve.');
    return false;
  }

  if (!data.biggestChallenge || data.biggestChallenge.length < 10) {
    alert('Please describe your biggest challenge.');
    return false;
  }

  if (!data.startTimeline) {
    alert('Please select when you\'d like to start.');
    return false;
  }

  if (!data.bestTime) {
    alert('Please select the best time to reach you.');
    return false;
  }

  if (!data.contactMethod) {
    alert('Please select your preferred contact method.');
    return false;
  }

  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// UTILITIES
// ============================================

function getValue(form, selector) {
  const element = form.querySelector(selector);
  return element ? element.value.trim() : '';
}

function checkRateLimit() {
  const now = Date.now();
  return (now - lastSubmissionTime) >= RATE_LIMIT_MS;
}

// ============================================
// PHONE FORMATTING
// ============================================

function formatPhone(input) {
  let value = input.target.value.replace(/\D/g, '');
  if (value.length > 10) value = value.slice(0, 10);
  
  let formatted = '';
  if (value.length > 0) formatted = '(' + value.substring(0, 3);
  if (value.length >= 4) formatted += ') ' + value.substring(3, 6);
  if (value.length >= 7) formatted += '-' + value.substring(6, 10);
  
  input.target.value = formatted;
}

document.addEventListener('DOMContentLoaded', () => {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', formatPhone);
  });
});

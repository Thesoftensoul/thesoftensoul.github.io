// ============================================
// THE SOFTEN SOUL - FORM HANDLER
// Frontend JavaScript - Intake Form
// ============================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqxwyXgr8H5oWSMzUPy5MWhYZBbO6LPXGZDfxEH2uYnkKBADLYnUyOsT4JeNIrN9SE/exec';

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

  // Add listener for country code changes (show/hide area code)
  const countryCodeInput = form.querySelector('#countryCode');
  if (countryCodeInput) {
    countryCodeInput.addEventListener('input', toggleAreaCodeField);
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
      countryCode: getValue(form, '#countryCode'),
      areaCode: getValue(form, '#areaCode'),
      phone: getValue(form, '#phone'),
      steadiness: getValue(form, '#steadiness'),
      clinicalCare: getValue(form, '#clinicalCare'),
      serviceInterest: getValue(form, '#serviceInterest'),
      bringsYouHere: getValue(form, '#bringsYouHere'),
      hopingFor: getValue(form, '#hopingFor'),
      hopeToAchieve: getValue(form, '#hopeToAchieve'),
      biggestChallenge: getValue(form, '#biggestChallenge'),
      griefUnderneath: getValue(form, '#griefUnderneath'),
      startTimeline: getValue(form, '#startTimeline'),
      bestTime: getValue(form, '#bestTime'),
      contactMethod: getValue(form, '#contactMethod'),
      timeZone: getValue(form, '#timeZone'),
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
// TOGGLE AREA CODE FIELD
// ============================================

function toggleAreaCodeField() {
  const form = document.getElementById('intakeForm');
  const countryCodeInput = form.querySelector('#countryCode');
  const areaCodeContainer = document.getElementById('areaCodeContainer');
  
  if (!areaCodeContainer) return;
  
  const countryCode = countryCodeInput.value.trim();
  
  // Show area code field only if country code is +1 or 1 (USA)
  if (countryCode === '+1' || countryCode === '1') {
    areaCodeContainer.style.display = 'block';
  } else {
    areaCodeContainer.style.display = 'none';
    // Clear area code if hidden
    const areaCodeInput = form.querySelector('#areaCode');
    if (areaCodeInput) {
      areaCodeInput.value = '';
    }
  }
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
    alert('There was a problem. Please email us at contact@thesoftensoul.com');
    
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

  if (!data.countryCode || data.countryCode.length < 1) {
    alert('Please enter your country code.');
    return false;
  }

  if ((data.countryCode === '+1' || data.countryCode === '1') && !data.areaCode) {
    alert('Please enter your area code.');
    return false;
  }

  if (!data.phone || data.phone.length < 5) {
    alert('Please enter your phone number.');
    return false;
  }

  if (!data.steadiness) {
    alert('Please let us know which feels most true for you right now.');
    return false;
  }

  if (!data.clinicalCare) {
    alert('Please answer the question about mental health support.');
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

  if (!data.hopingFor) {
    alert('Please let us know what you\'re most hoping for.');
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

  if (!data.timeZone) {
    alert('Please select your time zone.');
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
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initIntakeForm();
});

// ============================================
// THE SOFTEN SOUL - FORM HANDLER
// Frontend JavaScript - Intake Form
// ============================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqxwyXgr8H5oWSMzUPy5MWhYZBbO6LPXGZDfxEH2uYnkKBADLYnUyOsT4JeNIrN9SE/exec';

// Rate limiting
const RATE_LIMIT_MS = 5000;
let lastSubmissionTime = 0;


// ============================================
// OFFER ROUTING CONFIG
// Paste your Stripe payment links below when ready.
// Leave a link as '' and that offer falls back to a
// personal follow-up message instead of a pay button.
// ============================================

const OFFERS = {
  clarity: {
    label: 'The Clarity Conversation',
    payLink: '',
    next: 'Your next step is to book and pay for your session. Once that is done you will receive a link to choose your time.'
  },
  soften: {
    label: 'Soften Into Self',
    payLink: '',
    next: 'Your next step is to secure your place. Once that is done you will receive a link to schedule your opening session.'
  },
  journey: {
    label: 'The Soften Soul Journey',
    payLink: '',
    next: 'I read every Journey application myself. I will reach out within two business days so we can talk before you begin.'
  }
};

function getOfferKey() {
  const q = new URLSearchParams(window.location.search).get('offer');
  return (q && OFFERS[q]) ? q : null;
}

// Pre-select the service dropdown based on the button she clicked
function applyOfferFromUrl() {
  const key = getOfferKey();
  if (!key) return;
  const select = document.getElementById('serviceInterest');
  if (select) select.value = OFFERS[key].label;
}

// Anyone answering this way needs care we are not the right place for
function needsReferral(data) {
  return data.steadiness === 'In crisis'
      || data.steadiness === 'Struggling, not steady'
      || data.clinicalCare === 'May need support now';
}

function isCrisis(data) {
  return data.steadiness === 'In crisis';
}

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

  applyOfferFromUrl();

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
      offerClicked: getOfferKey() || '',
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
    showThankYou(formData);

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

function showThankYou(data) {
  buildThankYouMessage(data || {});

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
// BUILD THE THANK YOU MESSAGE
// ============================================

function buildThankYouMessage(data) {
  const heading = document.getElementById('thankYouHeading');
  const body = document.getElementById('thankYouBody');
  if (!body) return;

  // Referral path: no payment, no scheduling, just care
  if (needsReferral(data)) {
    if (heading) heading.textContent = 'Thank you for your honesty.';
    let html = '<p>What you shared matters, and I am glad you took the time to write it down.</p>';
    html += '<p>Coaching works best alongside clinical care, not instead of it. Based on what you shared, the right next step is support from a licensed therapist or counselor who can walk with you through this part. That is not a door closing. It is the door that fits where you are.</p>';
    if (isCrisis(data)) {
      html += '<p style="margin-top:1.5rem;"><strong>If you are in immediate danger or thinking of harming yourself, please call or text 988 in the US to reach the Suicide and Crisis Lifeline, any time of day.</strong></p>';
    }
    html += '<p style="margin-top:1.5rem;">If you would like help finding someone, write to me at contact@thesoftensoul.com and I will point you toward good options. When you are steady, the door here is open.</p>';
    body.innerHTML = html;
    return;
  }

  // Everyone else
  const key = data.offerClicked;
  const offer = (key && OFFERS[key]) ? OFFERS[key] : null;

  if (offer) {
    if (heading) heading.textContent = 'You are in.';
    let html = '<p>Thank you for sharing what brought you here. <strong>' + offer.label + '</strong> is a good fit based on what you told me.</p>';
    if (offer.payLink) {
      html += '<p>' + offer.next + '</p>';
      html += '<p style="margin-top:1.5rem;"><a href="' + offer.payLink + '" class="btn-primary" style="display:inline-block;">Continue to ' + offer.label + '</a></p>';
    } else {
      html += '<p>' + offer.next + '</p>';
      html += '<p>I will be in touch within two business days by your preferred contact method.</p>';
    }
    body.innerHTML = html;
    return;
  }

  if (heading) heading.textContent = 'Thank you for sharing.';
  body.innerHTML = '<p>I have received what you wrote and I read every one of these myself.</p>'
    + '<p>I will reach out within two business days by your preferred contact method so we can talk about where to begin.</p>';
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

// ============================================
// THE SOFTEN SOUL - FORM HANDLER
// Simplified and Working Version
// ============================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzoE5i7BO51jbUtHUm_FoB2sZCSd5LqTwhABe25JRGwpbBSHTXcT6aazdKBarOLaR6Q/exec';
const CALENDAR_LINK = 'https://calendar.app.google/CUCV2TQ1JRUPZQ4v9';

// Rate limiting
const RATE_LIMIT_MS = 5000;
let lastSubmissionTime = 0;

// ============================================
// INTAKE FORM INITIALIZATION
// ============================================

function initIntakeForm() {
  console.log('Initializing intake form...');
  
  const form = document.getElementById('intakeForm');
  if (!form) {
    console.error('Intake form not found!');
    return;
  }

  console.log('Intake form found, adding submit listener');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted!');

    // Check honeypot
    const honeypot = form.querySelector('[name="honeypot"]');
    if (honeypot && honeypot.value !== '') {
      console.log('Spam detected');
      return;
    }

    // Check consent
    const consent = form.querySelector('#consent');
    if (consent && !consent.checked) {
      alert('Please confirm your consent before submitting.');
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      alert('Please wait a moment before submitting again.');
      return;
    }

    // Get form data
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

    console.log('Form data collected:', formData);

    // Validate
    if (!validateIntakeForm(formData)) {
      return;
    }

    // Submit
    await submitIntakeForm(formData, form);
  });
}

// ============================================
// FORM SUBMISSION
// ============================================

async function submitIntakeForm(formData, form) {
  const submitBtn = form.querySelector('#submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  try {
    console.log('Starting submission...');

    // Show loading state
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'flex';

    // Submit to Google Apps Script
    console.log('Sending to:', SCRIPT_URL);
    
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('Submission complete!');

    // Update rate limit
    lastSubmissionTime = Date.now();

    // Show success and redirect
   console.log('Submission complete!');

    // Update rate limit
    lastSubmissionTime = Date.now();

    // Show thank you message
    showThankYou();

  } catch (error) {
    console.error('Submission error:', error);
    alert('There was a problem submitting your form. Please try again or email us at contact@hello.theselfcaremethod.com');
    
    // Reset button
    submitBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoading) btnLoading.style.display = 'none';
  }
}

// ============================================
// SUCCESS HANDLER
// ============================================

function showSuccessAndRedirect() {
  // Hide the form
  const formCard = document.querySelector('.form-card');
  const successMessage = document.getElementById('successMessage');

  console.log('Showing success message');
  console.log('Form card:', formCard);
  console.log('Success message element:', successMessage);

  if (formCard && successMessage) {
    // Method 1: Hide form and show success message
    formCard.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('Success message displayed');
    
    // Don't auto-redirect - let them click the button
  } else {
    // Method 2: Alert and redirect if elements not found
    console.log('Elements not found, using alert method');
    alert('✅ Thank you! Your intake form has been submitted.\n\nClick OK to schedule your complimentary 15-minute discovery call.');
    window.location.href = CALENDAR_LINK;
  }
}

// ============================================
// VALIDATION
// ============================================

function validateIntakeForm(data) {
  // Name
  if (!data.name || data.name.length < 2) {
    alert('Please enter your full name.');
    return false;
  }

  // Email
  if (!isValidEmail(data.email)) {
    alert('Please enter a valid email address.');
    return false;
  }

  // Service interest
  if (!data.serviceInterest) {
    alert('Please select which service you\'re interested in.');
    return false;
  }

  // Brings you here
  if (!data.bringsYouHere || data.bringsYouHere.length < 10) {
    alert('Please tell us more about what brings you here (at least 10 characters).');
    return false;
  }

  // Hope to achieve
  if (!data.hopeToAchieve || data.hopeToAchieve.length < 10) {
    alert('Please tell us what you hope to achieve (at least 10 characters).');
    return false;
  }

  // Biggest challenge
  if (!data.biggestChallenge || data.biggestChallenge.length < 10) {
    alert('Please describe your biggest challenge (at least 10 characters).');
    return false;
  }

  // Start timeline
  if (!data.startTimeline) {
    alert('Please select when you\'d like to start.');
    return false;
  }

  // Best time
  if (!data.bestTime) {
    alert('Please select the best time to reach you.');
    return false;
  }

  // Contact method
  if (!data.contactMethod) {
    alert('Please select your preferred contact method.');
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getValue(form, selector) {
  const element = form.querySelector(selector);
  return element ? element.value.trim() : '';
}

function checkRateLimit() {
  const now = Date.now();
  const timeSinceLastSubmission = now - lastSubmissionTime;
  return timeSinceLastSubmission >= RATE_LIMIT_MS;
}

// ============================================
// PHONE FORMATTING
// ============================================

function formatPhoneNumber(input) {
  const phoneInput = input.target;
  let value = phoneInput.value.replace(/\D/g, '');
  
  if (value.length > 10) {
    value = value.slice(0, 10);
  }
  
  let formatted = '';
  if (value.length > 0) {
    formatted = '(' + value.substring(0, 3);
  }
  if (value.length >= 4) {
    formatted += ') ' + value.substring(3, 6);
  }
  if (value.length >= 7) {
    formatted += '-' + value.substring(6, 10);
  }
  
  phoneInput.value = formatted;
}

// Add phone formatting when page loads
document.addEventListener('DOMContentLoaded', () => {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', formatPhoneNumber);
  });
  
  console.log('Phone formatting initialized');
});

// ============================================
// INITIALIZATION
// ============================================

console.log('Form handler script loaded');

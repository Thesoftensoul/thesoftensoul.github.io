// ============================================
// THE SOFTEN SOUL - FORM HANDLER (Client-Side)
// JavaScript for handling form submissions
// ============================================

// ============================================
// CONFIGURATION - YOUR WEB APP URL
// ============================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzoE5i7BO51jbUtHUm_FoB2sZCSd5LqTwhABe25JRGwpbBSHTXcT6aazdKBarOLaR6Q/exec';

// Rate limiting configuration (prevents spam)
const RATE_LIMIT_MS = 5000; // 5 seconds between submissions
let lastSubmissionTime = 0;

// ============================================
// CONTACT FORM INITIALIZATION
// ============================================

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check rate limit
    if (!checkRateLimit()) {
      showMessage('error', 'Please wait a moment before submitting again.');
      return;
    }

    // Check honeypot (spam prevention)
    if (form.querySelector('[name="honeypot"]').value !== '') {
      // Silent fail for bots
      console.log('Spam detected');
      return;
    }

    // Get form data
    const formData = {
      formType: 'contact',
      name: form.querySelector('#name').value.trim(),
      email: form.querySelector('#email').value.trim(),
      message: form.querySelector('#message').value.trim()
    };

    // Validate
    if (!validateContactForm(formData)) {
      return;
    }

    // Submit
    await submitForm(formData, form);
  });
}

// ============================================
// INTAKE FORM INITIALIZATION
// ============================================

function initIntakeForm() {
  const form = document.getElementById('intakeForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check rate limit
    if (!checkRateLimit()) {
      showMessage('error', 'Please wait a moment before submitting again.');
      return;
    }

    // Check honeypot (spam prevention)
    if (form.querySelector('[name="honeypot"]').value !== '') {
      // Silent fail for bots
      console.log('Spam detected');
      return;
    }

    // Check consent
    const consent = form.querySelector('#consent');
    if (!consent.checked) {
      showMessage('error', 'Please confirm your consent before submitting.');
      return;
    }

    // Get form data
    const formData = {
      formType: 'intake',
      name: form.querySelector('#name').value.trim(),
      email: form.querySelector('#email').value.trim(),
      phone: form.querySelector('#phone').value.trim(),
      serviceInterest: form.querySelector('#serviceInterest').value,
      bringsYouHere: form.querySelector('#bringsYouHere').value.trim(),
      hopeToAchieve: form.querySelector('#hopeToAchieve').value.trim(),
      biggestChallenge: form.querySelector('#biggestChallenge').value.trim(),
      startTimeline: form.querySelector('#startTimeline').value,
      bestTime: form.querySelector('#bestTime').value,
      contactMethod: form.querySelector('#contactMethod').value,
      howHeard: form.querySelector('#howHeard').value,
      notes: form.querySelector('#notes').value.trim()
    };

    // Validate
    if (!validateIntakeForm(formData)) {
      return;
    }

    // Submit
    await submitForm(formData, form);
  });
}

// ============================================
// FORM SUBMISSION
// ============================================

async function submitForm(formData, formElement) {
  const submitBtn = formElement.querySelector('#submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  try {
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';

    // Submit to Google Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    // With no-cors mode, we assume success if no error was thrown
    
  // Show success message
if (formData.formType === 'intake') {
  // Show special success message for intake form
  showIntakeSuccess();
  // Don't reset intake form - we hide it instead
} else {
  showMessage('success', 'Thank you for your message! We\'ll get back to you within 24-48 hours.');
  // Reset form for contact form only
  formElement.reset();
}
        // Update last submission time
    lastSubmissionTime = Date.now();

  } catch (error) {
    console.error('Form submission error:', error);
    showMessage('error', 'There was a problem submitting your form. Please try again or email us directly at contact@hello.theselfcaremethod.com');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateContactForm(data) {
  // Validate name
  if (!data.name || data.name.length < 2) {
    showMessage('error', 'Please enter your full name.');
    return false;
  }

  // Validate email
  if (!isValidEmail(data.email)) {
    showMessage('error', 'Please enter a valid email address.');
    return false;
  }

  // Validate message
  if (!data.message || data.message.length < 10) {
    showMessage('error', 'Please enter a message with at least 10 characters.');
    return false;
  }

  if (data.message.length > 1000) {
    showMessage('error', 'Message is too long. Please keep it under 1000 characters.');
    return false;
  }

  return true;
}

function validateIntakeForm(data) {
  // Validate name
  if (!data.name || data.name.length < 2) {
    showMessage('error', 'Please enter your full name.');
    return false;
  }

  // Validate email
  if (!isValidEmail(data.email)) {
    showMessage('error', 'Please enter a valid email address.');
    return false;
  }

  // Validate service interest
  if (!data.serviceInterest) {
    showMessage('error', 'Please select which service you\'re interested in.');
    return false;
  }

  // Validate brings you here
  if (!data.bringsYouHere || data.bringsYouHere.length < 10) {
    showMessage('error', 'Please tell us more about what brings you here (at least 10 characters).');
    return false;
  }

  // Validate hope to achieve
  if (!data.hopeToAchieve || data.hopeToAchieve.length < 10) {
    showMessage('error', 'Please tell us what you hope to achieve (at least 10 characters).');
    return false;
  }

  // Validate biggest challenge
  if (!data.biggestChallenge || data.biggestChallenge.length < 10) {
    showMessage('error', 'Please describe your biggest challenge (at least 10 characters).');
    return false;
  }

  // Validate start timeline
  if (!data.startTimeline) {
    showMessage('error', 'Please select when you\'d like to start.');
    return false;
  }

  // Validate best time
  if (!data.bestTime) {
    showMessage('error', 'Please select the best time to reach you.');
    return false;
  }

  // Validate contact method
  if (!data.contactMethod) {
    showMessage('error', 'Please select your preferred contact method.');
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// RATE LIMITING
// ============================================

function checkRateLimit() {
  const now = Date.now();
  const timeSinceLastSubmission = now - lastSubmissionTime;
  
  if (timeSinceLastSubmission < RATE_LIMIT_MS) {
    return false;
  }
  
  return true;
}

// ============================================
// MESSAGE DISPLAY
// ============================================

function showMessage(type, message) {
  const messageDiv = document.getElementById('formMessage');
  if (!messageDiv) return;

  messageDiv.textContent = message;
  messageDiv.className = `form-message ${type}`;
  messageDiv.style.display = 'block';

  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Hide error messages after 8 seconds
  if (type === 'error') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 8000);
  }
}

function showIntakeSuccess() {
  // Simple alert with calendar link
  alert('✅ Thank you! Your intake form has been submitted.\n\nClick OK to schedule your complimentary 15-minute discovery call.');
  
  // Redirect to calendar booking page
  window.location.href = 'https://calendar.app.google/CUCV2TQ1JRUPZQ4v9';
}
  console.log('showIntakeSuccess called');
  
  // Hide the form
  const formCard = document.querySelector('.form-card');
  const successMessage = document.getElementById('successMessage');
  
  console.log('formCard:', formCard);
  console.log('successMessage:', successMessage);
  
  if (formCard && successMessage) {
    formCard.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Then scroll to success message
    setTimeout(() => {
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  } else {
    console.error('Could not find form elements');
    alert('Thank you! Your intake form has been submitted. Please book your discovery call at: https://calendar.app.google/CUCV2TQ1JRUPZQ4v9');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format phone number as user types (US format)
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

// Add phone formatting to phone fields
document.addEventListener('DOMContentLoaded', () => {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', formatPhoneNumber);
  });
});

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

// Add aria-live region for screen readers
document.addEventListener('DOMContentLoaded', () => {
  const messageDiv = document.getElementById('formMessage');
  if (messageDiv) {
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
  }
});

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showMessage('error', 'An unexpected error occurred. Please try again.');
});

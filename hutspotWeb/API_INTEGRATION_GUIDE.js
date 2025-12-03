// API Integration Guide for Booking Module
// This file shows how to connect booking.js with the backend API

/**
 * STEP 1: Load Services from API
 * Replace the hardcoded availableServices with:
 */

// BEFORE (Demo with hardcoded data)
const availableServices = [
  { id: 'catering', name: 'Catering Service', price: 1500, description: 'Full meal service for guests' },
  // ... more services
];

// AFTER (With API call)
let availableServices = [];

async function loadServicesFromAPI() {
  try {
    const response = await fetch('/api/services');
    const data = await response.json();
    
    if (data.success) {
      availableServices = data.services.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        description: service.description
      }));
      loadServices();
    }
  } catch (error) {
    console.error('Error loading services:', error);
    alert('Failed to load services');
  }
}

// Call this in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  loadServicesFromAPI();
  loadVenuesFromAPI();
  loadReservedDatesFromAPI();
  initializeBookingListeners();
});

/**
 * STEP 2: Load Venues from API
 * Replace hardcoded venue pricing with:
 */

let venuePricing = {};

async function loadVenuesFromAPI() {
  try {
    const response = await fetch('/api/venues');
    const data = await response.json();
    
    if (data.success) {
      venuePricing = {};
      data.venues.forEach(venue => {
        venuePricing[venue.id] = {
          name: venue.name,
          pricePerHour: venue.price_per_hour,
          pricePerDay: venue.price_per_day,
          description: venue.description
        };
      });
      
      // Update venue dropdown
      updateVenueOptions();
    }
  } catch (error) {
    console.error('Error loading venues:', error);
  }
}

function updateVenueOptions() {
  const venueSelect = document.getElementById('venueId');
  venueSelect.innerHTML = '<option value="">Select Venue</option>';
  
  Object.entries(venuePricing).forEach(([id, venue]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${venue.name} - ₱${venue.pricePerDay}/day`;
    venueSelect.appendChild(option);
  });
}

/**
 * STEP 3: Load Reserved Dates from API
 * Replace the hardcoded reserved dates with:
 */

async function loadReservedDatesFromAPI() {
  try {
    const venueId = document.getElementById('venueId').value;
    if (!venueId) return;
    
    const response = await fetch(`/api/venues/availability/${venueId}`);
    const data = await response.json();
    
    if (data.success) {
      bookingState.reservedDates = data.reserved_dates
        .map(rd => rd.date)
        .filter(date => rd.status === 'booked');
    }
  } catch (error) {
    console.error('Error loading reserved dates:', error);
  }
}

/**
 * STEP 4: Update Venue Selection to Load Dates
 * Modify updateVenuePrice function:
 */

function updateVenuePrice() {
  loadReservedDatesFromAPI(); // Load dates when venue changes
  calculateTotal();
}

/**
 * STEP 5: Validate Promo Code with API
 * Replace the demo promo validation with:
 */

async function applyPromo() {
  const promoInput = document.getElementById('promoCode').value.trim();

  if (!promoInput) {
    alert('Please enter a promo code');
    return;
  }

  try {
    const pricing = calculateTotal();
    const response = await fetch('/api/promos/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: promoInput,
        amount: pricing.subtotal
      })
    });

    const data = await response.json();

    if (data.success) {
      bookingState.promoCode = promoInput;
      bookingState.promoDiscount = data.promo.discount_amount;
      calculateTotal();
      alert(`Promo code "${promoInput}" applied successfully!`);
    } else {
      alert(data.message || 'Invalid promo code');
      bookingState.promoCode = '';
      calculateTotal();
    }
  } catch (error) {
    console.error('Error validating promo:', error);
    alert('Error applying promo code');
  }
}

/**
 * STEP 6: Submit Booking to API
 * Replace the demo submission with:
 */

async function submitBooking() {
  const paymentProof = document.getElementById('paymentProof').files[0];

  if (!paymentProof) {
    alert('Please upload payment proof (GCash receipt)');
    return;
  }

  // Get user ID from session/localStorage
  const userId = localStorage.getItem('hutspot_user_id');
  if (!userId) {
    alert('Please login before booking');
    return;
  }

  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('event_type', bookingState.eventType);
  formData.append('event_date', bookingState.eventDate);
  formData.append('event_time', bookingState.eventTime);
  formData.append('venue_id', bookingState.venueId);
  formData.append('number_of_guests', bookingState.numberOfGuests);
  formData.append('special_request', bookingState.specialRequest);
  formData.append('services', JSON.stringify(bookingState.services));
  formData.append('promo_code', bookingState.promoCode);
  formData.append('attachment', paymentProof);

  try {
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('hutspot_token')}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert('Booking submitted successfully! Booking ID: ' + data.booking_id);
      
      // Create payment record
      await createPaymentRecord(data.booking_id);
      
      closeBookingModal();
      resetBookingForm();
    } else {
      alert('Booking failed: ' + data.message);
    }
  } catch (error) {
    console.error('Error submitting booking:', error);
    alert('Error submitting booking');
  }
}

/**
 * STEP 7: Create Payment Record
 * Call this after booking is created
 */

async function createPaymentRecord(bookingId) {
  const pricing = calculateTotal();
  const downPayment = pricing.downPayment;

  try {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('hutspot_token')}`
      },
      body: JSON.stringify({
        booking_id: bookingId,
        amount: pricing.total,
        down_payment: downPayment,
        payment_method: 'gcash'
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('Payment record created:', data.payment_id);
    }
  } catch (error) {
    console.error('Error creating payment record:', error);
  }
}

/**
 * STEP 8: Update Event Type Pricing from Database
 * If event types have varying prices:
 */

let eventTypePricing = {};

async function loadEventTypesFromAPI() {
  try {
    const response = await fetch('/api/event-types');
    const data = await response.json();
    
    if (data.success) {
      eventTypePricing = {};
      data.event_types.forEach(et => {
        eventTypePricing[et.id] = et.base_price;
      });
      
      // Update event type dropdown
      updateEventTypeOptions();
    }
  } catch (error) {
    console.error('Error loading event types:', error);
  }
}

function updateEventTypeOptions() {
  const eventTypeSelect = document.getElementById('eventType');
  const eventTypeOption = eventTypeSelect.querySelector('option[value=""]');
  
  Object.entries(eventTypePricing).forEach(([id, price]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${id.charAt(0).toUpperCase() + id.slice(1)} - ₱${price}`;
    eventTypeSelect.appendChild(option);
  });
}

/**
 * STEP 9: Handle Authentication
 * Ensure user is logged in before allowing booking:
 */

function openBookingModal() {
  const userId = localStorage.getItem('hutspot_user_id');
  
  if (!userId) {
    alert('Please login to make a booking');
    openUserAuthModal();
    return;
  }
  
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'block';
    resetBookingForm();
  }
}

/**
 * STEP 10: Store User Data After Login
 * In your auth module, after successful login:
 */

function userLogin() {
  const email = document.getElementById('userEmail').value.trim();
  const pass = document.getElementById('userPassword').value.trim();
  
  if (!email || !pass) return alert('Please enter email and password');

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('hutspot_user_id', data.user.id);
      localStorage.setItem('hutspot_token', data.token);
      localStorage.setItem('hutspot_user_email', data.user.email);
      alert('Logged in successfully');
      closeUserAuthModal();
    } else {
      alert('Login failed: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    alert('Login error');
  });
}

/**
 * COMPLETE INITIALIZATION WITH API
 * Updated DOMContentLoaded function:
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load all data from API
    await loadEventTypesFromAPI();
    await loadVenuesFromAPI();
    await loadServicesFromAPI();
    await loadReservedDatesFromAPI();
    
    // Initialize form
    initializeBookingListeners();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

/**
 * ERROR HANDLING WRAPPER
 * Wrap all API calls in error handling:
 */

async function apiCall(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('hutspot_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(endpoint, finalOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Usage:
async function loadServices() {
  try {
    const data = await apiCall('/api/services');
    // Process data...
  } catch (error) {
    alert('Failed to load services. Please refresh the page.');
  }
}

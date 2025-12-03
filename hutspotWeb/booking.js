/**
 * HutSpot Booking System - Dynamic Booking Form with Step-by-Step Flow
 */

// Global state for booking
const bookingState = {
  step: 1,
  eventPackage: '',
  eventType: '',
  eventDate: '',
  eventTime: '',
  venueId: '',
  numberOfGuests: 50,
  specialRequest: '',
  services: [],
  reservedDates: [],
  foodChoices: {
    pork: '',
    chicken: '',
    fish: '',
    beef: '',
    veggies: '',
    pasta: '',
    dessert: '',
    drinks: ''
  }
};

// Package pricing (per head for packages 1-3, fixed for packages 4-6)
const packagePricing = {
  'package-1': { name: 'Package 1 (Food + Venue)', pricePerHead: 400, minPax: 50, isPerHead: true, hasFood: true },
  'package-2': { name: 'Package 2 (Food + Venue)', pricePerHead: 450, minPax: 50, isPerHead: true, hasFood: true },
  'package-3': { name: 'Package 3 (Food + Venue)', pricePerHead: 500, minPax: 60, isPerHead: true, hasFood: true },
  'package-4': { name: 'Package 4 (Venue Only)', price: 16000, basePax: 100, excessPerHead: 40, isPerHead: false, hasFood: false },
  'package-5': { name: 'Package 5 (Venue + Single Room)', price: 19000, basePax: 100, excessPerHead: 40, isPerHead: false, hasFood: false },
  'package-6': { name: 'Package 6 (Venue + Family Room)', price: 22000, basePax: 100, excessPerHead: 40, isPerHead: false, hasFood: false }
};

// Event type pricing (additional fee based on event type)
const eventTypePricing = {
  birthday: 0,
  wedding: 0,
  corporate: 0,
  anniversary: 0,
  seminar: 0,
  other: 0
};

// Venue options (included in package, no extra charge)
const venuePricing = {
  'main-hall': { name: 'Main Hall (Ground Floor)', price: 0 },
  'second-floor': { name: 'Second Floor', price: 0 }
};

// Available add-ons (only for venue packages 4-6)
const availableAddons = [
  { id: 'videoke', name: 'Videoke', price: 500, description: 'Karaoke system with microphones' },
  { id: 'drinks-dispenser', name: 'Drinks Dispenser', price: 50, description: 'Beverage dispenser' },
  { id: 'soap-warmer', name: 'Electric Soap Warmer', price: 200, description: 'Soap warmer for chafing dishes' }
];

// Initialize booking system
document.addEventListener('DOMContentLoaded', () => {
  loadReservedDates();
  initializeBookingListeners();
});

// Initialize event listeners
function initializeBookingListeners() {
  const eventTypeSelect = document.getElementById('eventType');
  if (eventTypeSelect) {
    eventTypeSelect.addEventListener('change', function() {
      if (this.value === 'other') {
        document.getElementById('eventTypeOther').style.display = 'block';
      } else {
        document.getElementById('eventTypeOther').style.display = 'none';
      }
    });
  }
  
  // Payment proof preview
  const paymentProofInput = document.getElementById('paymentProof');
  if (paymentProofInput) {
    paymentProofInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const preview = document.getElementById('imagePreview');
          const previewImg = document.getElementById('previewImg');
          previewImg.src = event.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Toggle add-on selection (for venue packages only)
function toggleAddon(addonId, addonName, addonPrice) {
  const existingAddon = bookingState.services.find(s => s.id === addonId);
  const button = document.getElementById('btn' + addonId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''));
  
  if (existingAddon) {
    bookingState.services = bookingState.services.filter(s => s.id !== addonId);
    if (button) {
      button.textContent = 'Add';
      button.classList.remove('btn-selected');
    }
  } else {
    bookingState.services.push({
      id: addonId,
      name: addonName,
      price: addonPrice,
      quantity: 1
    });
    if (button) {
      button.textContent = 'Remove';
      button.classList.add('btn-selected');
    }
  }

  updateSelectedAddons();
  calculateTotal();
}

// Update selected add-ons display
function updateSelectedAddons() {
  const selectedAddonsDiv = document.getElementById('selectedAddons');
  
  if (bookingState.services.length === 0) {
    selectedAddonsDiv.innerHTML = '<p class="empty-message">No add-ons selected</p>';
    return;
  }

  selectedAddonsDiv.innerHTML = bookingState.services.map(addon => `
    <div class="selected-addon-item">
      <span class="addon-name">${addon.name}</span>
      <span class="addon-price">₱${addon.price.toLocaleString()}</span>
      <button class="btn-remove" onclick="toggleAddon('${addon.id}', '${addon.name}', ${addon.price})">✕</button>
    </div>
  `).join('');
}

// Show/hide add-ons section based on package selection
function updateAddOnsVisibility() {
  const packageSelect = document.getElementById('eventPackage');
  const addOnsSection = document.getElementById('addOnsSection');
  const noAddOnsMessage = document.getElementById('noAddOnsMessage');
  
  if (!packageSelect || !addOnsSection || !noAddOnsMessage) return;
  
  const selectedPackage = packageSelect.value;
  const isVenuePackage = ['package-4', 'package-5', 'package-6'].includes(selectedPackage);
  
  if (isVenuePackage) {
    addOnsSection.style.display = 'block';
    noAddOnsMessage.style.display = 'none';
  } else {
    addOnsSection.style.display = 'none';
    noAddOnsMessage.style.display = 'block';
    // Clear any selected add-ons when switching to food package
    bookingState.services = [];
    updateSelectedAddons();
    // Reset addon buttons
    ['btnVideoke', 'btnDrinksDispenser', 'btnSoapWarmer'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.textContent = 'Add';
        btn.classList.remove('btn-selected');
      }
    });
  }
}

// Step navigation
function goToStep(stepNumber) {
  // Validate current step before proceeding
  if (bookingState.step < stepNumber) {
    if (!validateCurrentStep()) {
      return;
    }
  }

  // Hide all steps
  document.querySelectorAll('.booking-step').forEach(step => {
    step.classList.remove('active');
  });
  document.querySelectorAll('.progress-step').forEach(step => {
    step.classList.remove('active');
  });

  // Show selected step
  document.getElementById(`bookingStep${stepNumber}`).classList.add('active');
  document.getElementById(`step${stepNumber}-progress`).classList.add('active');

  // Update state
  bookingState.step = stepNumber;

  // Update summary on step 3
  if (stepNumber === 3) {
    updateSummary();
    calculateTotal();
  }

  // Scroll to top of modal
  document.querySelector('.booking-modal-box').scrollTop = 0;
}

// Validate current step
function validateCurrentStep() {
  if (bookingState.step === 1) {
    const eventPackage = document.getElementById('eventPackage').value;
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const venueId = document.getElementById('venueId').value;

    if (!eventPackage) {
      showNotification('Validation Error', 'Please select a package');
      return false;
    }

    if (!eventType || !eventDate || !eventTime || !venueId) {
      showNotification('Validation Error', 'Please fill in all required fields');
      return false;
    }

    // Check if the date has an error message displayed
    const dateError = document.getElementById('dateError');
    if (dateError && dateError.textContent) {
      showNotification('Invalid Date', dateError.textContent);
      return false;
    }

    // Update state
    bookingState.eventPackage = eventPackage;
    bookingState.eventType = eventType;
    bookingState.eventDate = eventDate;
    bookingState.eventTime = eventTime;
    bookingState.venueId = venueId;
    bookingState.numberOfGuests = document.getElementById('numberOfGuests').value;
    bookingState.specialRequest = document.getElementById('specialRequest').value;

    return true;
  }

  return true;
}

// Validate date (check for conflicts)
function validateDate() {
  const dateInput = document.getElementById('eventDate');
  const dateError = document.getElementById('dateError');

  if (!dateInput || !dateInput.value) {
    if (dateError) dateError.textContent = '';
    return true;
  }

  const dateValue = dateInput.value;
  const selectedDate = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  // Check if date is in the past
  if (selectedDate < today) {
    if (dateError) dateError.textContent = 'Cannot book dates in the past';
    return false;
  }

  // Check if date is reserved
  if (bookingState.reservedDates && bookingState.reservedDates.includes(dateValue)) {
    if (dateError) dateError.textContent = 'This date is already reserved';
    return false;
  }

  if (dateError) dateError.textContent = '';
  return true;
}

// Load reserved dates from database
function loadReservedDates() {
  try {
    // Load bookings from localStorage
    const bookingsData = localStorage.getItem('hutspot_bookings');
    if (bookingsData) {
      const bookings = JSON.parse(bookingsData);
      // Get dates of confirmed bookings
      bookingState.reservedDates = bookings
        .filter(b => b.status === 'confirmed')
        .map(b => b.eventDate);
    } else {
      // Sample reserved dates for demo
      bookingState.reservedDates = [
        '2025-12-20',
        '2025-12-25',
        '2026-01-15'
      ];
    }
    console.log('Reserved dates loaded:', bookingState.reservedDates);
  } catch (error) {
    console.error('Error loading reserved dates:', error);
    bookingState.reservedDates = [];
  }
}

// Update event type price
function updateEventTypePrice() {
  const eventType = document.getElementById('eventType').value;
  calculateTotal();
}

// Update venue price
function updateVenuePrice() {
  calculateTotal();
}

// Update package price when selected
function updatePackagePrice() {
  const packageSelect = document.getElementById('eventPackage');
  const guestsInput = document.getElementById('numberOfGuests');
  const minPaxNote = document.getElementById('minPaxNote');
  const foodSection = document.getElementById('foodSelectionSection');
  const fishSection = document.getElementById('fishSection');
  const beefSection = document.getElementById('beefSection');
  const cordonBleuOption = document.getElementById('cordonBleuOption');
  const cornCarrotsOption = document.getElementById('cornCarrotsOption');
  
  if (packageSelect && packageSelect.value && packagePricing[packageSelect.value]) {
    const pkg = packagePricing[packageSelect.value];
    bookingState.eventPackage = packageSelect.value;
    
    // Set minimum guests based on package
    if (guestsInput) {
      if (pkg.isPerHead) {
        // Food packages have minimum pax
        guestsInput.min = pkg.minPax;
        if (parseInt(guestsInput.value) < pkg.minPax) {
          guestsInput.value = pkg.minPax;
        }
      } else {
        // Venue packages have base pax (can go over with excess fee)
        guestsInput.min = 1;
      }
    }
    
    // Update min pax note
    if (minPaxNote) {
      if (pkg.isPerHead) {
        minPaxNote.textContent = `Minimum ${pkg.minPax} guests for selected package`;
      } else {
        minPaxNote.textContent = `Base ${pkg.basePax} pax included (₱${pkg.excessPerHead}/head for excess guests)`;
      }
    }
    
    // Show/hide food selection section for packages 1-3 (food packages)
    if (foodSection) {
      if (pkg.hasFood) {
        foodSection.style.display = 'block';
        
        // Show/hide fish section (Package 2 only)
        if (fishSection) {
          fishSection.style.display = packageSelect.value === 'package-2' ? 'block' : 'none';
        }
        
        // Show/hide beef section and cordon bleu (Package 3 only)
        if (beefSection) {
          beefSection.style.display = packageSelect.value === 'package-3' ? 'block' : 'none';
        }
        if (cordonBleuOption) {
          cordonBleuOption.style.display = packageSelect.value === 'package-3' ? 'block' : 'none';
        }
        
        // Show corn and carrots option for packages 2 and 3
        if (cornCarrotsOption) {
          cornCarrotsOption.style.display = ['package-2', 'package-3'].includes(packageSelect.value) ? 'block' : 'none';
        }
      } else {
        // Venue-only packages (4-6) don't have food selection
        foodSection.style.display = 'none';
      }
    }
  }
  // Update add-ons visibility based on package selection
  updateAddOnsVisibility();
  calculateTotal();
}

// Calculate total amount dynamically
function calculateTotal() {
  const eventPackage = document.getElementById('eventPackage')?.value || '';
  const eventType = document.getElementById('eventType').value;
  const venueId = document.getElementById('venueId').value;
  const numberOfGuests = parseInt(document.getElementById('numberOfGuests').value) || 50;

  // Get package price (per head or fixed, with excess calculation for venue packages)
  let packagePrice = 0;
  let excessPaxFee = 0;
  if (eventPackage && packagePricing[eventPackage]) {
    const pkg = packagePricing[eventPackage];
    if (pkg.isPerHead) {
      // Food packages: price per head
      packagePrice = pkg.pricePerHead * numberOfGuests;
    } else {
      // Venue packages: fixed price + excess pax fee
      packagePrice = pkg.price;
      // Calculate excess pax if guests exceed base capacity
      if (pkg.basePax && pkg.excessPerHead && numberOfGuests > pkg.basePax) {
        const excessGuests = numberOfGuests - pkg.basePax;
        excessPaxFee = excessGuests * pkg.excessPerHead;
      }
    }
  }

  // Get additional fee for event type
  let eventTypeFee = eventTypePricing[eventType] || 0;

  // Venue is included in all packages, no extra charge
  let venuePrice = 0;

  // Calculate services total (add-ons)
  const servicesTotal = bookingState.services.reduce((sum, service) => {
    return sum + (service.price * service.quantity);
  }, 0);

  // Subtotal (package + excess pax + event type + add-ons)
  const subtotal = packagePrice + excessPaxFee + eventTypeFee + servicesTotal;

  // Final total
  const total = subtotal;

  // Down payment (50%)
  const downPayment = total * 0.5;
  const balance = total - downPayment;

  // Update display
  updatePricingDisplay(packagePrice, servicesTotal, subtotal, total, downPayment, balance);

  return {
    packagePrice,
    eventTypeFee,
    venuePrice,
    servicesTotal,
    subtotal,
    total,
    downPayment,
    balance
  };
}

// Update pricing display
function updatePricingDisplay(packagePrice, servicesTotal, subtotal, total, downPayment, balance) {
  const formatPrice = (price) => '₱' + Math.round(price).toLocaleString();

  const packagePriceEl = document.getElementById('packagePriceDisplay');
  if (packagePriceEl) packagePriceEl.textContent = formatPrice(packagePrice);
  
  document.getElementById('servicesTotalDisplay').textContent = formatPrice(servicesTotal);
  document.getElementById('subtotalDisplay').textContent = formatPrice(subtotal);
  document.getElementById('totalAmountDisplay').textContent = formatPrice(total);
  document.getElementById('downPaymentDisplay').textContent = formatPrice(downPayment);
  document.getElementById('balanceDisplay').textContent = formatPrice(balance);

  // Update GCash amount display
  const gcashAmountElement = document.getElementById('gcashAmount');
  if (gcashAmountElement) {
    gcashAmountElement.textContent = formatPrice(downPayment);
  }
}


// Collect food choices
function collectFoodChoices() {
  const eventPackage = document.getElementById('eventPackage')?.value || '';
  
  if (['package-1', 'package-2', 'package-3'].includes(eventPackage)) {
    bookingState.foodChoices = {
      pork: document.getElementById('porkChoice')?.value || '',
      chicken: document.getElementById('chickenChoice')?.value || '',
      fish: eventPackage === 'package-2' ? (document.getElementById('fishChoice')?.value || '') : '',
      beef: eventPackage === 'package-3' ? (document.getElementById('beefChoice')?.value || '') : '',
      veggies: document.getElementById('veggiesChoice')?.value || '',
      pasta: document.getElementById('pastaChoice')?.value || '',
      dessert: document.getElementById('dessertChoice')?.value || '',
      drinks: document.getElementById('drinksChoice')?.value || ''
    };
  }
  return bookingState.foodChoices;
}

// Update summary on step 3
function updateSummary() {
  const eventPackage = document.getElementById('eventPackage')?.value || '';
  const eventType = document.getElementById('eventType').value;
  const eventDate = document.getElementById('eventDate').value;
  const eventTime = document.getElementById('eventTime').value;
  const venueId = document.getElementById('venueId').value;
  const numberOfGuests = document.getElementById('numberOfGuests').value;

  const pkg = packagePricing[eventPackage];
  const packageName = pkg?.name || 'N/A';
  let packagePriceText = 'N/A';
  
  if (pkg) {
    if (pkg.isPerHead) {
      const total = pkg.pricePerHead * parseInt(numberOfGuests);
      packagePriceText = `₱${pkg.pricePerHead}/head x ${numberOfGuests} = ₱${total.toLocaleString()}`;
    } else {
      packagePriceText = `₱${pkg.price.toLocaleString()}`;
    }
  }
  
  const venueName = venuePricing[venueId]?.name || 'Included in package';

  // Format date
  const dateObj = new Date(eventDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const summaryPackageEl = document.getElementById('summaryPackage');
  if (summaryPackageEl) {
    summaryPackageEl.textContent = `${packageName} - ${packagePriceText}`;
  }
  document.getElementById('summaryEventType').textContent = eventType.charAt(0).toUpperCase() + eventType.slice(1);
  document.getElementById('summaryDateTime').textContent = `${formattedDate} at ${eventTime}`;
  document.getElementById('summaryVenue').textContent = venueName;
  document.getElementById('summaryGuests').textContent = numberOfGuests;
  
  // Collect and display food choices
  collectFoodChoices();
}

// Submit booking
function submitBooking() {
  // Double-check authentication
  if (!isUserLoggedIn()) {
    showNotification('Login Required', 'Your session has expired. Please login again.');
    closeBookingModal();
    setTimeout(() => {
      openUserAuthModal();
    }, 500);
    return;
  }
  
  const paymentProof = document.getElementById('paymentProof').files[0];

  if (!paymentProof) {
    showNotification('Payment Upload', 'Please upload payment proof (GCash receipt)');
    return;
  }

  // Validate file type
  if (!paymentProof.type.startsWith('image/')) {
    showNotification('Invalid File', 'Please upload an image file (JPG, PNG, etc.)');
    return;
  }

  // Convert image to base64 for storage
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;
    processBookingWithImage(imageData, paymentProof.name);
  };
  reader.onerror = function() {
    showNotification('Error', 'Failed to read payment proof image. Please try again.');
  };
  reader.readAsDataURL(paymentProof);
}

function processBookingWithImage(imageData, fileName) {
  // Calculate pricing
  const pricing = calculateTotal();

  // Get package and venue names
  const eventPackage = document.getElementById('eventPackage')?.value || '';
  const pkg = packagePricing[eventPackage];
  const packageName = pkg?.name || 'N/A';
  const numberOfGuests = parseInt(document.getElementById('numberOfGuests').value) || 50;
  
  // Calculate package price based on type
  let packagePrice = 0;
  if (pkg) {
    packagePrice = pkg.isPerHead ? (pkg.pricePerHead * numberOfGuests) : pkg.price;
  }
  
  const venueName = venuePricing[bookingState.venueId]?.name || 'Included in package';

  // Collect food choices
  collectFoodChoices();

  // Get customer info from logged-in user
  const user = getCurrentUser();
  if (!user) {
    showNotification('Error', 'Unable to retrieve user information. Please login again.');
    return;
  }

  const customerName = `${user.firstName} ${user.lastName}`;
  const customerEmail = user.email;
  const customerPhone = user.mobile;

  // Debug: Check if image data exists
  console.log('Payment proof image data length:', imageData ? imageData.length : 0);
  console.log('Payment proof filename:', fileName);

  // Create booking object
  const bookingId = 'BK' + Date.now();
  const newBooking = {
    id: bookingId,
    customerName: customerName,
    email: customerEmail,
    phone: customerPhone,
    eventPackage: eventPackage,
    packageName: packageName,
    packagePrice: packagePrice,
    pricePerHead: pkg?.isPerHead ? pkg.pricePerHead : null,
    eventType: bookingState.eventType,
    eventDate: bookingState.eventDate,
    eventTime: bookingState.eventTime,
    venueId: bookingState.venueId,
    venueName: venueName,
    numberOfGuests: numberOfGuests,
    foodChoices: bookingState.foodChoices,
    specialRequest: bookingState.specialRequest,
    services: bookingState.services.map(s => s.name),
    servicesDetails: bookingState.services,
    totalAmount: pricing.total,
    downPayment: pricing.downPayment,
    balance: pricing.balance,
    status: 'pending',
    paymentProof: fileName,
    paymentProofImage: imageData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Save to localStorage
  try {
    const existingBookings = JSON.parse(localStorage.getItem('hutspot_bookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('hutspot_bookings', JSON.stringify(existingBookings));
    // Create payment record
    const paymentId = 'PAY' + Date.now();
    const newPayment = {
      id: paymentId,
      bookingId: bookingId,
      amount: pricing.total,
      downPayment: pricing.downPayment,
      remainingBalance: pricing.balance,
      paymentMethod: 'GCash',
      paymentProof: fileName,
      paymentProofImage: imageData,
      status: 'pending',
      paymentDate: null,
      createdAt: new Date().toISOString()
    };

    const existingPayments = JSON.parse(localStorage.getItem('hutspot_payments') || '[]');
    existingPayments.push(newPayment);
    localStorage.setItem('hutspot_payments', JSON.stringify(existingPayments));

    console.log('Booking submitted:', newBooking);
    console.log('Payment record created:', newPayment);
    
    showNotification('Success', 'Booking submitted successfully! Booking ID: ' + bookingId + '. Our admin team will review and confirm your booking.');
    closeBookingModal();
    resetBookingForm();
  } catch (error) {
    console.error('Error saving booking:', error);
    showNotification('Error', 'Failed to save booking. Please try again.');
  }
}

// Reset booking form
function resetBookingForm() {
  bookingState.step = 1;
  bookingState.eventPackage = '';
  bookingState.eventType = '';
  bookingState.eventDate = '';
  bookingState.eventTime = '';
  bookingState.venueId = '';
  bookingState.numberOfGuests = 50;
  bookingState.specialRequest = '';
  bookingState.services = [];
  bookingState.foodChoices = {};

  // Clear form inputs
  document.getElementById('eventPackage').value = '';
  document.getElementById('eventType').value = '';
  document.getElementById('eventDate').value = '';
  document.getElementById('eventTime').value = '';
  document.getElementById('venueId').value = '';
  document.getElementById('numberOfGuests').value = 50;
  document.getElementById('specialRequest').value = '';
  document.getElementById('paymentProof').value = '';
  document.getElementById('eventTypeOther').style.display = 'none';
  document.getElementById('dateError').textContent = '';
  
  // Hide food selection section
  const foodSection = document.getElementById('foodSelectionSection');
  if (foodSection) foodSection.style.display = 'none';
  
  // Clear image preview
  const imagePreview = document.getElementById('imagePreview');
  if (imagePreview) {
    imagePreview.style.display = 'none';
    document.getElementById('previewImg').src = '';
  }

  // Reset add-ons
  updateSelectedAddons();
  // Reset addon buttons
  ['btnVideoke', 'btnDrinksDispenser', 'btnSoapWarmer'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.textContent = 'Add';
      btn.classList.remove('btn-selected');
    }
  });
  
  calculateTotal();

  // Reset to step 1
  goToStep(1);
}

// Open booking modal
function openBookingModal() {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    sessionStorage.setItem('attemptedBooking', 'true');
    showNotification('Login Required', 'Please login or create an account to make a booking.', () => {
      // Only open login modal after user clicks OK
      openUserAuthModal();
    });
    return;
  }
  
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'block';
    resetBookingForm();
  }
}

// Check if user is logged in (should match script.js)
function isUserLoggedIn() {
  return localStorage.getItem('hutspot_user_logged_in') === 'true';
}

// Get current user (should match script.js)
function getCurrentUser() {
  if (!isUserLoggedIn()) return null;
  try {
    return JSON.parse(localStorage.getItem('hutspot_current_user') || '{}');
  } catch (e) {
    return null;
  }
}

// Close booking modal
function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Expose functions to global scope
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.goToStep = goToStep;
window.validateDate = validateDate;
window.updateEventTypePrice = updateEventTypePrice;
window.updateVenuePrice = updateVenuePrice;
window.toggleAddon = toggleAddon;
window.submitBooking = submitBooking;

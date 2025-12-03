/**
 * HutSpot Admin Dashboard - Complete Management System
 */

/* ===== NOTIFICATION SYSTEM ===== */
let confirmCallback = null;

function showNotification(title, message) {
  document.getElementById('notificationTitle').textContent = title;
  document.getElementById('notificationMessage').textContent = message;
  const modal = document.getElementById('notificationModal');
  modal.classList.add('active');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeNotificationModal() {
  const modal = document.getElementById('notificationModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function showConfirmation(title, message, callback) {
  document.getElementById('confirmationTitle').textContent = title;
  document.getElementById('confirmationMessage').textContent = message;
  confirmCallback = callback;
  const modal = document.getElementById('confirmationModal');
  modal.classList.add('active');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeConfirmationModal() {
  const modal = document.getElementById('confirmationModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  confirmCallback = null;
}

function executeConfirmation() {
  if(confirmCallback) confirmCallback();
  closeConfirmationModal();
}

/* ===== IMAGE VIEWER MODAL ===== */
function openImageModal(imageSrc, fileName) {
  const modal = document.getElementById('imageViewerModal');
  const img = document.getElementById('imageViewerImg');
  const fileNameElem = document.getElementById('imageViewerFileName');
  
  img.src = imageSrc;
  fileNameElem.textContent = fileName || 'Payment Proof';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  const modal = document.getElementById('imageViewerModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/* ===== ADMIN LOGIN SYSTEM ===== */
function handleAdminLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  
  // Validate credentials
  if(username === 'admin' && password === 'password123') {
    // Authentication successful
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminUsername', username);
    
    // Hide login page and show dashboard
    document.getElementById('adminLoginPage').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    
    // Initialize dashboard
    initializeAdminDashboard();
    
    // Show welcome notification
    showNotification('Login Successful', 'Welcome back, ' + username + '!');
  } else {
    // Authentication failed
    showNotification('Login Failed', 'Invalid username or password. Demo credentials: admin / password123');
  }
}

function checkAdminAuth() {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  if(isAuthenticated) {
    // User already logged in
    document.getElementById('adminLoginPage').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    initializeAdminDashboard();
  } else {
    // Show login page
    document.getElementById('adminLoginPage').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
  }
}

function handleAdminLogout() {
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('adminUsername');
  
  // Hide dashboard and show login page
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLoginPage').style.display = 'flex';
  
  // Clear form
  document.getElementById('adminLoginForm').reset();
  
  // Show logout notification
  showNotification('Logged Out', 'You have been successfully logged out.');
}

function closeAdminLogin() {
  // Navigate back to main site
  window.location.href = 'index.html';
}

/* ===== FORGOT PASSWORD SYSTEM ===== */
function showForgotPasswordForm(event) {
  event.preventDefault();
  document.getElementById('adminLoginPage').style.display = 'none';
  document.getElementById('forgotPasswordPage').style.display = 'flex';
}

function backToLogin(event) {
  event.preventDefault();
  document.getElementById('adminLoginPage').style.display = 'flex';
  document.getElementById('forgotPasswordPage').style.display = 'none';
  document.getElementById('resetConfirmationPage').style.display = 'none';
  document.getElementById('adminLoginForm').reset();
  document.getElementById('forgotPasswordForm').reset();
}

function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = document.getElementById('resetEmail').value;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('Invalid Email', 'Please enter a valid email address.');
    return;
  }
  
  // Demo validation - in production, this would call a backend API
  const adminEmail = 'admin@hutspot.com'; // Default admin email
  
  if (email.toLowerCase() === adminEmail.toLowerCase() || email === 'admin@example.com') {
    // Simulate sending reset email
    console.log('Password reset email would be sent to:', email);
    
    // Show confirmation page
    document.getElementById('forgotPasswordPage').style.display = 'none';
    document.getElementById('resetConfirmationPage').style.display = 'flex';
    
    // Store reset email for verification (in production, use backend session)
    localStorage.setItem('resetEmail', email);
    localStorage.setItem('resetToken', 'demo_token_' + Date.now());
    
    // Auto-reset after 5 seconds for demo purposes
    setTimeout(() => {
      if (document.getElementById('resetConfirmationPage').style.display === 'flex') {
        console.log('Demo: Automatically returning to login page');
      }
    }, 5000);
  } else {
    showNotification('Email Not Found', 'No account found with this email address. Try admin@hutspot.com for demo.');
  }
}

// Demo: Auto-login with reset token (for demo purposes after email reset)
function resetPasswordWithToken(token, newPassword) {
  const resetEmail = localStorage.getItem('resetEmail');
  
  // In production, this would validate token and update password on backend
  if (token && resetEmail) {
    // For demo: Reset to default password
    localStorage.removeItem('resetToken');
    localStorage.removeItem('resetEmail');
    
    showNotification('Password Reset', 'Your password has been reset. Please log in with your new password.');
    backToLogin({preventDefault: () => {}});
    
    return true;
  }
  
  return false;
}

/* ===== PASSWORD VISIBILITY TOGGLE ===== */
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const button = event.target;
  
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🙈';
  } else {
    input.type = 'password';
    button.textContent = '👁️';
  }
}

// Demo Data Storage (Data will come from localStorage)
const adminData = {
  bookings: [],
  payments: [],
  services: [
    { id: 'SRV001', name: 'Catering Service', price: 1500, category: 'Food', description: 'Full meal service' },
    { id: 'SRV002', name: 'Photography', price: 2500, category: 'Media', description: '4 hours coverage' },
    { id: 'SRV003', name: 'Videography', price: 3500, category: 'Media', description: '4 hours coverage' },
    { id: 'SRV004', name: 'Sound System', price: 1200, category: 'Audio', description: 'DJ included' },
    { id: 'SRV005', name: 'Decoration', price: 800, category: 'Setup', description: 'Professional setup' }
  ],
  venues: [
    { id: 'VN001', name: 'Main Hall (Ground Floor)', capacity: 200, amenities: 'AC, Sound System, Tables & Chairs' },
    { id: 'VN002', name: 'Second Floor', capacity: 150, amenities: 'AC, Sound System, Tables & Chairs' }
  ],
  reservedDates: []
};

// Load data from localStorage
function loadDataFromStorage() {
  try {
    // Load bookings
    const bookingsData = localStorage.getItem('hutspot_bookings');
    if (bookingsData) {
      const rawBookings = JSON.parse(bookingsData);
      // Remove duplicates by booking ID
      const uniqueBookings = [];
      const seenIds = new Set();
      for (const booking of rawBookings) {
        if (!seenIds.has(booking.id)) {
          seenIds.add(booking.id);
          uniqueBookings.push(booking);
        }
      }
      adminData.bookings = uniqueBookings;
      
      // Save cleaned data back if duplicates were found
      if (rawBookings.length !== uniqueBookings.length) {
        console.log('Removed', rawBookings.length - uniqueBookings.length, 'duplicate bookings');
        localStorage.setItem('hutspot_bookings', JSON.stringify(uniqueBookings));
      }
    }

    // Load payments
    const paymentsData = localStorage.getItem('hutspot_payments');
    if (paymentsData) {
      const rawPayments = JSON.parse(paymentsData);
      // Remove duplicates by payment ID
      const uniquePayments = [];
      const seenPaymentIds = new Set();
      for (const payment of rawPayments) {
        if (!seenPaymentIds.has(payment.id)) {
          seenPaymentIds.add(payment.id);
          uniquePayments.push(payment);
        }
      }
      adminData.payments = uniquePayments;
      
      // Save cleaned data back if duplicates were found
      if (rawPayments.length !== uniquePayments.length) {
        console.log('Removed', rawPayments.length - uniquePayments.length, 'duplicate payments');
        localStorage.setItem('hutspot_payments', JSON.stringify(uniquePayments));
      }
    }

    // Extract reserved dates from bookings
    adminData.reservedDates = adminData.bookings
      .filter(b => b.status === 'confirmed')
      .map(b => b.eventDate);

    console.log('Loaded bookings:', adminData.bookings.length);
    console.log('Loaded payments:', adminData.payments.length);
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
}

// Save bookings back to localStorage
function saveBookingsToStorage() {
  try {
    localStorage.setItem('hutspot_bookings', JSON.stringify(adminData.bookings));
    console.log('Bookings saved to localStorage');
  } catch (error) {
    console.error('Error saving bookings:', error);
  }
}

// Save payments back to localStorage
function savePaymentsToStorage() {
  try {
    localStorage.setItem('hutspot_payments', JSON.stringify(adminData.payments));
    console.log('Payments saved to localStorage');
  } catch (error) {
    console.error('Error saving payments:', error);
  }
}

// Current View
let currentPage = 'dashboard';
let currentMonth = new Date();
let currentBookingId = null;
let currentPaymentId = null;
let currentEditServiceId = null;
let currentEditVenueId = null;

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});

function initializeAdminDashboard() {
  // Set admin name
  document.getElementById('adminName').textContent = 'Admin User';

  // Bind menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Close modals on background click
  document.getElementById('notificationModal')?.addEventListener('click', function(e) {
    if(e.target === this) closeNotificationModal();
  });
  document.getElementById('confirmationModal')?.addEventListener('click', function(e) {
    if(e.target === this) closeConfirmationModal();
  });

  // Close data modals on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  });

  // Load data from localStorage
  loadDataFromStorage();

  // Load initial data
  loadDashboardData();
}

// Page Navigation
function showAdminPage(page) {
  // Hide all pages
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));

  // Show selected page
  const pageElement = document.getElementById(page + 'Page');
  if (pageElement) {
    pageElement.classList.add('active');
  }

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    bookings: 'Bookings Management',
    payments: 'Payment Management',
    services: 'Services Management',
    venues: 'Venues Management',
    calendar: 'Venue Availability',
    reports: 'Reports & Analytics'
  };

  document.getElementById('pageTitle').textContent = titles[page] || page;
  currentPage = page;

  // Reload data from storage to ensure fresh data
  loadDataFromStorage();

  // Load page-specific data
  if (page === 'dashboard') loadDashboardData();
  if (page === 'bookings') loadBookingsTable();
  if (page === 'payments') loadPaymentsTable();
  if (page === 'services') loadServicesGrid();
  if (page === 'venues') loadVenuesGrid();
  if (page === 'calendar') generateCalendar();
  
  // Update notification badges
  updateNotificationBadges();

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const burgerMenu = document.getElementById('burgerMenuAdmin');
    
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      burgerMenu.classList.remove('active');
    }
  }
}

// ===== DASHBOARD PAGE =====
function loadDashboardData() {
  // Reload data from storage first to get latest
  loadDataFromStorage();
  
  // Calculate stats
  const totalBookings = adminData.bookings.length;
  const confirmedBookings = adminData.bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = adminData.bookings.filter(b => b.status === 'pending').length;
  const totalRevenue = adminData.payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCustomers = new Set(adminData.bookings.map(b => b.email)).size;

  // Update stat cards
  document.getElementById('totalBookings').textContent = totalBookings;
  document.getElementById('confirmedBookings').textContent = confirmedBookings;
  document.getElementById('totalRevenue').textContent = '₱' + totalRevenue.toLocaleString();
  document.getElementById('totalCustomers').textContent = totalCustomers;

  // Update notification badge for pending bookings
  updateNotificationBadges();

  // Load recent bookings
  const recentList = document.getElementById('recentBookingsList');
  const recentBookings = adminData.bookings.slice(-5).reverse(); // Get last 5, most recent first
  
  if (recentBookings.length === 0) {
    recentList.innerHTML = '<div class="activity-item"><p style="text-align: center; color: #999;">No bookings yet. Waiting for customers to book events.</p></div>';
  } else {
    recentList.innerHTML = recentBookings.map(booking => `
      <div class="activity-item">
        <div class="activity-info">
          <div class="activity-customer">${booking.customerName}</div>
          <div class="activity-details">${booking.eventType.toUpperCase()} • ${booking.numberOfGuests} guests • ${booking.venueName}</div>
        </div>
        <div>
          <span class="status-badge status-${booking.status}">${booking.status}</span>
          <div class="activity-date">${booking.eventDate}</div>
        </div>
      </div>
    `).join('');
  }
}

// Update notification badges across all menu items
function updateNotificationBadges() {
  const pendingBookings = adminData.bookings.filter(b => b.status === 'pending').length;
  const pendingPayments = adminData.payments.filter(p => p.status === 'pending').length;
  const totalPending = pendingBookings + pendingPayments;
  
  // Update bookings badge
  updateMenuBadge('bookings', pendingBookings);
  
  // Update payments badge  
  updateMenuBadge('payments', pendingPayments);
  
  // Update header notification count
  const notifCount = document.getElementById('notifCount');
  if (notifCount) {
    notifCount.textContent = totalPending > 0 ? totalPending : '';
  }
}

// Helper function to update menu badge
function updateMenuBadge(menuName, count) {
  const menuItem = document.querySelector(`.menu-item[onclick*="${menuName}"]`);
  if (menuItem) {
    let badge = menuItem.querySelector('.notification-badge');
    
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.style.cssText = 'background: #f44336; color: white; border-radius: 50%; padding: 2px 6px; font-size: 11px; margin-left: 5px; font-weight: bold;';
        menuItem.appendChild(badge);
      }
      badge.textContent = count;
    } else {
      if (badge) {
        badge.remove();
      }
    }
  }
}

// ===== BOOKINGS PAGE =====
function loadBookingsTable() {
  // Reload data from storage to ensure fresh data
  loadDataFromStorage();
  
  console.log('loadBookingsTable called - Total bookings in adminData:', adminData.bookings.length);
  console.log('Bookings data:', adminData.bookings);
  
  const tableBody = document.getElementById('bookingsTableBody');
  if (!tableBody) {
    console.error('bookingsTableBody not found');
    return;
  }
  
  const filtered = filterBookingsList();
  
  console.log('Filtered bookings:', filtered.length);

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
          <p style="font-size: 16px; margin-bottom: 10px;">📋 No bookings found</p>
          <p style="font-size: 14px;">Total bookings in system: ${adminData.bookings.length}</p>
          <p style="font-size: 12px; color: #666;">${adminData.bookings.length === 0 ? 'Waiting for customers to book events.' : 'Check the filter settings above.'}</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(booking => {
    const hasPaymentProof = booking.paymentProofImage ? '✅' : '⚠️';
    const paymentProofTitle = booking.paymentProofImage ? 'Payment proof uploaded' : 'No payment proof';
    const packageDisplay = booking.packageName || booking.package || booking.eventPackage || 'N/A';
    const venueDisplay = booking.venueName || booking.venue || 'N/A';
    const eventTypeDisplay = (booking.eventType || 'N/A').toUpperCase();
    const totalAmount = booking.totalAmount || 0;
    
    return `
    <tr>
      <td><strong>${booking.id || 'N/A'}</strong></td>
      <td>${booking.customerName || 'Unknown'}<br><small>${booking.email || ''}</small></td>
      <td>${eventTypeDisplay}</td>
      <td>${booking.eventDate || 'N/A'}<br>${booking.eventTime || ''}</td>
      <td>${venueDisplay}</td>
      <td>${booking.numberOfGuests || 0}</td>
      <td>₱${totalAmount.toLocaleString()}</td>
      <td><span class="status-badge status-${booking.status || 'pending'}">${booking.status || 'pending'}</span> <span title="${paymentProofTitle}">${hasPaymentProof}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-small btn-view" onclick="viewBookingDetails('${booking.id}')">View</button>
          <button class="btn-small btn-edit" onclick="editBooking('${booking.id}')">Edit</button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

function filterBookingsList() {
  let filtered = [...adminData.bookings];
  
  console.log('Starting filter with', filtered.length, 'bookings');

  // Apply search filter first
  filtered = searchBookings(filtered);

  const statusFilter = document.getElementById('statusFilter')?.value;
  const dateFilter = document.getElementById('dateFilter')?.value;
  const eventTypeFilter = document.getElementById('eventTypeFilter')?.value;
  
  console.log('Filters - Status:', statusFilter, 'Date:', dateFilter, 'EventType:', eventTypeFilter);

  if (statusFilter) {
    filtered = filtered.filter(b => b.status === statusFilter);
    console.log('After status filter:', filtered.length);
  }
  if (dateFilter) {
    filtered = filtered.filter(b => b.eventDate === dateFilter);
    console.log('After date filter:', filtered.length);
  }
  if (eventTypeFilter) {
    filtered = filtered.filter(b => b.eventType === eventTypeFilter);
    console.log('After event type filter:', filtered.length);
  }

  return filtered;
}

function filterBookings() {
  loadBookingsTable();
}

function viewBookingDetails(bookingId) {
  currentBookingId = bookingId;
  const booking = adminData.bookings.find(b => b.id === bookingId);

  if (!booking) return;

  // Debug: Log booking data
  console.log('Viewing booking:', bookingId);
  console.log('Has paymentProofImage:', !!booking.paymentProofImage);
  console.log('Has paymentProof:', !!booking.paymentProof);
  if (booking.paymentProofImage) {
    console.log('Image data length:', booking.paymentProofImage.length);
  }

  const detailsDiv = document.getElementById('bookingDetails');
  
  // Payment proof image section
  let paymentProofHTML = '';
  if (booking.paymentProofImage) {
    paymentProofHTML = `
      <div style="margin-bottom: 20px;">
        <h3>Payment Proof (GCash Receipt)</h3>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; text-align: center;">
          <img src="${booking.paymentProofImage}" alt="Payment Proof" 
               style="max-width: 100%; max-height: 500px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer;"
               onclick="openImageModal('${booking.paymentProofImage}', '${booking.paymentProof}')">
          <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">${booking.paymentProof}</p>
          <p style="color: #888; font-size: 0.85rem;">Click image to view full size</p>
        </div>
      </div>
    `;
  } else if (booking.paymentProof) {
    paymentProofHTML = `
      <div style="margin-bottom: 20px;">
        <h3>Payment Proof</h3>
        <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin-bottom: 8px;"><strong>⚠️ Image not available</strong></p>
          <p style="color: #856404; font-size: 0.9rem;"><strong>File:</strong> ${booking.paymentProof}</p>
          <p style="color: #856404; font-size: 0.85rem; margin-top: 8px;">This booking was created before image upload was implemented. New bookings will show payment proof images here.</p>
        </div>
      </div>
    `;
  } else {
    paymentProofHTML = `
      <div style="margin-bottom: 20px;">
        <h3>Payment Proof</h3>
        <div style="background: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
          <p style="color: #721c24;"><strong>❌ No payment proof uploaded</strong></p>
          <p style="color: #721c24; font-size: 0.85rem;">Customer did not upload payment proof.</p>
        </div>
      </div>
    `;
  }
  
  // Handle field variations
  const venueName = booking.venueName || booking.venue || 'N/A';
  const packageName = booking.packageName || booking.package || booking.eventPackage || 'N/A';
  const eventType = (booking.eventType || 'N/A').toUpperCase();
  const eventTime = booking.eventTime || 'N/A';
  const services = Array.isArray(booking.services) ? booking.services.join(', ') : (booking.services || 'None');
  const totalAmount = booking.totalAmount || 0;
  const downPayment = booking.downPayment || 0;
  const balance = booking.balance || 0;
  
  detailsDiv.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3>Booking Information</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px;">
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Customer:</strong> ${booking.customerName || 'N/A'} (${booking.email || 'N/A'})</p>
        <p><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
        <p><strong>Package:</strong> ${packageName}</p>
        <p><strong>Event Type:</strong> ${eventType}</p>
        <p><strong>Date & Time:</strong> ${booking.eventDate || 'N/A'} at ${eventTime}</p>
        <p><strong>Venue:</strong> ${venueName}</p>
        <p><strong>Number of Guests:</strong> ${booking.numberOfGuests || 0}</p>
        <p><strong>Services:</strong> ${services}</p>
        <p><strong>Special Request:</strong> ${booking.specialRequest || 'None'}</p>
        <p><strong>Total Amount:</strong> ₱${totalAmount.toLocaleString()}</p>
        <p><strong>Down Payment (50%):</strong> ₱${downPayment.toLocaleString()}</p>
        <p><strong>Balance:</strong> ₱${balance.toLocaleString()}</p>
      </div>
    </div>

    ${paymentProofHTML}

    <div style="margin-bottom: 20px;">
      <h3>Update Status</h3>
      <select id="bookingStatusSelect" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
        <option value="rejected" ${booking.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
        <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    </div>
  `;

  document.getElementById('bookingModal').style.display = 'block';
}

function updateBookingStatus() {
  const newStatus = document.getElementById('bookingStatusSelect').value;
  const booking = adminData.bookings.find(b => b.id === currentBookingId);

  if (booking) {
    booking.status = newStatus;
    booking.updatedAt = new Date().toISOString();
    
    // Save to localStorage
    saveBookingsToStorage();
    
    // Update reserved dates if status changed to confirmed
    if (newStatus === 'confirmed') {
      if (!adminData.reservedDates.includes(booking.eventDate)) {
        adminData.reservedDates.push(booking.eventDate);
      }
    } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
      // Remove from reserved dates
      adminData.reservedDates = adminData.reservedDates.filter(d => d !== booking.eventDate);
    }
    
    showNotification('Success', `Booking ${currentBookingId} updated to ${newStatus}`);
    closeBookingModal();
    
    // Refresh all connected sections
    loadBookingsTable();
    loadDashboardData();
    updateNotificationBadges();
  }
}

function editBooking(bookingId) {
  const booking = adminData.bookings.find(b => b.id === bookingId);
  if (!booking) return;
  
  currentBookingId = bookingId;
  
  // Get package name - handle both field names
  const packageValue = booking.packageName || booking.package || booking.eventPackage || 'Package 1';
  // Get venue name - handle both field names
  const venueValue = booking.venueName || booking.venue || 'Main Hall';
  
  // Populate edit form with new field IDs
  document.getElementById('editBookingId').value = booking.id;
  document.getElementById('editBookingName').value = booking.customerName || '';
  document.getElementById('editBookingEmail').value = booking.email || '';
  document.getElementById('editBookingPhone').value = booking.phone || '';
  document.getElementById('editBookingEventType').value = booking.eventType || '';
  document.getElementById('editBookingEventDate').value = booking.eventDate || '';
  document.getElementById('editBookingVenue').value = venueValue;
  document.getElementById('editBookingPackage').value = packageValue;
  document.getElementById('editBookingGuests').value = booking.numberOfGuests || 50;
  document.getElementById('editBookingStatus').value = booking.status || 'pending';
  document.getElementById('editBookingSpecialRequests').value = booking.specialRequest || '';
  
  // Update modal title
  document.getElementById('editBookingModalTitle').textContent = 'Edit Booking - ' + booking.id;
  
  const modal = document.getElementById('editBookingModal');
  modal.classList.add('active');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeEditBookingModal() {
  const modal = document.getElementById('editBookingModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  currentBookingId = null;
}

function saveBookingEdit(e) {
  e.preventDefault();
  
  const booking = adminData.bookings.find(b => b.id === currentBookingId);
  if (!booking) return;
  
  // Update booking data with new field IDs
  booking.customerName = document.getElementById('editBookingName').value;
  booking.email = document.getElementById('editBookingEmail').value;
  booking.phone = document.getElementById('editBookingPhone').value;
  booking.eventType = document.getElementById('editBookingEventType').value;
  booking.eventDate = document.getElementById('editBookingEventDate').value;
  booking.venueName = document.getElementById('editBookingVenue').value;
  booking.venue = document.getElementById('editBookingVenue').value;
  booking.packageName = document.getElementById('editBookingPackage').value;
  booking.package = document.getElementById('editBookingPackage').value;
  booking.numberOfGuests = parseInt(document.getElementById('editBookingGuests').value);
  booking.status = document.getElementById('editBookingStatus').value;
  booking.specialRequest = document.getElementById('editBookingSpecialRequests').value;
  booking.updatedAt = new Date().toISOString();
  
  // Save to localStorage
  saveBookingsToStorage();
  
  showNotification('Success', 'Booking updated successfully!');
  closeEditBookingModal();
  loadBookingsTable();
  loadDashboardData();
  updateNotificationBadges();
  generateCalendar(); // Refresh calendar to show updated booking
}

function closeBookingModal() {
  document.getElementById('bookingModal').style.display = 'none';
}

// ===== PAYMENTS PAGE =====
function loadPaymentsTable() {
  const tableBody = document.getElementById('paymentsTableBody');
  const filtered = filterPaymentsList();

  tableBody.innerHTML = filtered.map(payment => {
    const booking = adminData.bookings.find(b => b.id === payment.bookingId);
    const hasImage = payment.paymentProofImage ? '🖼️' : '❌';
    const imageTitle = payment.paymentProofImage ? 'Click View to see receipt' : 'No image uploaded';
    
    return `
      <tr>
        <td><strong>${payment.id}</strong></td>
        <td>${payment.bookingId}</td>
        <td>${booking ? booking.customerName : 'N/A'}</td>
        <td>₱${payment.amount.toLocaleString()}</td>
        <td>₱${payment.downPayment.toLocaleString()}</td>
        <td>₱${payment.remainingBalance.toLocaleString()}</td>
        <td><span class="status-badge status-${payment.status}">${payment.status}</span> <span title="${imageTitle}">${hasImage}</span></td>
        <td>${payment.paymentDate || 'Pending'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-small btn-view" onclick="viewPaymentDetails('${payment.id}')">View</button>
            <button class="btn-small btn-edit" onclick="verifyPaymentProof('${payment.id}')">Verify</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterPaymentsList() {
  let filtered = [...adminData.payments];

  // Apply search filter first
  filtered = searchPayments(filtered);

  const statusFilter = document.getElementById('paymentStatusFilter')?.value;
  const dateFilter = document.getElementById('paymentDateFilter')?.value;

  if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);
  if (dateFilter) {
    filtered = filtered.filter(p => p.paymentDate === dateFilter);
  }

  return filtered;
}

function filterPayments() {
  loadPaymentsTable();
}

function viewPaymentDetails(paymentId) {
  currentPaymentId = paymentId;
  const payment = adminData.payments.find(p => p.id === paymentId);
  const booking = adminData.bookings.find(b => b.id === payment.bookingId);

  if (!payment) return;

  // Payment proof image section
  let paymentProofHTML = '';
  if (payment.paymentProofImage) {
    paymentProofHTML = `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
        <img src="${payment.paymentProofImage}" alt="Payment Proof" 
             style="max-width: 100%; max-height: 500px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer;"
             onclick="openImageModal('${payment.paymentProofImage}', '${payment.paymentProof}')">
        <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">${payment.paymentProof}</p>
        <p style="color: #888; font-size: 0.85rem;">Click image to view full size</p>
      </div>
    `;
  } else if (payment.paymentProof) {
    paymentProofHTML = `
      <div style="background: #fff3cd; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 15px; border-left: 4px solid #ffc107;">
        <p style="color: #856404; margin-bottom: 8px;"><strong>⚠️ Image not available</strong></p>
        <p style="color: #856404; font-size: 0.9rem;">📄 File: ${payment.paymentProof}</p>
        <small style="color: #856404; display: block; margin-top: 8px;">This payment was created before image upload was implemented. New payments will show GCash receipt images here.</small>
      </div>
    `;
  } else {
    paymentProofHTML = `
      <div style="background: #f8d7da; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 15px; border-left: 4px solid #dc3545;">
        <p style="color: #721c24;"><strong>❌ No payment proof uploaded</strong></p>
        <small style="color: #721c24; display: block; margin-top: 5px;">Customer did not upload payment proof.</small>
      </div>
    `;
  }

  const detailsDiv = document.getElementById('paymentDetails');
  detailsDiv.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3>Payment Information</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 6px;">
        <p><strong>Payment ID:</strong> ${payment.id}</p>
        <p><strong>Booking ID:</strong> ${payment.bookingId}</p>
        <p><strong>Customer:</strong> ${booking ? booking.customerName : 'N/A'}</p>
        <p><strong>Total Amount:</strong> ₱${payment.amount.toLocaleString()}</p>
        <p><strong>Down Payment:</strong> ₱${payment.downPayment.toLocaleString()}</p>
        <p><strong>Remaining Balance:</strong> ₱${payment.remainingBalance.toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${payment.paymentMethod || 'Not specified'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${payment.status}">${payment.status}</span></p>
        <p><strong>Payment Date:</strong> ${payment.paymentDate || 'Pending'}</p>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3>Payment Proof (GCash Receipt)</h3>
      ${paymentProofHTML}
      <h3 style="margin-top: 20px;">Verify Payment</h3>
      <select id="paymentVerifyStatus" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="paid" ${payment.status === 'paid' ? 'selected' : ''}>Verified & Paid</option>
        <option value="partial" ${payment.status === 'partial' ? 'selected' : ''}>Partial Payment</option>
        <option value="failed" ${payment.status === 'failed' ? 'selected' : ''}>Failed</option>
      </select>
    </div>
  `;

  document.getElementById('paymentModal').style.display = 'block';
}

function verifyPayment() {
  const newStatus = document.getElementById('paymentVerifyStatus').value;
  const payment = adminData.payments.find(p => p.id === currentPaymentId);

  if (payment) {
    payment.status = newStatus;
    if (newStatus === 'paid') {
      payment.paymentDate = new Date().toISOString().split('T')[0];
      
      // Auto-confirm the associated booking
      const booking = adminData.bookings.find(b => b.id === payment.bookingId);
      if (booking && booking.status === 'pending') {
        booking.status = 'confirmed';
        booking.updatedAt = new Date().toISOString();
        saveBookingsToStorage();
        
        // Add to reserved dates
        if (!adminData.reservedDates.includes(booking.eventDate)) {
          adminData.reservedDates.push(booking.eventDate);
        }
      }
    }
    
    // Save to localStorage
    savePaymentsToStorage();
    
    showNotification('Success', `Payment ${currentPaymentId} updated to ${newStatus}`);
    closePaymentModal();
    
    // Refresh all connected sections
    loadPaymentsTable();
    loadDashboardData();
    updateNotificationBadges();
  }
}

function verifyPaymentProof(paymentId) {
  viewPaymentDetails(paymentId);
}

function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

// ===== SERVICES PAGE =====
function loadServicesGrid() {
  const grid = document.getElementById('servicesGrid');
  
  // Apply search filter
  const filteredServices = searchServices(adminData.services);
  
  if (filteredServices.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
      <p style="font-size: 16px;">🔍 No services found${currentSearchQuery ? ' matching "' + currentSearchQuery + '"' : ''}</p>
    </div>`;
    return;
  }
  
  grid.innerHTML = filteredServices.map(service => `
    <div class="service-card">
      <h4>${service.name}</h4>
      <p>${service.description}</p>
      <div class="service-price">₱${service.price.toLocaleString()}</div>
      <small>Category: ${service.category}</small>
      <div class="card-actions">
        <button class="btn-small btn-edit" onclick="editService('${service.id}')">Edit</button>
        <button class="btn-small btn-delete" onclick="deleteService('${service.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function openServiceModal() {
  currentEditServiceId = null;
  document.getElementById('serviceModalTitle').textContent = 'Add Service';
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceModal').style.display = 'block';
}

function closeServiceModal() {
  document.getElementById('serviceModal').style.display = 'none';
}

function saveService(e) {
  e.preventDefault();
  const name = document.getElementById('serviceName').value;
  const description = document.getElementById('serviceDescription').value;
  const price = parseFloat(document.getElementById('servicePrice').value);
  const category = document.getElementById('serviceCategory').value;

  if (currentEditServiceId) {
    // Edit existing service
    const service = adminData.services.find(s => s.id === currentEditServiceId);
    if (service) {
      service.name = name;
      service.description = description;
      service.price = price;
      service.category = category;
      showNotification('Success', 'Service updated successfully!');
    }
    currentEditServiceId = null;
  } else {
    // Add new service
    const newService = {
      id: 'SRV' + (adminData.services.length + 1).toString().padStart(3, '0'),
      name,
      description,
      price,
      category
    };
    adminData.services.push(newService);
    showNotification('Success', 'Service added successfully!');
  }
  
  closeServiceModal();
  loadServicesGrid();
}

function editService(serviceId) {
  const service = adminData.services.find(s => s.id === serviceId);
  if (!service) return;
  
  currentEditServiceId = serviceId;
  
  // Populate form with service data
  document.getElementById('serviceModalTitle').textContent = 'Edit Service';
  document.getElementById('serviceName').value = service.name;
  document.getElementById('serviceDescription').value = service.description;
  document.getElementById('servicePrice').value = service.price;
  document.getElementById('serviceCategory').value = service.category;
  
  document.getElementById('serviceModal').style.display = 'block';
}

function deleteService(serviceId) {
  showConfirmation('Delete Service', 'Are you sure you want to delete this service?', () => {
    adminData.services = adminData.services.filter(s => s.id !== serviceId);
    showNotification('Success', 'Service deleted successfully');
    loadServicesGrid();
  });
}

// ===== VENUES PAGE =====
function loadVenuesGrid() {
  const grid = document.getElementById('venuesGrid');
  
  // Apply search filter
  const filteredVenues = searchVenues(adminData.venues);
  
  if (filteredVenues.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
      <p style="font-size: 16px;">🔍 No venues found${currentSearchQuery ? ' matching "' + currentSearchQuery + '"' : ''}</p>
    </div>`;
    return;
  }
  
  grid.innerHTML = filteredVenues.map(venue => `
    <div class="venue-card">
      <h4>${venue.name}</h4>
      <p>Capacity: ${venue.capacity} guests</p>
      <div class="venue-price">Included in Package</div>
      <small>Amenities: ${venue.amenities}</small>
      <div class="card-actions">
        <button class="btn-small btn-edit" onclick="editVenue('${venue.id}')">Edit</button>
        <button class="btn-small btn-delete" onclick="deleteVenue('${venue.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function openVenueModal() {
  currentEditVenueId = null;
  document.getElementById('venueModalTitle').textContent = 'Add Venue';
  document.getElementById('venueForm').reset();
  document.getElementById('venueModal').style.display = 'block';
}

function closeVenueModal() {
  document.getElementById('venueModal').style.display = 'none';
  currentEditVenueId = null;
}

function saveVenue(e) {
  e.preventDefault();
  const name = document.getElementById('venueName').value;
  const description = document.getElementById('venueDescription').value;
  const capacity = parseInt(document.getElementById('venueCapacity').value);
  const amenities = document.getElementById('venueAmenities').value;

  if (currentEditVenueId) {
    // Edit existing venue
    const venue = adminData.venues.find(v => v.id === currentEditVenueId);
    if (venue) {
      venue.name = name;
      venue.description = description;
      venue.capacity = capacity;
      venue.amenities = amenities;
      showNotification('Success', 'Venue updated successfully!');
    }
    currentEditVenueId = null;
  } else {
    // Add new venue
    const newVenue = {
      id: 'VN' + (adminData.venues.length + 1).toString().padStart(3, '0'),
      name,
      description,
      capacity,
      amenities
    };
    adminData.venues.push(newVenue);
    showNotification('Success', 'Venue added successfully!');
  }
  
  closeVenueModal();
  loadVenuesGrid();
}

function editVenue(venueId) {
  const venue = adminData.venues.find(v => v.id === venueId);
  if (!venue) return;
  
  currentEditVenueId = venueId;
  
  // Populate form with venue data
  document.getElementById('venueModalTitle').textContent = 'Edit Venue';
  document.getElementById('venueName').value = venue.name;
  document.getElementById('venueDescription').value = venue.description || '';
  document.getElementById('venueCapacity').value = venue.capacity;
  document.getElementById('venueAmenities').value = venue.amenities;
  
  document.getElementById('venueModal').style.display = 'block';
}

function deleteVenue(venueId) {
  showConfirmation('Delete Venue', 'Are you sure you want to delete this venue?', () => {
    adminData.venues = adminData.venues.filter(v => v.id !== venueId);
    showNotification('Success', 'Venue deleted successfully');
    loadVenuesGrid();
  });
}

// ===== CALENDAR PAGE =====
function generateCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update month display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

  // Get bookings for this month
  const monthBookings = adminData.bookings.filter(b => {
    const bookingDate = new Date(b.eventDate);
    return bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
  });

  // Generate calendar grid
  const grid = document.getElementById('calendarGrid');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let html = dayNames.map(day => `<div class="calendar-day header">${day}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const currentDate = new Date(year, month, day);
    const dayBookings = monthBookings.filter(b => b.eventDate === dateStr);
    const isToday = currentDate.getTime() === today.getTime();
    const isPast = currentDate < today;
    
    let className = 'calendar-day';
    if (isToday) className += ' today';
    if (isPast) className += ' past';
    
    // Check booking statuses
    const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
    const hasPending = dayBookings.some(b => b.status === 'pending');
    const hasCompleted = dayBookings.some(b => b.status === 'completed');
    
    if (hasConfirmed) className += ' booked';
    else if (hasPending) className += ' pending-booking';
    else if (hasCompleted) className += ' completed';
    else if (!isPast) className += ' available';

    // Generate booking indicators
    let bookingIndicators = '';
    if (dayBookings.length > 0) {
      bookingIndicators = `<div class="booking-indicators">`;
      dayBookings.slice(0, 3).forEach(b => {
        const statusClass = b.status === 'confirmed' ? 'indicator-confirmed' : 
                           b.status === 'pending' ? 'indicator-pending' : 
                           b.status === 'completed' ? 'indicator-completed' : 'indicator-other';
        bookingIndicators += `<span class="booking-indicator ${statusClass}" title="${b.customerName} - ${b.eventType}"></span>`;
      });
      if (dayBookings.length > 3) {
        bookingIndicators += `<span class="more-bookings">+${dayBookings.length - 3}</span>`;
      }
      bookingIndicators += `</div>`;
    }

    html += `
      <div class="${className}" onclick="showDayBookings('${dateStr}')" data-date="${dateStr}">
        <span class="day-number">${day}</span>
        ${bookingIndicators}
        ${dayBookings.length > 0 ? `<span class="booking-count">${dayBookings.length}</span>` : ''}
      </div>
    `;
  }

  grid.innerHTML = html;
}

// Show bookings for a specific day
function showDayBookings(dateStr) {
  const dayBookings = adminData.bookings.filter(b => b.eventDate === dateStr);
  const formattedDate = new Date(dateStr).toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  if (dayBookings.length === 0) {
    showNotification('No Bookings', `No events scheduled for ${formattedDate}`);
    return;
  }
  
  // Build booking list HTML
  let bookingsHtml = `
    <div class="day-bookings-modal">
      <h3>📅 ${formattedDate}</h3>
      <p class="booking-summary">${dayBookings.length} event${dayBookings.length > 1 ? 's' : ''} scheduled</p>
      <div class="bookings-list">
  `;
  
  dayBookings.forEach(booking => {
    const statusColor = booking.status === 'confirmed' ? '#4caf50' : 
                       booking.status === 'pending' ? '#ff9800' : 
                       booking.status === 'completed' ? '#2196f3' : '#999';
    bookingsHtml += `
      <div class="day-booking-item" onclick="viewBookingDetails('${booking.id}'); closeDayBookingsModal();">
        <div class="booking-time">${booking.eventTime || 'TBD'}</div>
        <div class="booking-info">
          <strong>${booking.customerName}</strong>
          <span class="event-type">${booking.eventType.toUpperCase()}</span>
          <span class="package-name">${booking.packageName || 'N/A'}</span>
        </div>
        <div class="booking-guests">${booking.numberOfGuests} guests</div>
        <span class="booking-status" style="background: ${statusColor}">${booking.status}</span>
      </div>
    `;
  });
  
  bookingsHtml += `
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeDayBookingsModal()">Close</button>
      </div>
    </div>
  `;
  
  // Show in modal
  const modal = document.getElementById('dayBookingsModal');
  if (modal) {
    document.getElementById('dayBookingsContent').innerHTML = bookingsHtml;
    modal.style.display = 'flex';
  } else {
    // Fallback to notification
    let message = dayBookings.map(b => 
      `• ${b.eventTime || 'TBD'} - ${b.customerName} (${b.eventType}, ${b.numberOfGuests} guests) [${b.status}]`
    ).join('\n');
    showNotification(`Events on ${formattedDate}`, message);
  }
}

function closeDayBookingsModal() {
  const modal = document.getElementById('dayBookingsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function previousMonth() {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  generateCalendar();
}

function nextMonth() {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  generateCalendar();
}

// ===== REPORTS PAGE =====
function generateReport() {
  const reportType = document.getElementById('reportType').value;
  const startDate = document.getElementById('reportStartDate').value;
  const endDate = document.getElementById('reportEndDate').value;

  if (!startDate || !endDate) {
    showNotification('Error', 'Please select date range');
    return;
  }

  // Filter bookings by date
  const filtered = adminData.bookings.filter(b => {
    return b.eventDate >= startDate && b.eventDate <= endDate;
  });

  const totalAmount = filtered.reduce((sum, b) => sum + b.totalAmount, 0);
  const byStatus = {
    pending: filtered.filter(b => b.status === 'pending').length,
    confirmed: filtered.filter(b => b.status === 'confirmed').length,
    completed: filtered.filter(b => b.status === 'completed').length,
    rejected: filtered.filter(b => b.status === 'rejected').length
  };

  const html = `
    <div style="padding: 20px; background: white; border-radius: 6px;">
      <h4>${reportType.toUpperCase()} Report</h4>
      <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
      <hr>
      <p><strong>Total Bookings:</strong> ${filtered.length}</p>
      <p><strong>Total Revenue:</strong> ₱${totalAmount.toLocaleString()}</p>
      <hr>
      <p><strong>By Status:</strong></p>
      <ul>
        <li>Pending: ${byStatus.pending}</li>
        <li>Confirmed: ${byStatus.confirmed}</li>
        <li>Completed: ${byStatus.completed}</li>
        <li>Rejected: ${byStatus.rejected}</li>
      </ul>
      <hr>
      <h4>Details</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Booking ID</th>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Customer</th>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Amount</th>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
        </tr>
        ${filtered.map(b => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${b.id}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${b.customerName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">₱${b.totalAmount.toLocaleString()}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${b.status}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;

  document.getElementById('reportPreview').innerHTML = html;
}

function downloadReport() {
  showNotification('Coming Soon', 'Report download - PDF generation feature coming soon!');
}

// ===== UTILITY FUNCTIONS =====
function toggleNotifications() {
  // Load latest data
  loadDataFromStorage();
  
  const dropdown = document.getElementById('notificationDropdown');
  
  // Toggle dropdown visibility
  if (dropdown.classList.contains('active')) {
    dropdown.classList.remove('active');
    return;
  }
  
  const pendingBookings = adminData.bookings.filter(b => b.status === 'pending');
  const pendingPayments = adminData.payments.filter(p => p.status === 'pending');
  
  let content = '';
  
  if (pendingBookings.length === 0 && pendingPayments.length === 0) {
    content = `
      <div class="notification-item empty">
        <span class="notif-icon">✅</span>
        <div class="notif-content">
          <p class="notif-text">All caught up!</p>
          <small>No pending items</small>
        </div>
      </div>
    `;
  } else {
    // Add pending bookings
    pendingBookings.slice(0, 5).forEach(booking => {
      content += `
        <div class="notification-item" onclick="viewBookingDetails('${booking.id}'); toggleNotifications();">
          <span class="notif-icon">📋</span>
          <div class="notif-content">
            <p class="notif-text"><strong>${booking.customerName}</strong></p>
            <small>${booking.eventType} - ${booking.eventDate}</small>
          </div>
          <span class="notif-badge pending">Pending</span>
        </div>
      `;
    });
    
    // Add pending payments
    pendingPayments.slice(0, 5).forEach(payment => {
      content += `
        <div class="notification-item" onclick="viewPaymentDetails('${payment.id}'); toggleNotifications();">
          <span class="notif-icon">💳</span>
          <div class="notif-content">
            <p class="notif-text"><strong>Payment ${payment.id}</strong></p>
            <small>₱${payment.amount.toLocaleString()} - ${payment.method}</small>
          </div>
          <span class="notif-badge pending">Verify</span>
        </div>
      `;
    });
    
    // Show "View All" if there are more
    const totalPending = pendingBookings.length + pendingPayments.length;
    if (totalPending > 5) {
      content += `
        <div class="notification-item view-all" onclick="showAdminPage('bookings'); toggleNotifications();">
          <span class="notif-text">View all ${totalPending} notifications →</span>
        </div>
      `;
    }
  }
  
  document.getElementById('notificationList').innerHTML = content;
  dropdown.classList.add('active');
}

// Close notification dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('notificationDropdown');
  const notifBtn = document.querySelector('.notification-btn');
  if (dropdown && !dropdown.contains(e.target) && !notifBtn?.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});

function adminLogout() {
  showConfirmation('Logout', 'Are you sure you want to logout?', () => {
    handleAdminLogout();
  });
}

// Toggle admin sidebar for mobile
function toggleAdminSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const burgerMenu = document.getElementById('burgerMenuAdmin');

  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
  burgerMenu.classList.toggle('active');
}

// Global function to handle search
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    searchBox.addEventListener('keyup', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      performSearch();
    });
  }
});

function performSearch() {
  // Perform search based on current page
  switch (currentPage) {
    case 'bookings':
      loadBookingsTable();
      break;
    case 'payments':
      loadPaymentsTable();
      break;
    case 'services':
      loadServicesGrid();
      break;
    case 'venues':
      loadVenuesGrid();
      break;
    case 'dashboard':
      // Dashboard doesn't need search, but highlight matching bookings
      loadDashboardData();
      break;
    default:
      break;
  }
}

// Search filter for bookings
function searchBookings(bookings) {
  if (!currentSearchQuery) return bookings;
  
  return bookings.filter(b => {
    const searchStr = `${b.id} ${b.customerName} ${b.email} ${b.phone} ${b.eventType} ${b.eventDate} ${b.venueName || b.venue} ${b.packageName || b.package} ${b.status}`.toLowerCase();
    return searchStr.includes(currentSearchQuery);
  });
}

// Search filter for payments
function searchPayments(payments) {
  if (!currentSearchQuery) return payments;
  
  return payments.filter(p => {
    const booking = adminData.bookings.find(b => b.id === p.bookingId);
    const customerName = booking ? booking.customerName : '';
    const searchStr = `${p.id} ${p.bookingId} ${customerName} ${p.paymentMethod} ${p.status} ${p.amount}`.toLowerCase();
    return searchStr.includes(currentSearchQuery);
  });
}

// Search filter for services
function searchServices(services) {
  if (!currentSearchQuery) return services;
  
  return services.filter(s => {
    const searchStr = `${s.id} ${s.name} ${s.category} ${s.description} ${s.price}`.toLowerCase();
    return searchStr.includes(currentSearchQuery);
  });
}

// Search filter for venues
function searchVenues(venues) {
  if (!currentSearchQuery) return venues;
  
  return venues.filter(v => {
    const searchStr = `${v.id} ${v.name} ${v.amenities} ${v.capacity}`.toLowerCase();
    return searchStr.includes(currentSearchQuery);
  });
}

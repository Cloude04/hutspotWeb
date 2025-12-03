// script.js (improved, demo-only — client-side)
document.addEventListener('DOMContentLoaded', ()=>{
  // sample bookings (will persist to localStorage)
  if(!localStorage.getItem('hutspot_bookings')){
    const sample=[
      {id:1,name:'Maria Clara',email:'maria@example.com',date:'2025-12-20',package:'Birthday Package',status:'pending'},
      {id:2,name:'Juan Dela Cruz',email:'juan@example.com',date:'2025-12-25',package:'Wedding Deluxe',status:'pending'},
      {id:3,name:'Team Alpha',email:'alpha@corp.com',date:'2026-01-15',package:'Corporate Event',status:'confirmed'}
    ];
    localStorage.setItem('hutspot_bookings', JSON.stringify(sample));
  }

  // wire up buttons
  document.querySelectorAll('.close').forEach(b=>b.addEventListener('click', closeAllModals));

  // Close modal on background click
  document.getElementById('notificationModal')?.addEventListener('click', function(e) {
    if(e.target === this) closeNotificationModal();
  });
  document.getElementById('confirmationModal')?.addEventListener('click', function(e) {
    if(e.target === this) closeConfirmationModal();
  });

  // if admin logged, show dashboard
  const adminLogged = localStorage.getItem('hutspot_admin_logged');
  if(adminLogged === 'true') openAdminDashboard();

  loadBookings();
});

/* ---------- NOTIFICATION SYSTEM ---------- */
let confirmCallback = null;
let notificationCallback = null;

function showNotification(title, message, callback) {
  document.getElementById('notificationTitle').textContent = title;
  document.getElementById('notificationMessage').textContent = message;
  notificationCallback = callback || null;
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
  
  // Execute callback if exists
  if (notificationCallback && typeof notificationCallback === 'function') {
    const callback = notificationCallback;
    notificationCallback = null;
    callback();
  }
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

/* ===== ADMIN LOGIN MODAL ===== */
function openAdminLoginModal() {
  document.getElementById('adminLoginModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeAdminLoginModal() {
  document.getElementById('adminLoginModal').style.display = 'none';
  document.getElementById('adminLoginFormModal').reset();
  document.body.style.overflow = 'auto';
}

function handleAdminLoginModal(event) {
  event.preventDefault();
  
  const username = document.getElementById('adminUsernameModal').value;
  const password = document.getElementById('adminPasswordModal').value;
  
  // Validate credentials
  if(username === 'admin' && password === 'password123') {
    // Authentication successful
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('adminUsername', username);
    
    showNotification('Login Successful', 'Welcome back, ' + username + '!');
    closeAdminLoginModal();
    
    // Redirect to admin dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1500);
  } else {
    showNotification('Login Failed', 'Invalid username or password. Demo: admin / password123');
  }
}

function showForgotPasswordFormModal(event) {
  event.preventDefault();
  document.getElementById('adminLoginModal').style.display = 'none';
  document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function closeForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
  document.getElementById('forgotPasswordFormModal').reset();
  document.body.style.overflow = 'auto';
}

function backToAdminLoginModal(event) {
  event.preventDefault();
  document.getElementById('forgotPasswordModal').style.display = 'none';
  document.getElementById('adminLoginModal').style.display = 'flex';
}

function handleForgotPasswordModal(event) {
  event.preventDefault();
  
  const email = document.getElementById('resetEmailModal').value;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('Invalid Email', 'Please enter a valid email address.');
    return;
  }
  
  // Demo validation
  const adminEmail = 'admin@hutspot.com';
  
  if (email.toLowerCase() === adminEmail.toLowerCase() || email === 'admin@example.com') {
    showNotification('Email Sent', 'Password reset link has been sent to your email.');
    setTimeout(() => {
      backToAdminLoginModal({preventDefault: () => {}});
    }, 2000);
  } else {
    showNotification('Email Not Found', 'No account found with this email. Try admin@hutspot.com for demo.');
  }
}

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

function executeConfirmation() {
  if(confirmCallback) confirmCallback();
  closeConfirmationModal();
}

/* ---------- UI HELPERS ---------- */
function openModal(id){const el=document.getElementById(id);if(!el) return;el.style.display='block';}
function closeModal(id){const el=document.getElementById(id);if(!el) return;el.style.display='none';}
function closeAllModals(){document.querySelectorAll('.modal').forEach(m=>m.style.display='none');}

// Package Image Popup Functions
let currentZoom = 1;
const minZoom = 1;
const maxZoom = 4;
const zoomStep = 0.5;

function openPackageImage(imageSrc, packageName) {
  const modal = document.getElementById('packageImageModal');
  const image = document.getElementById('packageImagePopup');
  const title = document.getElementById('packageImageTitle');
  const container = document.getElementById('imageContainer');
  
  if (modal && image && title) {
    image.src = imageSrc;
    title.textContent = packageName + ' Details';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Reset zoom when opening
    currentZoom = 1;
    image.style.transform = `scale(${currentZoom})`;
    if (container) container.classList.remove('zoomed');
  }
}

function closePackageImageModal() {
  const modal = document.getElementById('packageImageModal');
  const image = document.getElementById('packageImagePopup');
  const container = document.getElementById('imageContainer');
  
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Reset zoom when closing
    currentZoom = 1;
    if (image) image.style.transform = `scale(${currentZoom})`;
    if (container) container.classList.remove('zoomed');
  }
}

function toggleZoom() {
  const image = document.getElementById('packageImagePopup');
  const container = document.getElementById('imageContainer');
  
  if (currentZoom === 1) {
    currentZoom = 2;
    container.classList.add('zoomed');
  } else {
    currentZoom = 1;
    container.classList.remove('zoomed');
  }
  image.style.transform = `scale(${currentZoom})`;
}

function zoomIn() {
  const image = document.getElementById('packageImagePopup');
  const container = document.getElementById('imageContainer');
  
  if (currentZoom < maxZoom) {
    currentZoom += zoomStep;
    image.style.transform = `scale(${currentZoom})`;
    if (currentZoom > 1) container.classList.add('zoomed');
  }
}

function zoomOut() {
  const image = document.getElementById('packageImagePopup');
  const container = document.getElementById('imageContainer');
  
  if (currentZoom > minZoom) {
    currentZoom -= zoomStep;
    image.style.transform = `scale(${currentZoom})`;
    if (currentZoom <= 1) container.classList.remove('zoomed');
  }
}

function resetZoom() {
  const image = document.getElementById('packageImagePopup');
  const container = document.getElementById('imageContainer');
  
  currentZoom = 1;
  image.style.transform = `scale(${currentZoom})`;
  container.classList.remove('zoomed');
}

// Close package modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closePackageImageModal();
  }
});

// Booking modal functions
function openBookingModal(){
  const modal = document.getElementById('bookingModal');
  if(modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}
function closeBookingModal(){
  const modal = document.getElementById('bookingModal');
  if(modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Contact modal (placeholder)
function openContactModal(){
  showNotification('Contact Us', 'Email: hutspot@example.com\n\nVisit us in Labo, Camarines Norte.');
}

/* ---------- Mobile nav toggle ---------- */
function toggleMobileNav(){
  const nav = document.getElementById('mobileNav');
  const burger = document.querySelector('.burger-menu');
  
  if(!nav) return;
  
  nav.classList.toggle('open');
  
  if(burger) {
    burger.classList.toggle('active');
  }
  
  // Prevent body scroll when mobile nav is open
  if(nav.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

/* ---------- Auth flows (demo, client-side only) ---------- */
function openUserAuthModal(){openModal('userAuthModal');}
function openUserAuth(){openUserAuthModal();}
function closeUserAuth(){closeModal('userAuthModal');}
function openAdminAuth(){closeUserAuth(); openModal('adminAuthModal');}
function closeAdminAuth(){closeModal('adminAuthModal');}

function userLogin(){
  const email=document.getElementById('userEmail').value.trim();
  const pass=document.getElementById('userPassword').value.trim();
  if(!email || !pass) return showNotification('Error', 'Please enter email and password');
  // demo: any email/pass accepted for user
  showNotification('Success', 'Logged in as ' + email + ' (demo)');
  closeUserAuth();
}

function adminLogin(){
  const email=document.getElementById('adminEmail').value.trim();
  const pass=document.getElementById('adminPassword').value.trim();
  if(!email || !pass) return showNotification('Error', 'Please enter admin email and password');
  // DEMO admin credential (change in real backend)
  if(email === 'admin@hutspot.com' && pass === 'admin123'){
    localStorage.setItem('hutspot_admin_logged','true');
    closeAdminAuth();
    openAdminDashboard();
  } else {
    showNotification('Error', 'Invalid admin credentials (demo)');
  }
}

/* ---------- Admin UI ---------- */
function openAdminDashboard(){
  document.getElementById('adminDashboard').classList.remove('hidden');
  loadBookings();
}

function logoutAdmin(){
  showConfirmation('Logout', 'Are you sure you want to logout?', () => {
    localStorage.removeItem('hutspot_admin_logged');
    document.getElementById('adminDashboard').classList.add('hidden');
    showNotification('Success', 'Admin logged out');
  });
}

function showAdminPage(page){
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.add('hidden'));
  if(page === 'bookings') document.getElementById('bookingManagement').classList.remove('hidden');
  if(page === 'settings') document.getElementById('systemSettings').classList.remove('hidden');
}

/* ---------- Bookings management (localStorage) ---------- */
function getBookings(){
  try{return JSON.parse(localStorage.getItem('hutspot_bookings') || '[]');}catch(e){return []}
}

function saveBookings(list){localStorage.setItem('hutspot_bookings', JSON.stringify(list));loadBookings();}

function loadBookings(){
  const tbody = document.getElementById('bookingList');
  if(!tbody) return;
  const list = getBookings();
  tbody.innerHTML = '';
  if(list.length === 0){tbody.innerHTML = '<tr><td colspan="4">No bookings found</td></tr>';return}
  list.forEach(b =>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(b.name)}<br><small class="muted">${escapeHtml(b.email)}</small></td>
      <td>${escapeHtml(b.date)}</td>
      <td>${escapeHtml(b.package)}</td>
      <td>
        ${renderAction(b)}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAction(b){
  if(b.status === 'pending'){
    return `
      <button class="action-btn accept" onclick="acceptBooking(${b.id})">Confirm</button>
      <button class="action-btn reject" onclick="rejectBooking(${b.id})">Reject</button>
    `;
  }
  return `<span class="status ${b.status === 'confirmed' ? 'confirmed' : 'rejected'}">${b.status}</span>`;
}

function acceptBooking(id){
  const list = getBookings();
  const idx = list.findIndex(x=>x.id===id);
  if(idx === -1) return showNotification('Error', 'Booking not found');
  list[idx].status = 'confirmed';
  saveBookings(list);
  showNotification('Success', 'Booking confirmed');
}

function rejectBooking(id){
  const list = getBookings();
  const idx = list.findIndex(x=>x.id===id);
  if(idx === -1) return showNotification('Error', 'Booking not found');
  list[idx].status = 'rejected';
  saveBookings(list);
  showNotification('Success', 'Booking rejected');
}

/* ---------- Utilities ---------- */
function escapeHtml(text){return String(text||'').replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}

/* ===== USER AUTHENTICATION SYSTEM ===== */

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem('hutspot_user_logged_in') === 'true';
}

// Get current user data
function getCurrentUser() {
  if (!isUserLoggedIn()) return null;
  try {
    return JSON.parse(localStorage.getItem('hutspot_current_user') || '{}');
  } catch (e) {
    return null;
  }
}

// Update account button
function updateAccountButton() {
  const accountBtn = document.getElementById('accountLink');
  if (!accountBtn) return;
  
  if (isUserLoggedIn()) {
    const user = getCurrentUser();
    accountBtn.textContent = user ? user.firstName : 'Account';
    accountBtn.onclick = () => showUserAccountMenu();
  } else {
    accountBtn.textContent = 'Login';
    accountBtn.onclick = () => openUserAuthModal();
  }
}

// Open auth modal (login by default)
function openUserAuthModal() {
  // Check if user is already logged in
  if (isUserLoggedIn()) {
    showUserAccountMenu();
    return;
  }
  
  document.getElementById('userLoginModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Close auth modals
function closeUserAuthModal() {
  document.getElementById('userLoginModal').style.display = 'none';
  document.getElementById('userSignupModal').style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Reset forms
  document.getElementById('userLoginForm')?.reset();
  document.getElementById('userSignupForm')?.reset();
}

// Switch to signup
function switchToSignup(event) {
  event.preventDefault();
  document.getElementById('userLoginModal').style.display = 'none';
  document.getElementById('userSignupModal').style.display = 'flex';
}

// Switch to login
function switchToLogin(event) {
  event.preventDefault();
  document.getElementById('userSignupModal').style.display = 'none';
  document.getElementById('userLoginModal').style.display = 'flex';
}

// Toggle password visibility
function togglePasswordField(fieldId) {
  const input = document.getElementById(fieldId);
  const icon = document.getElementById(fieldId + '-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁️';
  }
}

// Handle user login
function handleUserLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Get registered users from localStorage
  const users = JSON.parse(localStorage.getItem('hutspot_users') || '[]');
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Login successful
    localStorage.setItem('hutspot_user_logged_in', 'true');
    localStorage.setItem('hutspot_current_user', JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile
    }));
    
    showNotification('Login Successful', `Welcome back, ${user.firstName}!`);
    closeUserAuthModal();
    updateAccountButton();
    updateCalendarVisibility(); // Show calendar after login
    
    // If user was trying to book, open booking modal
    const wasBooking = sessionStorage.getItem('attemptedBooking');
    if (wasBooking === 'true') {
      sessionStorage.removeItem('attemptedBooking');
      setTimeout(() => {
        if (typeof openBookingModal === 'function') {
          openBookingModal();
        }
      }, 500);
    }
  } else {
    showNotification('Login Failed', 'Invalid email or password. Please try again or sign up for a new account.');
  }
}

// Handle user signup
function handleUserSignup(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('signupFirstName').value.trim();
  const lastName = document.getElementById('signupLastName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const mobile = document.getElementById('signupMobile').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  // Validation
  if (password !== confirmPassword) {
    showNotification('Signup Error', 'Passwords do not match. Please try again.');
    return;
  }
  
  if (mobile.length !== 11 || !mobile.match(/^[0-9]+$/)) {
    showNotification('Signup Error', 'Please enter a valid 11-digit mobile number.');
    return;
  }
  
  // Get existing users
  const users = JSON.parse(localStorage.getItem('hutspot_users') || '[]');
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    showNotification('Signup Error', 'An account with this email already exists. Please login instead.');
    return;
  }
  
  // Check if mobile already exists
  if (users.find(u => u.mobile === mobile)) {
    showNotification('Signup Error', 'An account with this mobile number already exists.');
    return;
  }
  
  // Create new user
  const newUser = {
    id: 'USER' + Date.now(),
    firstName,
    lastName,
    email,
    mobile,
    password, // In production, this should be hashed!
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('hutspot_users', JSON.stringify(users));
  
  // Auto login after signup
  localStorage.setItem('hutspot_user_logged_in', 'true');
  localStorage.setItem('hutspot_current_user', JSON.stringify({
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    mobile: newUser.mobile
  }));
  
  showNotification('Signup Successful', `Welcome, ${firstName}! Your account has been created successfully.`);
  closeUserAuthModal();
  updateAccountButton();
  updateCalendarVisibility(); // Show calendar after signup
  
  // If user was trying to book, open booking modal
  const wasBooking = sessionStorage.getItem('attemptedBooking');
  if (wasBooking === 'true') {
    sessionStorage.removeItem('attemptedBooking');
    setTimeout(() => {
      if (typeof openBookingModal === 'function') {
        openBookingModal();
      }
    }, 500);
  }
}

// Show user account menu
function showUserAccountMenu() {
  const user = getCurrentUser();
  if (!user) return;
  
  showConfirmation(
    'Account Menu',
    `Logged in as: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\n\nWould you like to logout?`,
    () => {
      // Logout
      localStorage.removeItem('hutspot_user_logged_in');
      localStorage.removeItem('hutspot_current_user');
      showNotification('Logged Out', 'You have been logged out successfully.');
      updateAccountButton();
      updateCalendarVisibility(); // Hide calendar after logout
    }
  );
}

// Show forgot password
function showForgotPassword(event) {
  event.preventDefault();
  showNotification('Forgot Password', 'Please contact support at hutspot@example.com to reset your password.');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateAccountButton();
});

// Expose some helpers to global (for inline onclicks)
window.toggleMobileNav = toggleMobileNav;
window.openUserAuthModal = openUserAuthModal;
window.closeUserAuthModal = closeUserAuthModal;
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.togglePasswordField = togglePasswordField;
window.handleUserLogin = handleUserLogin;
window.handleUserSignup = handleUserSignup;
window.showForgotPassword = showForgotPassword;
window.openUserAuth = openUserAuth;
window.closeUserAuth = closeUserAuth;
window.openAdminAuth = openAdminAuth;
window.closeAdminAuth = closeAdminAuth;
window.userLogin = userLogin;
window.adminLogin = adminLogin;
window.acceptBooking = acceptBooking;
window.rejectBooking = rejectBooking;
window.logoutAdmin = logoutAdmin;
window.showAdminPage = showAdminPage;
window.loadBookings = loadBookings;
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.openContactModal = openContactModal;

/* ===== CALENDAR FUNCTIONS ===== */
let currentCalendarMonth = new Date();

function generateCalendar() {
  const year = currentCalendarMonth.getFullYear();
  const month = currentCalendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Update month display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('calendarMonthTitle').textContent = `${monthNames[month]} ${year}`;

  // Generate calendar grid
  const grid = document.getElementById('calendarGridDays');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let html = dayNames.map(day => `<div class="calendar-day header">${day}</div>`).join('');

  // Get bookings from localStorage
  const bookings = JSON.parse(localStorage.getItem('hutspot_bookings') || '[]');

  // Get previous month's last days to fill the grid
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  // Empty cells before first day (show previous month days)
  for (let i = firstDay - 1; i >= 0; i--) {
    const prevDay = prevMonthDays - i;
    html += `<div class="calendar-day other-month">${prevDay}</div>`;
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if date is booked (confirmed) or reserved (pending)
    const confirmedBooking = bookings.find(b => b.eventDate === dateStr && b.status === 'confirmed');
    const pendingBooking = bookings.find(b => b.eventDate === dateStr && b.status === 'pending');
    
    let className = 'calendar-day';
    if (confirmedBooking) {
      className += ' booked';
    } else if (pendingBooking) {
      className += ' reserved';
    }

    html += `<div class="${className}" onclick="viewDateBookings('${dateStr}')">${day}</div>`;
  }

  // Fill remaining cells with next month days
  const totalCells = (html.match(/calendar-day/g) || []).length;
  const remainingCells = 42 - totalCells; // 6 rows × 7 days = 42 cells
  for (let day = 1; day <= remainingCells; day++) {
    html += `<div class="calendar-day other-month">${day}</div>`;
  }

  grid.innerHTML = html;
}

function goToToday() {
  currentCalendarMonth = new Date();
  generateCalendar();
}

function previousMonth() {
  currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() - 1);
  generateCalendar();
}

function nextMonth() {
  currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + 1);
  generateCalendar();
}

function viewDateBookings(dateStr) {
  const bookings = JSON.parse(localStorage.getItem('hutspot_bookings') || '[]');
  const dateBookings = bookings.filter(b => b.eventDate === dateStr);
  
  if (dateBookings.length > 0) {
    const bookingsList = dateBookings.map(b => 
      `• ${b.customerName} - ${b.eventType.toUpperCase()} (${b.status})`
    ).join('\n');
    showNotification('Bookings on ' + dateStr, bookingsList);
  } else {
    showNotification('Available', 'No bookings on this date. This date is available!');
  }
}

function showCalendarForLoggedInUser() {
  const currentUser = getCurrentUser();
  const calendarSection = document.getElementById('calendar');
  
  if (currentUser) {
    // User is logged in, show calendar and generate it
    calendarSection.style.display = 'block';
    generateCalendar();
  } else {
    // User not logged in, hide calendar
    calendarSection.style.display = 'none';
  }
}

// Call this when user logs in/out
function updateCalendarVisibility() {
  showCalendarForLoggedInUser();
}

// Initialize calendar visibility on page load
document.addEventListener('DOMContentLoaded', () => {
  showCalendarForLoggedInUser();
});

window.generateCalendar = generateCalendar;
window.goToToday = goToToday;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.viewDateBookings = viewDateBookings;
window.updateCalendarVisibility = updateCalendarVisibility;

/* ===== CONTACT FORM HANDLER ===== */
function handleContactForm(event) {
  event.preventDefault();
  
  const form = event.target;
  const name = form[0].value;
  const email = form[1].value;
  const message = form[2].value;
  
  // In production, this would send to a backend
  console.log('Contact Form Submission:', { name, email, message });
  
  showNotification(
    'Message Sent!',
    'Thank you for contacting us! We will get back to you soon.'
  );
  
  form.reset();
}

window.handleContactForm = handleContactForm;


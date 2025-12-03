/**
 * Helper functions for the application
 */

// Calculate total booking amount
function calculateBookingTotal(basePrice, services = [], promoDiscount = 0) {
  const servicesTotal = services.reduce((sum, service) => sum + (service.price * service.quantity || 0), 0);
  const subtotal = basePrice + servicesTotal;
  const total = Math.max(0, subtotal - promoDiscount);
  return {
    subtotal,
    discount: promoDiscount,
    total
  };
}

// Calculate down payment (typically 50% or fixed amount)
function calculateDownPayment(total, percentage = 0.5) {
  return Math.round(total * percentage * 100) / 100;
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
}

// Check date availability
function isDateAvailable(date, reservedDates = []) {
  return !reservedDates.some(rd => rd.date === date);
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Generate report data
function generateReportData(bookings, startDate, endDate) {
  const filtered = bookings.filter(b => {
    const bDate = new Date(b.created_at);
    return bDate >= new Date(startDate) && bDate <= new Date(endDate);
  });

  return {
    period: `${startDate} to ${endDate}`,
    total_bookings: filtered.length,
    confirmed: filtered.filter(b => b.status === 'confirmed').length,
    pending: filtered.filter(b => b.status === 'pending').length,
    rejected: filtered.filter(b => b.status === 'rejected').length,
    bookings: filtered
  };
}

module.exports = {
  calculateBookingTotal,
  calculateDownPayment,
  formatCurrency,
  isDateAvailable,
  validateEmail,
  generateReportData
};

/**
 * Utility functions for time period calculations
 */

/**
 * Get the start date for a given time period
 * @param {string} period - The time period ('lastMonth', '3months', '6months', 'currentYear', 'allTime')
 * @returns {Date|null} The start date, or null for 'allTime'
 */
export const getStartDateForPeriod = (period) => {
  const now = new Date();
  
  switch (period) {
    case 'lastMonth':
      // Start of last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return lastMonth;
      
    case '3months':
      // 3 months ago from today
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return threeMonthsAgo;
      
    case '6months':
      // 6 months ago from today
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return sixMonthsAgo;
      
    case 'currentYear':
      // Start of current year
      return new Date(now.getFullYear(), 0, 1);
      
    case 'allTime':
      // No start date filter - return null
      return null;
      
    default:
      // Default to current month
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
};

/**
 * Get the end date for a given time period
 * @param {string} period - The time period
 * @returns {Date|null} The end date, or null for ongoing periods
 */
export const getEndDateForPeriod = (period) => {
  const now = new Date();
  
  switch (period) {
    case 'lastMonth':
      // End of last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return lastMonth;
      
    case '3months':
    case '6months':
    case 'currentYear':
    case 'allTime':
    default:
      // For ongoing periods, return current date
      return now;
  }
};

/**
 * Get a human-readable description of the time period
 * @param {string} period - The time period
 * @returns {string} Description of the period
 */
export const getPeriodDescription = (period) => {
  const now = new Date();
  
  switch (period) {
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      
    case '3months':
      return 'Last 3 months';
      
    case '6months':
      return 'Last 6 months';
      
    case 'currentYear':
      return `${now.getFullYear()}`;
      
    case 'allTime':
      return 'All time';
      
    default:
      return 'Current month';
  }
};

/**
 * Convert time period to API format (for backend compatibility)
 * @param {string} period - The time period
 * @returns {string} API-compatible period string
 */
export const periodToApiFormat = (period) => {
  switch (period) {
    case 'lastMonth':
      return 'month';
    case '3months':
      return '3months';
    case '6months':
      return '6months';
    case 'currentYear':
      return 'year';
    case 'allTime':
      return 'all';
    default:
      return 'month';
  }
};

/**
 * Get date range filters for transactions
 * @param {string} period - The time period
 * @returns {Object} Object with startDate and endDate properties
 */
export const getDateRangeFilters = (period) => {
  const startDate = getStartDateForPeriod(period);
  const endDate = getEndDateForPeriod(period);
  
  return {
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null
  };
};

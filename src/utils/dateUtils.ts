/**
 * Date utility functions
 */

/**
 * Get today's date formatted as YYYY-MM-DD for HTML date inputs
 * This is commonly used to restrict future date selection for Date of Birth fields
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Get today's date as a Date object
 * This is commonly used for DatePicker components' maxDate prop
 * @returns {Date} Today's date
 */
export const getTodayDate = (): Date => {
    return new Date();
};

/**
 * Format a date to the HTML date input format (YYYY-MM-DD)
 * @param date - The date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
}; 
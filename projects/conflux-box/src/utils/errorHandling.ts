import { notifications } from '@mantine/notifications';
import { useAuthStore } from '../stores/authStore';

export interface ApiError extends Error {
  status?: number;
  originalError?: any;
  isNetworkError?: boolean;
}

/**
 * Handle API errors consistently across the application
 * @param error - The error from an API call
 * @param customMessage - Optional custom message to show instead of the default
 * @param showNotification - Whether to show a notification (default: true)
 */
export function handleApiError(error: ApiError, customMessage?: string, showNotification = true) {
  console.error('API Error:', error);

  let title = 'Error';
  let message = customMessage || error.message || 'An unexpected error occurred';
  let color = 'red';
  let autoClose = 5000;

  // Handle specific error types
  if (error.status) {
    switch (error.status) {
      case 401:
        title = 'Authentication Failed';
        color = 'orange';
        // Trigger disconnect
        useAuthStore.getState().disconnect();
        break;

      case 403:
        title = 'Access Denied';
        message = 'Administrator privileges required for this operation';
        break;

      case 429:
        title = 'Rate Limited';
        color = 'yellow';
        autoClose = 3000;
        break;

      case 501:
        title = 'Feature Unavailable';
        color = 'blue';
        break;

      case 503:
        title = 'Service Unavailable';
        message = 'DevKit backend is not responding. Please check the service status.';
        break;

      default:
        if (error.status >= 500) {
          title = 'Server Error';
        } else if (error.status >= 400) {
          title = 'Request Error';
        }
    }
  } else if (error.isNetworkError) {
    title = 'Connection Error';
    color = 'red';
    autoClose = 8000; // Longer for network issues
  }

  if (showNotification) {
    notifications.show({
      title,
      message,
      color,
      autoClose,
    });
  }

  return {
    title,
    message,
    color,
    status: error.status,
    isNetworkError: error.isNetworkError,
  };
}

/**
 * Handle successful operations with notifications
 * @param message - Success message to display
 * @param title - Optional title (default: "Success")
 */
export function handleApiSuccess(message: string, title = 'Success') {
  notifications.show({
    title,
    message,
    color: 'green',
    autoClose: 3000,
  });
}

/**
 * Wrapper for API calls that automatically handles errors
 * @param apiCall - The API function to call
 * @param successMessage - Optional success message
 * @param errorMessage - Optional custom error message
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  successMessage?: string,
  errorMessage?: string
): Promise<T | null> {
  try {
    const result = await apiCall();

    if (successMessage) {
      handleApiSuccess(successMessage);
    }

    return result;
  } catch (error) {
    handleApiError(error as ApiError, errorMessage);
    return null;
  }
}

/**
 * Get user-friendly error message based on the error type
 * @param error - The error object
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: ApiError): string {
  if (error.isNetworkError) {
    return 'Connection failed. Please check if the DevKit backend is running.';
  }

  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please reconnect your wallet.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict detected. The operation cannot be completed.';
    case 429:
      return 'Too many requests. Please wait a moment before trying again.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 501:
      return 'This feature is not yet implemented.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

/**
 * Check if an error is recoverable (user can retry)
 * @param error - The error object
 * @returns Whether the error is recoverable
 */
export function isRecoverableError(error: ApiError): boolean {
  // Non-recoverable errors
  const nonRecoverableStatuses = [400, 401, 403, 404, 501];

  if (error.status && nonRecoverableStatuses.includes(error.status)) {
    return false;
  }

  // Network errors and server errors are usually recoverable
  return true;
}

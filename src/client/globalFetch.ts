import { toast } from "sonner";

const originalFetch = window.fetch;

window.fetch = async (url, options = {}) => {
  options.credentials = options.credentials || 'same-origin';

  const response = await originalFetch(url, options);

  // If the response is 440, it means the session has expired
  // Redirect to login page
  // Don't redirect to login page if the request is already a login page
  // This is to prevent infinite redirect loop
  if (response.status === 440 ) {
    toast.warning("Session Expired. Redirecting...")
    window.location.href = '/login';
    return response;
  }

  else return response
};
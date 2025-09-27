// CropPulse Professional JavaScript Module

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXX",
  authDomain: "croppulse-12345.firebaseapp.com",
  projectId: "croppulse-12345",
  storageBucket: "croppulse-12345.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcd1234"
};

// Initialize Firebase (if not already initialized)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global App State
const CropPulseApp = {
  // User session management
  user: null,
  isAuthenticated: false,
  
  // Initialize the application
  init() {
    this.setupEventListeners();
    this.initializeAuth();
    this.setupServiceWorker();
    this.initializeNotifications();
  },

  // Setup global event listeners
  setupEventListeners() {
    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    // Form validation
    document.addEventListener('input', (e) => {
      if (e.target.matches('.form-input')) {
        this.validateField(e.target);
      }
    });

    // Loading states for buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn[data-loading]')) {
        this.showButtonLoading(e.target);
      }
    });
  },

  // Initialize authentication
  initializeAuth() {
    if (typeof firebase !== 'undefined') {
      firebase.auth().onAuthStateChanged((user) => {
        this.user = user;
        this.isAuthenticated = !!user;
        this.updateAuthUI();
      });
    }
  },

  // Update UI based on authentication state
  updateAuthUI() {
    const authElements = document.querySelectorAll('[data-auth]');
    authElements.forEach(element => {
      const authState = element.dataset.auth;
      if (authState === 'authenticated' && this.isAuthenticated) {
        element.style.display = '';
      } else if (authState === 'unauthenticated' && !this.isAuthenticated) {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });
  },

  // Setup service worker for offline functionality
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  },

  // Initialize push notifications
  initializeNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission === 'default') {
        // Don't request permission automatically, let user decide
        console.log('Notifications available but not requested');
      }
    }
  },

  // Validate form field
  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Type-specific validation
    if (value && isValid) {
      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
          }
          break;
        
        case 'tel':
          const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
          }
          break;
        
        case 'number':
          const num = parseFloat(value);
          const min = parseFloat(field.min);
          const max = parseFloat(field.max);
          if (isNaN(num) || (min && num < min) || (max && num > max)) {
            isValid = false;
            errorMessage = `Please enter a number between ${min || '0'} and ${max || '∞'}`;
          }
          break;
      }
    }

    // Update field appearance
    this.updateFieldValidation(field, isValid, errorMessage);
    return isValid;
  },

  // Update field validation UI
  updateFieldValidation(field, isValid, errorMessage) {
    const errorElement = field.parentNode.querySelector('.field-error');
    
    if (isValid) {
      field.style.borderColor = '';
      if (errorElement) errorElement.remove();
    } else {
      field.style.borderColor = '#f44336';
      if (!errorElement) {
        const error = document.createElement('small');
        error.className = 'field-error';
        error.style.color = '#f44336';
        error.style.display = 'block';
        error.style.marginTop = '0.25rem';
        field.parentNode.appendChild(error);
      }
      if (errorElement) errorElement.textContent = errorMessage;
    }
  },

  // Show loading state for button
  showButtonLoading(button) {
    const originalText = button.textContent;
    const loadingText = button.dataset.loading || 'Loading...';
    
    button.disabled = true;
    button.innerHTML = `<span class="loading"></span> ${loadingText}`;
    
    // Auto-reset after 5 seconds as fallback
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, 5000);
  },

  // Hide loading state for button
  hideButtonLoading(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
  },

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-medium);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  },

  // Format phone number
  formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 0 && !value.startsWith('+')) {
      value = '+91' + value;
    }
    input.value = value;
  },

  // Debounce function for search/input
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Local storage helpers
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    },
    
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Failed to read from localStorage:', e);
        return defaultValue;
      }
    },
    
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Failed to remove from localStorage:', e);
      }
    }
  },

  // API helpers
  api: {
    async request(url, options = {}) {
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const config = { ...defaultOptions, ...options };
      
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    
    async get(url) {
      return this.request(url, { method: 'GET' });
    },
    
    async post(url, data) {
      return this.request(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  CropPulseApp.init();
});

// Export for use in other scripts
window.CropPulseApp = CropPulseApp;

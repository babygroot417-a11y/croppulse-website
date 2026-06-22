/* ==========================================================================
   CropPulse Shared JavaScript Utilities
   Common logic extracted from duplicated inline scripts across pages.
   ========================================================================== */

/**
 * Theme Management
 * Handles dark/light mode toggle with localStorage persistence.
 */
function toggleTheme() {
  const isDarkMode = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
}

/**
 * Alert/Notification Display
 * Shows a temporary alert message with auto-dismiss.
 * @param {string} elementId - The ID of the alert container element
 * @param {string} message - Message text to display
 * @param {string} type - Alert type: 'info', 'success', or 'error'
 * @param {number} duration - Auto-dismiss duration in ms (default: 4000)
 */
function showAlert(elementId, message, type, duration) {
  type = type || 'info';
  duration = duration || 4000;
  var alertBox = document.getElementById(elementId);
  if (!alertBox) return;
  alertBox.className = 'alert alert-' + type;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
  setTimeout(function() {
    alertBox.style.display = 'none';
  }, duration);
}

/**
 * Farm Grid Generator
 * Generates a grid of crop health blocks with random or provided data.
 * Used on index, dashboard, and results pages.
 *
 * @param {object} options
 * @param {string} options.gridId - ID of the grid container element
 * @param {number} options.blockCount - Number of blocks to generate (default: 36)
 * @param {function} options.onClick - Click handler receiving (blockIndex, status, data)
 * @param {function} options.onHover - Hover handler receiving (blockIndex, status, data)
 * @param {function} options.onHoverEnd - Hover-end handler
 * @param {boolean} options.showLabel - Whether to show block number label (default: false)
 */
function generateFarmGrid(options) {
  var gridId = options.gridId;
  var blockCount = options.blockCount || 36;
  var onClick = options.onClick || null;
  var onHover = options.onHover || null;
  var onHoverEnd = options.onHoverEnd || null;
  var showLabel = options.showLabel !== undefined ? options.showLabel : false;

  var grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';

  for (var i = 0; i < blockCount; i++) {
    var block = document.createElement('div');
    block.classList.add('grid-block');

    var rand = Math.random();
    var status = '';
    var statusClass = '';

    var data = {
      pH: (5.0 + Math.random() * 3.0).toFixed(1),
      moisture: Math.floor(Math.random() * 60 + 30),
      pests: Math.floor(Math.random() * 20),
      temperature: (18 + Math.random() * 16).toFixed(1)
    };

    if (rand > 0.65) {
      status = 'Healthy';
      statusClass = 'healthy';
    } else if (rand > 0.35) {
      status = 'Warning';
      statusClass = 'warning';
    } else {
      status = 'Critical';
      statusClass = 'critical';
    }

    block.classList.add(statusClass);

    if (showLabel) {
      block.textContent = '#' + (i + 1);
    }

    (function(index, st, sc, d) {
      if (onClick) {
        block.onclick = function() { onClick(index, st, d); };
      }
      if (onHover) {
        block.onmouseover = function() { onHover(index, st, d); };
      }
      if (onHoverEnd) {
        block.onmouseout = function() { onHoverEnd(); };
      }
    })(i + 1, status, statusClass, data);

    grid.appendChild(block);
  }
}

// Auto-load theme on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadTheme);

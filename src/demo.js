// Index page demo logic: grid generation with hover popups

function classifyDemoBlock(rand) {
  if (rand > 0.65) {
    return { status: 'Healthy', statusClass: 'healthy' };
  } else if (rand > 0.35) {
    return { status: 'Warning', statusClass: 'warning' };
  } else {
    return { status: 'Critical', statusClass: 'critical' };
  }
}

function createDemoData() {
  return {
    pH: (5 + Math.random() * 3).toFixed(1),
    moisture: Math.floor(Math.random() * 100),
    pests: Math.floor(Math.random() * 20),
    temperature: (20 + Math.random() * 15).toFixed(1)
  };
}

function runDemo() {
  var grid = document.getElementById('grid');
  var popup = document.getElementById('popup');
  var popupContent = document.getElementById('popupContent');
  var popupStatus = document.getElementById('popupStatus');

  grid.innerHTML = '';

  for (var i = 0; i < 36; i++) {
    var block = document.createElement('div');
    block.classList.add('grid-block');

    var rand = Math.random();
    var classification = classifyDemoBlock(rand);
    var data = createDemoData();

    block.classList.add(classification.statusClass);
    block.dataset.status = classification.status;
    block.dataset.index = i + 1;

    (function (idx, status, blockData) {
      block.onmouseover = function () {
        popup.classList.add('show');
        popupStatus.textContent = 'Block ' + idx + ' - ' + status;
        popupContent.innerHTML =
          '<div class="popup-item"><strong>Status:</strong> ' + status + '</div>' +
          '<div class="popup-item"><strong>pH:</strong> ' + blockData.pH + '</div>' +
          '<div class="popup-item"><strong>Moisture:</strong> ' + blockData.moisture + '%</div>' +
          '<div class="popup-item"><strong>Pest Risk:</strong> ' + blockData.pests + '%</div>' +
          '<div class="popup-item"><strong>Temp:</strong> ' + blockData.temperature + '\u00B0C</div>';
      };

      block.onmouseout = function () {
        popup.classList.remove('show');
      };
    })(i + 1, classification.status, data);

    grid.appendChild(block);
  }
}

function initTheme() {
  runDemo();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { classifyDemoBlock, createDemoData, runDemo, initTheme };
}

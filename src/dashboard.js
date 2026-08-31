// Dashboard page logic: grid generation, popup management

function createBlockData() {
  return {
    pH: (5.2 + Math.random() * 2.8).toFixed(1),
    moisture: Math.floor(Math.random() * 40 + 40),
    pests: Math.floor(Math.random() * 15),
    temperature: (18 + Math.random() * 16).toFixed(1)
  };
}

function classifyBlock(rand) {
  if (rand > 0.65) {
    return { status: 'Healthy', statusClass: 'healthy' };
  } else if (rand > 0.35) {
    return { status: 'Warning', statusClass: 'warning' };
  } else {
    return { status: 'Critical', statusClass: 'critical' };
  }
}

function loadDashboard() {
  var grid = document.getElementById('grid');
  var popup = document.getElementById('popup');
  var overlay = document.getElementById('overlay');
  var popupTitle = document.getElementById('popupTitle');
  var popupContent = document.getElementById('popupContent');

  grid.innerHTML = '';

  for (var i = 1; i <= 36; i++) {
    var block = document.createElement('div');
    block.classList.add('grid-block');

    var rand = Math.random();
    var classification = classifyBlock(rand);
    var data = createBlockData();

    block.classList.add(classification.statusClass);
    block.textContent = '#' + i;

    (function (idx, status, blockData) {
      block.onclick = function () {
        popup.classList.add('show');
        overlay.classList.add('show');
        popupTitle.textContent = 'Block ' + idx + ' - ' + status;
        popupContent.innerHTML =
          '<div class="popup-item"><span class="popup-label">Status</span><span class="popup-value">' + status + '</span></div>' +
          '<div class="popup-item"><span class="popup-label">pH Level</span><span class="popup-value">' + blockData.pH + '</span></div>' +
          '<div class="popup-item"><span class="popup-label">Moisture</span><span class="popup-value">' + blockData.moisture + '%</span></div>' +
          '<div class="popup-item"><span class="popup-label">Pest Risk</span><span class="popup-value">' + blockData.pests + '%</span></div>' +
          '<div class="popup-item"><span class="popup-label">Temperature</span><span class="popup-value">' + blockData.temperature + '\u00B0C</span></div>';
      };
    })(i, classification.status, data);

    grid.appendChild(block);
  }
}

function closePopup() {
  document.getElementById('popup').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createBlockData, classifyBlock, loadDashboard, closePopup };
}

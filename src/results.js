// Results page logic: farm data, grid, block details, report download

function generateFarmData(count) {
  count = count || 36;
  var statuses = ['healthy', 'warning', 'critical'];
  return Array.from({ length: count }, function (_, i) {
    var status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: i + 1,
      status: status,
      details: 'Block ' + (i + 1) + ' - ' + status.toUpperCase() + ': Advanced analytics and recommendations'
    };
  });
}

function generateFarmGrid(farmData, gridContainer) {
  gridContainer.innerHTML = '';

  farmData.forEach(function (block) {
    var blockElement = document.createElement('div');
    blockElement.className = 'grid-block ' + block.status;
    blockElement.textContent = block.id;
    blockElement.style.cursor = 'pointer';
    blockElement.onclick = function () {
      showBlockDetails(block);
    };
    gridContainer.appendChild(blockElement);
  });
}

function showBlockDetails(block) {
  var statusEmojis = {
    healthy: '\u2713',
    warning: '\u26A0',
    critical: '\uD83D\uDEA8'
  };

  return {
    title: 'Section ' + block.id,
    status: block.status.toUpperCase(),
    details: block.details,
    emoji: statusEmojis[block.status] || ''
  };
}

function generateReportData() {
  return {
    scanDate: new Date().toISOString(),
    farmHealth: '75% healthy',
    criticalIssues: 3,
    recommendations: ['Apply neem oil', 'Add urea fertilizer', 'Increase irrigation']
  };
}

function downloadReport() {
  var reportData = generateReportData();

  var dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
  var link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', 'crop-scan-report-' + new Date().toISOString().split('T')[0] + '.json');
  link.click();
  return reportData;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateFarmData, generateFarmGrid, showBlockDetails, generateReportData, downloadReport };
}

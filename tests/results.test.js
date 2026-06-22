const { generateFarmData, generateFarmGrid, showBlockDetails, generateReportData, downloadReport } = require('../src/results');

describe('generateFarmData', () => {
  test('generates 36 blocks by default', () => {
    const data = generateFarmData();
    expect(data).toHaveLength(36);
  });

  test('generates custom number of blocks', () => {
    const data = generateFarmData(10);
    expect(data).toHaveLength(10);
  });

  test('each block has required properties', () => {
    const data = generateFarmData(5);
    data.forEach((block, i) => {
      expect(block.id).toBe(i + 1);
      expect(['healthy', 'warning', 'critical']).toContain(block.status);
      expect(block.details).toContain('Block ' + (i + 1));
      expect(block.details).toContain(block.status.toUpperCase());
    });
  });

  test('block IDs are sequential starting from 1', () => {
    const data = generateFarmData(5);
    expect(data.map(b => b.id)).toEqual([1, 2, 3, 4, 5]);
  });

  test('details contain analytics message', () => {
    const data = generateFarmData(1);
    expect(data[0].details).toContain('Advanced analytics and recommendations');
  });
});

describe('generateFarmGrid', () => {
  let gridContainer;

  beforeEach(() => {
    gridContainer = document.createElement('div');
    document.body.appendChild(gridContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('creates correct number of grid blocks', () => {
    const data = generateFarmData(5);
    generateFarmGrid(data, gridContainer);
    expect(gridContainer.children).toHaveLength(5);
  });

  test('each block has correct CSS classes', () => {
    const data = [
      { id: 1, status: 'healthy', details: 'test' },
      { id: 2, status: 'critical', details: 'test' }
    ];
    generateFarmGrid(data, gridContainer);
    expect(gridContainer.children[0].className).toBe('grid-block healthy');
    expect(gridContainer.children[1].className).toBe('grid-block critical');
  });

  test('each block displays its ID', () => {
    const data = [{ id: 42, status: 'warning', details: 'test' }];
    generateFarmGrid(data, gridContainer);
    expect(gridContainer.children[0].textContent).toBe('42');
  });

  test('blocks have pointer cursor', () => {
    const data = [{ id: 1, status: 'healthy', details: 'test' }];
    generateFarmGrid(data, gridContainer);
    expect(gridContainer.children[0].style.cursor).toBe('pointer');
  });

  test('clears previous grid content', () => {
    gridContainer.innerHTML = '<div>old content</div>';
    generateFarmGrid([], gridContainer);
    expect(gridContainer.children).toHaveLength(0);
  });

  test('blocks have onclick handler', () => {
    const data = [{ id: 1, status: 'healthy', details: 'test' }];
    generateFarmGrid(data, gridContainer);
    expect(gridContainer.children[0].onclick).toBeInstanceOf(Function);
  });
});

describe('showBlockDetails', () => {
  test('returns correct details for healthy block', () => {
    const block = { id: 5, status: 'healthy', details: 'Block 5 info' };
    const result = showBlockDetails(block);
    expect(result.title).toBe('Section 5');
    expect(result.status).toBe('HEALTHY');
    expect(result.details).toBe('Block 5 info');
    expect(result.emoji).toBe('\u2713');
  });

  test('returns correct details for warning block', () => {
    const block = { id: 10, status: 'warning', details: 'Block 10 info' };
    const result = showBlockDetails(block);
    expect(result.status).toBe('WARNING');
    expect(result.emoji).toBe('\u26A0');
  });

  test('returns correct details for critical block', () => {
    const block = { id: 1, status: 'critical', details: 'Block 1 info' };
    const result = showBlockDetails(block);
    expect(result.status).toBe('CRITICAL');
    expect(result.emoji).toBe('\uD83D\uDEA8');
  });

  test('returns empty emoji for unknown status', () => {
    const block = { id: 1, status: 'unknown', details: 'test' };
    const result = showBlockDetails(block);
    expect(result.emoji).toBe('');
  });
});

describe('generateReportData', () => {
  test('returns object with required fields', () => {
    const report = generateReportData();
    expect(report).toHaveProperty('scanDate');
    expect(report).toHaveProperty('farmHealth');
    expect(report).toHaveProperty('criticalIssues');
    expect(report).toHaveProperty('recommendations');
  });

  test('scanDate is a valid ISO string', () => {
    const report = generateReportData();
    expect(new Date(report.scanDate).toISOString()).toBe(report.scanDate);
  });

  test('farmHealth is 75% healthy', () => {
    const report = generateReportData();
    expect(report.farmHealth).toBe('75% healthy');
  });

  test('has 3 critical issues', () => {
    const report = generateReportData();
    expect(report.criticalIssues).toBe(3);
  });

  test('recommendations is an array of 3 items', () => {
    const report = generateReportData();
    expect(report.recommendations).toHaveLength(3);
    expect(report.recommendations).toContain('Apply neem oil');
    expect(report.recommendations).toContain('Add urea fertilizer');
    expect(report.recommendations).toContain('Increase irrigation');
  });
});

describe('downloadReport', () => {
  test('creates and clicks a download link', () => {
    const clickSpy = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return { setAttribute: jest.fn(), click: clickSpy };
      }
      return document.createElement(tag);
    });

    const result = downloadReport();
    expect(clickSpy).toHaveBeenCalled();
    expect(result).toHaveProperty('scanDate');

    document.createElement.mockRestore();
  });

  test('returns valid report data', () => {
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return { setAttribute: jest.fn(), click: jest.fn() };
      }
      return document.createElement(tag);
    });

    const result = downloadReport();
    expect(result.recommendations).toHaveLength(3);

    document.createElement.mockRestore();
  });
});

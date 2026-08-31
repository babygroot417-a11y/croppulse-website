const { createBlockData, classifyBlock, loadDashboard, closePopup } = require('../src/dashboard');

describe('createBlockData', () => {
  test('returns object with pH, moisture, pests, temperature', () => {
    const data = createBlockData();
    expect(data).toHaveProperty('pH');
    expect(data).toHaveProperty('moisture');
    expect(data).toHaveProperty('pests');
    expect(data).toHaveProperty('temperature');
  });

  test('pH is within expected range (5.2 - 8.0)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createBlockData();
      const pH = parseFloat(data.pH);
      expect(pH).toBeGreaterThanOrEqual(5.2);
      expect(pH).toBeLessThanOrEqual(8.0);
    }
  });

  test('moisture is within expected range (40 - 79)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createBlockData();
      expect(data.moisture).toBeGreaterThanOrEqual(40);
      expect(data.moisture).toBeLessThan(80);
    }
  });

  test('pests is within expected range (0 - 14)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createBlockData();
      expect(data.pests).toBeGreaterThanOrEqual(0);
      expect(data.pests).toBeLessThan(15);
    }
  });

  test('temperature is within expected range (18 - 34)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createBlockData();
      const temp = parseFloat(data.temperature);
      expect(temp).toBeGreaterThanOrEqual(18);
      expect(temp).toBeLessThanOrEqual(34);
    }
  });

  test('pH and temperature are strings with one decimal place', () => {
    const data = createBlockData();
    expect(data.pH).toMatch(/^\d+\.\d$/);
    expect(data.temperature).toMatch(/^\d+\.\d$/);
  });

  test('moisture and pests are integers', () => {
    const data = createBlockData();
    expect(Number.isInteger(data.moisture)).toBe(true);
    expect(Number.isInteger(data.pests)).toBe(true);
  });
});

describe('classifyBlock', () => {
  test('returns Healthy for rand > 0.65', () => {
    expect(classifyBlock(0.7)).toEqual({ status: 'Healthy', statusClass: 'healthy' });
    expect(classifyBlock(0.99)).toEqual({ status: 'Healthy', statusClass: 'healthy' });
  });

  test('returns Warning for 0.35 < rand <= 0.65', () => {
    expect(classifyBlock(0.5)).toEqual({ status: 'Warning', statusClass: 'warning' });
    expect(classifyBlock(0.36)).toEqual({ status: 'Warning', statusClass: 'warning' });
    expect(classifyBlock(0.65)).toEqual({ status: 'Warning', statusClass: 'warning' });
  });

  test('returns Critical for rand <= 0.35', () => {
    expect(classifyBlock(0.1)).toEqual({ status: 'Critical', statusClass: 'critical' });
    expect(classifyBlock(0.35)).toEqual({ status: 'Critical', statusClass: 'critical' });
    expect(classifyBlock(0.0)).toEqual({ status: 'Critical', statusClass: 'critical' });
  });

  test('boundary: 0.65 is Warning, 0.6500001 is Healthy', () => {
    expect(classifyBlock(0.65).status).toBe('Warning');
    expect(classifyBlock(0.6500001).status).toBe('Healthy');
  });

  test('boundary: 0.35 is Critical, 0.3500001 is Warning', () => {
    expect(classifyBlock(0.35).status).toBe('Critical');
    expect(classifyBlock(0.3500001).status).toBe('Warning');
  });
});

describe('loadDashboard', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="grid"></div>
      <div id="popup"></div>
      <div id="overlay"></div>
      <div id="popupTitle"></div>
      <div id="popupContent"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('creates 36 grid blocks', () => {
    loadDashboard();
    const blocks = document.getElementById('grid').children;
    expect(blocks).toHaveLength(36);
  });

  test('each block has grid-block class', () => {
    loadDashboard();
    const blocks = document.getElementById('grid').children;
    for (let i = 0; i < blocks.length; i++) {
      expect(blocks[i].classList.contains('grid-block')).toBe(true);
    }
  });

  test('each block has a status class', () => {
    loadDashboard();
    const blocks = document.getElementById('grid').children;
    const validClasses = ['healthy', 'warning', 'critical'];
    for (let i = 0; i < blocks.length; i++) {
      const hasStatus = validClasses.some(cls => blocks[i].classList.contains(cls));
      expect(hasStatus).toBe(true);
    }
  });

  test('each block displays its number', () => {
    loadDashboard();
    const blocks = document.getElementById('grid').children;
    expect(blocks[0].textContent).toBe('#1');
    expect(blocks[35].textContent).toBe('#36');
  });

  test('clears existing grid content', () => {
    const grid = document.getElementById('grid');
    grid.innerHTML = '<div>old</div><div>content</div>';
    loadDashboard();
    expect(grid.children).toHaveLength(36);
  });

  test('clicking a block shows the popup', () => {
    loadDashboard();
    const firstBlock = document.getElementById('grid').children[0];
    firstBlock.onclick();
    expect(document.getElementById('popup').classList.contains('show')).toBe(true);
    expect(document.getElementById('overlay').classList.contains('show')).toBe(true);
  });

  test('clicking a block sets popup title', () => {
    loadDashboard();
    const firstBlock = document.getElementById('grid').children[0];
    firstBlock.onclick();
    const title = document.getElementById('popupTitle').textContent;
    expect(title).toMatch(/^Block 1 - (Healthy|Warning|Critical)$/);
  });

  test('clicking a block populates popup content', () => {
    loadDashboard();
    const firstBlock = document.getElementById('grid').children[0];
    firstBlock.onclick();
    const content = document.getElementById('popupContent').innerHTML;
    expect(content).toContain('Status');
    expect(content).toContain('pH Level');
    expect(content).toContain('Moisture');
    expect(content).toContain('Pest Risk');
    expect(content).toContain('Temperature');
  });
});

describe('closePopup', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="popup" class="show"></div>
      <div id="overlay" class="show"></div>
    `;
  });

  test('removes show class from popup', () => {
    closePopup();
    expect(document.getElementById('popup').classList.contains('show')).toBe(false);
  });

  test('removes show class from overlay', () => {
    closePopup();
    expect(document.getElementById('overlay').classList.contains('show')).toBe(false);
  });

  test('works when popup is already hidden', () => {
    document.getElementById('popup').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    expect(() => closePopup()).not.toThrow();
  });
});

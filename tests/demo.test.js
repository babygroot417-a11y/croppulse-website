const { classifyDemoBlock, createDemoData, runDemo, initTheme } = require('../src/demo');

describe('classifyDemoBlock', () => {
  test('returns Healthy for rand > 0.65', () => {
    expect(classifyDemoBlock(0.8)).toEqual({ status: 'Healthy', statusClass: 'healthy' });
  });

  test('returns Warning for 0.35 < rand <= 0.65', () => {
    expect(classifyDemoBlock(0.5)).toEqual({ status: 'Warning', statusClass: 'warning' });
  });

  test('returns Critical for rand <= 0.35', () => {
    expect(classifyDemoBlock(0.2)).toEqual({ status: 'Critical', statusClass: 'critical' });
  });

  test('boundary values', () => {
    expect(classifyDemoBlock(0.65).status).toBe('Warning');
    expect(classifyDemoBlock(0.6500001).status).toBe('Healthy');
    expect(classifyDemoBlock(0.35).status).toBe('Critical');
    expect(classifyDemoBlock(0.3500001).status).toBe('Warning');
  });
});

describe('createDemoData', () => {
  test('returns object with pH, moisture, pests, temperature', () => {
    const data = createDemoData();
    expect(data).toHaveProperty('pH');
    expect(data).toHaveProperty('moisture');
    expect(data).toHaveProperty('pests');
    expect(data).toHaveProperty('temperature');
  });

  test('pH is within range (5.0 - 8.0)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createDemoData();
      const pH = parseFloat(data.pH);
      expect(pH).toBeGreaterThanOrEqual(5.0);
      expect(pH).toBeLessThanOrEqual(8.0);
    }
  });

  test('moisture is within range (0 - 99)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createDemoData();
      expect(data.moisture).toBeGreaterThanOrEqual(0);
      expect(data.moisture).toBeLessThan(100);
    }
  });

  test('pests is within range (0 - 19)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createDemoData();
      expect(data.pests).toBeGreaterThanOrEqual(0);
      expect(data.pests).toBeLessThan(20);
    }
  });

  test('temperature is within range (20 - 35)', () => {
    for (let i = 0; i < 50; i++) {
      const data = createDemoData();
      const temp = parseFloat(data.temperature);
      expect(temp).toBeGreaterThanOrEqual(20);
      expect(temp).toBeLessThanOrEqual(35);
    }
  });
});

describe('runDemo', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="grid"></div>
      <div id="popup"></div>
      <div id="popupContent"></div>
      <div id="popupStatus"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('creates 36 grid blocks', () => {
    runDemo();
    expect(document.getElementById('grid').children).toHaveLength(36);
  });

  test('each block has grid-block class', () => {
    runDemo();
    const blocks = document.getElementById('grid').children;
    for (let i = 0; i < blocks.length; i++) {
      expect(blocks[i].classList.contains('grid-block')).toBe(true);
    }
  });

  test('each block has a status class', () => {
    runDemo();
    const blocks = document.getElementById('grid').children;
    const validClasses = ['healthy', 'warning', 'critical'];
    for (let i = 0; i < blocks.length; i++) {
      const hasStatus = validClasses.some(cls => blocks[i].classList.contains(cls));
      expect(hasStatus).toBe(true);
    }
  });

  test('each block has dataset status and index', () => {
    runDemo();
    const blocks = document.getElementById('grid').children;
    expect(blocks[0].dataset.index).toBe('1');
    expect(['Healthy', 'Warning', 'Critical']).toContain(blocks[0].dataset.status);
  });

  test('hovering a block shows the popup', () => {
    runDemo();
    const firstBlock = document.getElementById('grid').children[0];
    firstBlock.onmouseover();
    expect(document.getElementById('popup').classList.contains('show')).toBe(true);
  });

  test('hovering a block sets popup status text', () => {
    runDemo();
    const firstBlock = document.getElementById('grid').children[0];
    firstBlock.onmouseover();
    const status = document.getElementById('popupStatus').textContent;
    expect(status).toMatch(/^Block 1 - (Healthy|Warning|Critical)$/);
  });

  test('hovering a block populates popup content', () => {
    runDemo();
    const firstBlock = document.getElementById('grid').children[0];
    firstBlock.onmouseover();
    const content = document.getElementById('popupContent').innerHTML;
    expect(content).toContain('Status');
    expect(content).toContain('pH');
    expect(content).toContain('Moisture');
    expect(content).toContain('Pest Risk');
    expect(content).toContain('Temp');
  });

  test('mouseout hides the popup', () => {
    runDemo();
    const firstBlock = document.getElementById('grid').children[0];
    firstBlock.onmouseover();
    expect(document.getElementById('popup').classList.contains('show')).toBe(true);
    firstBlock.onmouseout();
    expect(document.getElementById('popup').classList.contains('show')).toBe(false);
  });

  test('clears grid before populating', () => {
    const grid = document.getElementById('grid');
    grid.innerHTML = '<div>old</div>';
    runDemo();
    expect(grid.children).toHaveLength(36);
  });
});

describe('initTheme', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="grid"></div>
      <div id="popup"></div>
      <div id="popupContent"></div>
      <div id="popupStatus"></div>
    `;
  });

  test('calls runDemo and populates grid', () => {
    initTheme();
    expect(document.getElementById('grid').children).toHaveLength(36);
  });
});

path = require('path');

jest.mock('fs-extra', () => ({
  readdirSync: jest.fn((folder) => {
    if (folder === 'tests/testSetupsFolder') {
      return ['bmwm4gt3'];
    } else {
      return [
        '25S2 W05 IMSA Acura Imola',
        '25S2 W05 GT3 Acura Watkins Glen',
        '25S2 W05 NEC Acura Nordschleife',
        '25S2 W06 IMSA Acura Monza',
      ];
    }
  }),
  existsSync: jest.fn(() => true),
}));

const { loadDataPacksForSeries, loadTargetForDatapack, parseDatapackName } = require('../services/gng');

test('parseDatapackName parses simple case, all one word', () => {
  const datapackName = '25S2 W05 IMSA Acura Imola';
  const expected = {
    seasonYear: '25',
    seasonNo: '2',
    week: '05',
    series: 'IMSA',
    track: 'Imola',
  };

  const result = parseDatapackName(datapackName);

  expect(result).not.toBeNull();
  expect(result.seasonYear).toBe(expected.seasonYear);
  expect(result.seasonNo).toBe(expected.seasonNo);
  expect(result.week).toBe(expected.week);
  expect(result.series).toBe(expected.series);
  expect(result.track).toBe(expected.track);
});

test('parseDatapackName parses when car has a minus sign', () => {
  const datapackName = '25S2 W05 IMSA BMW-GT4 Imola';
  const expected = {
    seasonYear: '25',
    seasonNo: '2',
    week: '05',
    series: 'IMSA',
    track: 'Imola',
  };

  const result = parseDatapackName(datapackName);

  expect(result).not.toBeNull();
  expect(result.seasonYear).toBe(expected.seasonYear);
  expect(result.seasonNo).toBe(expected.seasonNo);
  expect(result.week).toBe(expected.week);
  expect(result.series).toBe(expected.series);
  expect(result.track).toBe(expected.track);
});

test('parseDatapackName parses track with two words', () => {
  const datapackName = '25S1 W01 IMSA ARX Watkins Glen';

  const result = parseDatapackName(datapackName);

  expect(result).not.toBeNull();
  expect(result.track).toBe('Watkins-Glen');
});

test('parseDatapackName parses series with minus sign', () => {
  const datapackName = '25S2 W05 GT-Sprint Acura Road America';

  const result = parseDatapackName(datapackName);

  expect(result).not.toBeNull();
  expect(result.series).toBe('GT3');
});

test('parseDatapackName parses WET/Wet track', () => {
  let datapackName = '25S2 W05 NEC M4 Nordschleife WET';

  let result = parseDatapackName(datapackName);

  expect(result).not.toBeNull();
  expect(result.isWet).toBe(true);

  datapackName = '25S2 W05 NEC M4 Nordschleife Wet';

  result = parseDatapackName(datapackName);

  expect(result).not.toBeNull();
  expect(result.isWet).toBe(true);
});

test('loadDataPacksForSeries filters by single series and multiple weeks', () => {
  const series = 'IMSA';
  const setupsFolder = 'tests/testSetupsFolder';
  const expectedCar = 'bmwm4gt3';

  const result = loadDataPacksForSeries({series:[series], weeks: ['05', '06']}, setupsFolder, '25', '2');

  expect(result).not.toBeNull();
  expect(result[expectedCar]).not.toBeNull();
  expect(result[expectedCar].car).toBe(expectedCar);
  expect(result[expectedCar].dataPacks).not.toBeNull();
  expect(result[expectedCar].dataPacks.length).toBe(2);
  for (const dataPack of result[expectedCar].dataPacks) {
    expect(dataPack.series).toBe(series);
  }
});

test('loadDataPacksForSeries filters by multiple series and weeks', () => {
  const setupsFolder = 'tests/testSetupsFolder';
  const expectedCar = 'bmwm4gt3';

  const result = loadDataPacksForSeries({series: ['IMSA', 'GT3'], weeks: ['05','06']}, setupsFolder, '25', '2');

  expect(result[expectedCar].dataPacks.length).toBe(3);
});

test('loadDataPacksForSeries filters by single week', () => {
  const setupsFolder = 'tests/testSetupsFolder';
  const expectedCar = 'bmwm4gt3';

  const result = loadDataPacksForSeries({'series': ['IMSA', 'GT3'], weeks: ['05']}, setupsFolder, '25', '2');

  expect(result[expectedCar].dataPacks.length).toBe(2);
});

test('loadTargetForDatapack generates target folder', () => {
  const car = 'bmwm4gt3';
  const dataPack = {
    seasonYear: '25',
    seasonNo: '2',
    week: '05',
    series: 'IMSA',
    track: 'Imola',
    isWet: false,
    destFolderTemplate: '{base}\\{car}',
  };

  const result = loadTargetForDatapack(car, 'base\\path', dataPack);

  expect(result).toBe(path.join('base', 'path', 'bmwm4gt3'));
});
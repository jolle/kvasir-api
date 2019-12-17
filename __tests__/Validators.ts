import { isValidCourseId } from '../src/Validators';

describe('validators', () => {
  it('allows regular course IDs', () => {
    expect(isValidCourseId('FY09-1')).toBe(true);
    expect(isValidCourseId('BI01-1')).toBe(true);
  });

  it('allows course IDs with umlauts', () => {
    expect(isValidCourseId('ÄI05-2')).toBe(true);
    expect(isValidCourseId('IÖ01-3')).toBe(true);
  });

  it('allows course IDs with only one letter', () => {
    expect(isValidCourseId('S203-1')).toBe(true);
  });

  it('allows KV (language exchange) course IDs', () => {
    expect(isValidCourseId('KVRA-1')).toBe(true);
    expect(isValidCourseId('KVKI1-1')).toBe(true);
    expect(isValidCourseId('KVEN-1')).toBe(true);
  });

  it('allows additional school course IDs', () => {
    expect(isValidCourseId('APO63-1')).toBe(true);
    expect(isValidCourseId('APO7-sijoitusklubi')).toBe(true);
  });

  it('allows PE course IDs', () => {
    expect(isValidCourseId('LI03-Koripallo tytöt')).toBe(true);
  });

  it('allows RO course IDs', () => {
    expect(isValidCourseId('RO19-A')).toBe(true);
    expect(isValidCourseId('RO20-G')).toBe(true);
  });

  it('allows foreign language course IDs', () => {
    expect(isValidCourseId('ENA20-2')).toBe(true);
    expect(isValidCourseId('RAB305-3')).toBe(true);
  });

  it('allows advanced/non-advanced math course IDs', () => {
    expect(isValidCourseId('MAA04-2')).toBe(true);
    expect(isValidCourseId('MAB03-1')).toBe(true);
  });

  it('disallows outright violations', () => {
    expect(isValidCourseId('notacourse')).toBe(false);
    expect(isValidCourseId('HELLO')).toBe(false);
    expect(isValidCourseId('-')).toBe(false);
  });
});

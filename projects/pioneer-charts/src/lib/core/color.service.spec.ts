import { TestBed } from '@angular/core/testing';
import { PcacColorService } from './color.service';

describe('PcacColorService', () => {
  let service: PcacColorService;

  beforeEach(() => {
    service = TestBed.inject(PcacColorService);
  });

  it('cycles the default palette past its end', () => {
    const scale = service.getColorScale(8);

    expect(scale).toHaveLength(8);
    expect(scale[6]).toBe(scale[0]);
    expect(scale[7]).toBe(scale[1]);
  });

  // Regression test: the palette was a copy of the color fields taken when the service was
  // created, so these setters changed nothing a chart drew.
  it('draws the palette from the current colors, so the setters take effect', () => {
    service.setPrimaryLight('#000001');
    service.setSuccess('#000002');
    service.setDanger('#000003');
    service.setWarning('#000004');
    service.setOrange('#000005');
    service.setBlue('#000006');

    expect(service.getColorScale(6)).toEqual([
      '#000001', '#000002', '#000003', '#000004', '#000005', '#000006',
    ]);
  });

  it('uses a scale given to setScale() in place of the default palette', () => {
    service.setScale(['#aaa', '#bbb']);

    expect(service.getColorScale(3)).toEqual(['#aaa', '#bbb', '#aaa']);
  });

  it('does not keep a reference to the array given to setScale()', () => {
    const colors = ['#aaa'];
    service.setScale(colors);
    colors.push('#bbb');

    expect(service.getColorScale(2)).toEqual(['#aaa', '#aaa']);
  });

  // Regression test: an empty scale made every index `i % 0` - NaN - and every color undefined.
  it('goes back to the default palette when setScale() is given nothing', () => {
    const defaults = service.getColorScale(6);
    service.setScale(['#aaa']);
    service.setScale([]);

    expect(service.getColorScale(6)).toEqual(defaults);
  });
});

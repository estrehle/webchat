import { ColorPickerService } from './color-picker.service';

describe('ColorPickerService', () => {
  let colorPickerService: ColorPickerService;

  beforeEach(() => {
    colorPickerService = new ColorPickerService();
  });

  it('should return color code', async () => {
    const res = colorPickerService.nextColor();

    expect(typeof res).toEqual('string');
    expect(res.length).toEqual(1 + 6); // '#' plus 6-letter hex code
    expect(res[0]).toEqual('#');
  });

  it('should return different colors on subsequent calls', async () => {
    const res0 = colorPickerService.nextColor();
    const res1 = colorPickerService.nextColor();

    expect(res0).not.toEqual(res1);
  });
});

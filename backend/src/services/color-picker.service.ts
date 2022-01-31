import { Injectable } from '@nestjs/common';

@Injectable()
export class ColorPickerService {
  private count = 0;
  private readonly colors: string[] = [
    '#4e79a7',
    '#f28e2b',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc948',
    '#b07aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ac',
  ];

  nextColor(): string {
    const idx = ++this.count % this.colors.length;
    return this.colors[idx];
  }
}

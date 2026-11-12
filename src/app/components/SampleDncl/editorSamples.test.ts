import { checkDNCLSyntax, flattenTree } from '@/app/utilities';
import { cnvToJs } from '@/app/utilities/cnvToJs';
import { editorSamples } from './editorSamples';

describe('editor samples', () => {
  it('provides samples for sequence, branching, loops, and functions', () => {
    expect(editorSamples.map(sample => sample.id)).toEqual([
      'sequence',
      'branch',
      'while',
      'for',
      'function',
    ]);
  });

  it('creates unique, editable items for every sample', () => {
    editorSamples.forEach(sample => {
      const items = sample.createItems();
      const flattened = flattenTree(items);
      const ids = flattened.map(item => item.id);

      expect(new Set(ids).size).toBe(ids.length);
      expect(flattened.length).toBeGreaterThan(0);
      expect(flattened.every(item => item.formData && item.processIndex !== undefined)).toBe(true);
    });
  });

  it('passes DNCL structure validation for every sample', () => {
    editorSamples.forEach(sample => {
      const flattened = flattenTree(sample.createItems());
      const errors = flattened.flatMap((item, index) =>
        checkDNCLSyntax(flattened, item, index + 1).errors
      );

      expect(errors).toEqual([]);
    });
  });

  it.each([
    ['sequence', [5]],
    ['branch', [80]],
    ['while', [1, 2, 3]],
    ['for', [1, 2, 3, 4, 5]],
    ['function', [6]],
  ])('runs the %s sample and produces its expected output', async (sampleId, expectedOutput) => {
    const sample = editorSamples.find(item => item.id === sampleId)!;
    const flattened = flattenTree(sample.createItems());
    const code = await Promise.all(flattened.map(item =>
      cnvToJs({
        lineTokens: item.lineTokens ?? [],
        processIndex: Number(item.processIndex),
        isConstant: item.isConstant,
      })
    ));
    const output: number[] = [];
    const run = new Function('console', code.join('\n'));

    run({ log: (value: number) => output.push(value) });

    expect(output).toEqual(expectedOutput);
  });
});

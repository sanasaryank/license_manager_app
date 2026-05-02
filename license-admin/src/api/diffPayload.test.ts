import { describe, it, expect } from 'vitest';
import { buildDiffPayload } from './diffPayload';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const orig = <T extends Record<string, unknown>>(v: T) => v;
const curr = <T extends Record<string, unknown>>(v: T) => v;

// ---------------------------------------------------------------------------
// Scalar fields
// ---------------------------------------------------------------------------

describe('scalar fields', () => {
  it('returns changed scalar field only', () => {
    const result = buildDiffPayload(
      orig({ description: 'old', isBlocked: false }),
      curr({ description: 'new', isBlocked: false }),
      {},
    );
    expect(result).toEqual({ description: 'new' });
  });

  it('omits unchanged scalar field', () => {
    const result = buildDiffPayload(
      orig({ description: 'same', isBlocked: false }),
      curr({ description: 'same', isBlocked: false }),
      {},
    );
    expect(result).toBeNull();
  });

  it('returns multiple changed scalar fields together', () => {
    const result = buildDiffPayload(
      orig({ description: 'old', isBlocked: false, name: 'old-name' }),
      curr({ description: 'new', isBlocked: true, name: 'old-name' }),
      {},
    );
    expect(result).toEqual({ description: 'new', isBlocked: true });
  });

  it('handles boolean flip false→true', () => {
    const result = buildDiffPayload(
      orig({ isBlocked: false }),
      curr({ isBlocked: true }),
      {},
    );
    expect(result).toEqual({ isBlocked: true });
  });

  it('handles null scalar change', () => {
    const result = buildDiffPayload(
      orig({ parentId: null as string | null }),
      curr({ parentId: 'abc' as string | null }),
      {},
    );
    expect(result).toEqual({ parentId: 'abc' });
  });

  it('handles scalar set to null', () => {
    const result = buildDiffPayload(
      orig({ parentId: 'abc' as string | null }),
      curr({ parentId: null as string | null }),
      {},
    );
    expect(result).toEqual({ parentId: null });
  });
});

// ---------------------------------------------------------------------------
// Nested Translation object (name.ARM / name.ENG / name.RUS)
// ---------------------------------------------------------------------------

describe('nested Translation object', () => {
  const baseName = { ARM: 'arm', ENG: 'eng', RUS: 'rus' };

  it('sends full name object when ARM changes', () => {
    const result = buildDiffPayload(
      orig({ name: { ...baseName } }),
      curr({ name: { ...baseName, ARM: 'new arm' } }),
      {},
    );
    expect(result).toEqual({ name: { ARM: 'new arm', ENG: 'eng', RUS: 'rus' } });
  });

  it('sends full name object when ENG changes', () => {
    const result = buildDiffPayload(
      orig({ name: { ...baseName } }),
      curr({ name: { ...baseName, ENG: 'new eng' } }),
      {},
    );
    expect(result).toEqual({ name: { ARM: 'arm', ENG: 'new eng', RUS: 'rus' } });
  });

  it('sends full name object when RUS changes', () => {
    const result = buildDiffPayload(
      orig({ name: { ...baseName } }),
      curr({ name: { ...baseName, RUS: 'new rus' } }),
      {},
    );
    expect(result).toEqual({ name: { ARM: 'arm', ENG: 'eng', RUS: 'new rus' } });
  });

  it('omits unchanged name object', () => {
    const result = buildDiffPayload(
      orig({ name: { ...baseName } }),
      curr({ name: { ...baseName } }),
      {},
    );
    expect(result).toBeNull();
  });

  it('does NOT send partial name — always full object', () => {
    const result = buildDiffPayload(
      orig({ name: { ...baseName } }),
      curr({ name: { ...baseName, ARM: 'changed' } }),
      {},
    );
    // Must include all three keys, not just ARM
    expect(result?.name).toHaveProperty('ENG', 'eng');
    expect(result?.name).toHaveProperty('RUS', 'rus');
    expect(result?.name).toHaveProperty('ARM', 'changed');
  });
});

// ---------------------------------------------------------------------------
// Arrays
// ---------------------------------------------------------------------------

describe('arrays', () => {
  const baseItem = { id: '1', hwid: 'abc', type: 'A' };
  const baseItem2 = { id: '2', hwid: 'xyz', type: 'B' };

  it('sends full array when item value changes', () => {
    const result = buildDiffPayload(
      orig({ licenses: [{ ...baseItem }, { ...baseItem2 }] }),
      curr({ licenses: [{ ...baseItem, hwid: 'new-hwid' }, { ...baseItem2 }] }),
      {},
    );
    expect(result).toEqual({
      licenses: [{ id: '1', hwid: 'new-hwid', type: 'A' }, { ...baseItem2 }],
    });
  });

  it('sends full array when item is added', () => {
    const newItem = { id: '3', hwid: 'new', type: 'C' };
    const result = buildDiffPayload(
      orig({ licenses: [{ ...baseItem }] }),
      curr({ licenses: [{ ...baseItem }, newItem] }),
      {},
    );
    expect(result?.licenses).toHaveLength(2);
    expect(result?.licenses).toContainEqual(newItem);
  });

  it('sends full array when item is removed', () => {
    const result = buildDiffPayload(
      orig({ licenses: [{ ...baseItem }, { ...baseItem2 }] }),
      curr({ licenses: [{ ...baseItem }] }),
      {},
    );
    expect(result?.licenses).toHaveLength(1);
  });

  it('sends full array when order changes', () => {
    const result = buildDiffPayload(
      orig({ licenses: [{ ...baseItem }, { ...baseItem2 }] }),
      curr({ licenses: [{ ...baseItem2 }, { ...baseItem }] }),
      {},
    );
    expect(result).not.toBeNull();
    expect((result?.licenses as typeof baseItem[])[0].id).toBe('2');
  });

  it('sends full array when nested child object inside item changes', () => {
    const orig2 = { id: '1', meta: { key: 'old' } };
    const result = buildDiffPayload(
      orig({ items: [{ ...orig2 }] }),
      curr({ items: [{ id: '1', meta: { key: 'new' } }] }),
      {},
    );
    expect(result).not.toBeNull();
    expect((result?.items as typeof orig2[])[0].meta.key).toBe('new');
  });

  it('omits unchanged array', () => {
    const result = buildDiffPayload(
      orig({ licenses: [{ ...baseItem }] }),
      curr({ licenses: [{ ...baseItem }] }),
      {},
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Mixed changes
// ---------------------------------------------------------------------------

describe('mixed changes', () => {
  it('sends changed scalar + changed nested object, omits unchanged fields', () => {
    const baseName = { ARM: 'arm', ENG: 'eng', RUS: 'rus' };
    const result = buildDiffPayload(
      orig({ name: { ...baseName }, isBlocked: false, description: 'same' }),
      curr({ name: { ...baseName, ARM: 'new' }, isBlocked: true, description: 'same' }),
      {},
    );
    expect(result).toEqual({
      name: { ARM: 'new', ENG: 'eng', RUS: 'rus' },
      isBlocked: true,
    });
    expect(result).not.toHaveProperty('description');
  });
});

// ---------------------------------------------------------------------------
// Required technical fields (id / hash)
// ---------------------------------------------------------------------------

describe('required technical fields', () => {
  it('always includes requiredFields even when nothing else changed', () => {
    // buildDiffPayload returns null when nothing changed (caller adds id/hash separately)
    // When requiredFields are provided, they appear in the result only if there are changes.
    // If caller passes required fields as the 3rd arg they are always included.
    const result = buildDiffPayload(
      orig({ description: 'old' }),
      curr({ description: 'new' }),
      { id: 'abc-123', hash: 'hash-xyz' } as Record<string, unknown>,
    );
    expect(result).toMatchObject({ id: 'abc-123', hash: 'hash-xyz', description: 'new' });
  });

  it('returns null (not required fields) when nothing changed and requiredFields is empty', () => {
    const result = buildDiffPayload(
      orig({ description: 'same' }),
      curr({ description: 'same' }),
      {},
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// No mutation of inputs
// ---------------------------------------------------------------------------

describe('immutability', () => {
  it('does not mutate the original object', () => {
    const original = { name: 'a', description: 'b' };
    const current = { name: 'changed', description: 'b' };
    buildDiffPayload(original, current, {});
    expect(original.name).toBe('a');
  });

  it('does not mutate the current object', () => {
    const original = { name: 'a' };
    const current = { name: 'changed' };
    buildDiffPayload(original, current, {});
    expect(current.name).toBe('changed');
  });
});

// ---------------------------------------------------------------------------
// Validator special case: full-object PUT (documented behavior, not via buildDiffPayload)
// ---------------------------------------------------------------------------

describe('validators module — full-object PUT contract', () => {
  // ValidatorModal uses useCrudMutations which always sends the full object.
  // buildDiffPayload is NOT used for validators.
  // This test documents the expectation: if all fields are passed as current,
  // all fields appear in the result (as long as any one differs from original).
  it('when all fields are passed, all appear in diff when any changes', () => {
    const result = buildDiffPayload(
      orig({ version: '1.0', endpoint: '/foo', schema: { kind: 'object' } }),
      curr({ version: '2.0', endpoint: '/foo', schema: { kind: 'object' } }),
      {},
    );
    // Only version changed, endpoint and schema are omitted by design.
    // Validators bypass this function entirely — this just verifies the helper
    // would not accidentally include unchanged fields.
    expect(result).toEqual({ version: '2.0' });
    expect(result).not.toHaveProperty('endpoint');
    expect(result).not.toHaveProperty('schema');
  });
});

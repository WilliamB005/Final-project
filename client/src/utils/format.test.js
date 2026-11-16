// Unit tests for isMine(): "is this room/message mine?"
// It decides whether the Edit and Delete buttons appear, so it's worth testing.
import { describe, it, expect } from 'vitest';
import { isMine } from './format';

const me = { id: 'u1', username: 'alice' };

describe('isMine', () => {
  it('is true when the id is mine (plain id string)', () => {
    expect(isMine('u1', me)).toBe(true);
  });

  it('is true when the id is mine (populated { _id, username } object)', () => {
    expect(isMine({ _id: 'u1', username: 'alice' }, me)).toBe(true);
  });

  it("is false for someone else's id", () => {
    expect(isMine('u2', me)).toBe(false);
  });

  it('is false when nobody is logged in', () => {
    expect(isMine('u1', null)).toBe(false);
  });
});

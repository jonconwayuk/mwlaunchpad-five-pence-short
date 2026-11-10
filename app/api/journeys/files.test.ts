import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { TAG_LISTS as FILE_TAGS } from '@/src/db/files';
import { TAG_LISTS } from '@/src/ui/components/journey-builder/constants';
import { journeyFilePath, readJourneyFile, syncSummary } from './files';

afterEach(() => { delete process.env.JOURNEYS_DIR; });

describe('journeyFilePath', () => {
  it.each(['../package', 'j-../../etc', 'j-a/b', 'J-Upper', 'j-', 'pw-infra-e', 'j-a.json', ''])('refuses %j, when it is not a Journey slug', (id) => {
    expect(() => journeyFilePath(id)).toThrow(/not a Journey id/);
  });
  it('points inside journeys/, when the id is a Journey slug', () => {
    expect(journeyFilePath('j-device-dev')).toBe(join(process.cwd(), 'journeys', 'j-device-dev.json'));
  });
});

describe('readJourneyFile', () => {
  it('returns the bytes on disk unchanged, when the file exists', () => {
    process.env.JOURNEYS_DIR = mkdtempSync(join(tmpdir(), 'g2-'));
    const text = '{\n  "id": "j-x"\n}\n';
    writeFileSync(join(process.env.JOURNEYS_DIR, 'j-x.json'), text);
    expect(readJourneyFile('j-x')).toEqual({ file: 'journeys/j-x.json', text });
  });
  it('returns undefined, when the Journey has no file', () => {
    process.env.JOURNEYS_DIR = mkdtempSync(join(tmpdir(), 'g2-'));
    expect(readJourneyFile('j-none')).toBeUndefined();
  });
});

describe('syncSummary', () => {
  it('counts added and updated, when anything changed', () => {
    expect(syncSummary({ added: ['j-a', 'j-b'], updated: ['j-c'] })).toBe('2 added, 1 updated');
  });
  it('says up to date, when nothing changed', () => {
    expect(syncSummary({ added: [], updated: [] })).toBe('Already up to date');
  });
});

describe('builder tag lists', () => {
  it('match the lists the Journey files are validated against, so every publish can be written', () => {
    expect(TAG_LISTS).toEqual(FILE_TAGS);
  });
});

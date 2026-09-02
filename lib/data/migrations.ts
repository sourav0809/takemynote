interface Migration {
  from: number;
  to: number;
  migrate: (raw: unknown) => unknown;
}

// Empty today; add entries here whenever the Note/Category shape changes,
// each bumping schemaVersion by one step so existing users' stored data
// is transformed forward before anything else touches it.
const MIGRATIONS: Migration[] = [];

export function runMigrations(rawNotes: unknown, fromVersion: number, toVersion: number): unknown {
  let data = rawNotes;
  let version = fromVersion;

  while (version < toVersion) {
    const migration = MIGRATIONS.find((entry) => entry.from === version);
    if (!migration) break;
    data = migration.migrate(data);
    version = migration.to;
  }

  return data;
}

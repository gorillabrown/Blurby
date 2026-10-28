# Data Migrations

Migrations are defined inline in `main.js` in the `settingsMigrations` and `libraryMigrations` arrays.

## How it works

1. Each JSON file (`settings.json`, `library.json`) contains a `schemaVersion` field
2. On startup, `loadState()` checks the stored version against `CURRENT_*_SCHEMA`
3. If the stored version is older, a `.bak` backup is created before migrating
4. Migration functions run sequentially: v0→v1, v1→v2, etc.

## Adding a new migration

1. Increment `CURRENT_SETTINGS_SCHEMA` or `CURRENT_LIBRARY_SCHEMA` in `main.js`
2. Add a migration function to the corresponding array
3. The function receives the full data object and must return the updated object with the new `schemaVersion`

### Template

```js
// Example: v1 → v2 settings migration
(data) => {
  // Add new field with default
  data.newField = data.newField ?? "default";
  data.schemaVersion = 2;
  return data;
}
```

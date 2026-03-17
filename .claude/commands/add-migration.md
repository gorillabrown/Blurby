Create a new data schema migration.

The user will describe what schema change they need (e.g., "add a tags field to documents").

Steps:
1. Read the current `CURRENT_SETTINGS_SCHEMA` and `CURRENT_LIBRARY_SCHEMA` values in `main.js`
2. Determine which file needs migration (settings or library)
3. Increment the appropriate `CURRENT_*_SCHEMA` constant
4. Add a new migration function to the `settingsMigrations` or `libraryMigrations` array
5. The migration function must:
   - Accept the data from the previous version
   - Apply the transformation with sensible defaults for new fields
   - Set `schemaVersion` to the new version number
   - Return the updated data
6. Add a test for the new migration in `tests/migrations.test.js`:
   - Test that old data is migrated correctly
   - Test that the new field has the expected default value
   - Test that existing data is preserved
7. Run `npm test` to verify
8. Report what was changed

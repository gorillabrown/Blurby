"use strict";
// main/ipc-handlers.js — Thin coordinator: delegates to domain modules in main/ipc/

/**
 * Register all IPC handlers.
 * @param {object} ctx - Shared application context
 */
function registerIpcHandlers(ctx) {
  require("./ipc/state").register(ctx);
  require("./ipc/library").register(ctx);
  require("./ipc/documents").register(ctx);
  require("./ipc/reader").register(ctx);
  require("./ipc/stats").register(ctx);
  require("./ipc/cloud").register(ctx);
  require("./ipc/tts").register(ctx);
  require("./ipc/misc").register(ctx);
  require("./ipc/bug-report").register(ctx);
}

module.exports = {
  registerIpcHandlers,
  // Re-export pure functions for testing (now live in domain modules)
  formatHighlightEntry: require("./ipc/reader").formatHighlightEntry,
  parseDefinitionResponse: require("./ipc/reader").parseDefinitionResponse,
};

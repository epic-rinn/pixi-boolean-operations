import { initApplication } from "./pixi";
import { handleError } from "./pixi/errors";
import { bindModeEvents } from "./pixi/modes";
import { MODE, pixiStore } from "./services/Store";

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".canvas-container");
  const app = await initApplication(container);
  window.pixiStore = pixiStore;
  bindModeEvents(app);

  // Error display event
  window.addEventListener("pixiError", handleError);

  // Set default mode
  pixiStore[MODE] = "select";

  // For debugging
  window.store = pixiStore;
});

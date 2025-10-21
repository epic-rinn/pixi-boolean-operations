import { initApplication } from "./pixi";
import { handleError } from "./pixi/errors";
import { bindModeEvents } from "./pixi/modes";
import { MODE, pixiStore } from "./services/Store";
import { OnboardingManager } from "./services/OnboardingManager";
import { OnboardingEventManager } from "./services/OnboardingEventManager";

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".canvas-container");
  const app = await initApplication(container);
  window.pixiStore = pixiStore;
  bindModeEvents(app);

  // Error display event
  window.addEventListener("pixiError", handleError);

  // Set default mode
  pixiStore[MODE] = "select";

  // Initialize onboarding system
  const onboardingEventManager = new OnboardingEventManager();
  const onboardingManager = new OnboardingManager(onboardingEventManager);
  
  // Start onboarding if not completed
  if (!onboardingManager.isCompleted()) {
    onboardingManager.start();
  }

  // For debugging
  window.store = pixiStore;
  window.onboarding = onboardingManager;
});

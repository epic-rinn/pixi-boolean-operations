import polybool from "polybooljs";
import { polygonsToExecutable } from "../utils/index.js";
import { pixiStore, MODE, POLYGONS, SELECTED_POLYGON } from "./Store.js";

/**
 * OnboardingEventManager handles custom events for onboarding progression
 */
export class OnboardingEventManager {
  constructor() {
    this.eventListeners = new Map();
    this.previousPolygonCount = 0;
    this.previousMode = null;

    this.setupEventListeners();
  }

  /**
   * Setup all event listeners for onboarding detection
   */
  setupEventListeners() {
    // Listen for mode changes
    this.addEventListenerWithCleanup("modeChanged", () => {
      this.handleModeChange();
    });

    // Listen for polygon changes
    this.addEventListenerWithCleanup("polygonsChanged", () => {
      this.handlePolygonChange();
    });

    // Listen for polygon selection changes
    this.addEventListenerWithCleanup("polygonsSelected", () => {
      this.handlePolygonSelection();
    });

    // Listen for errors (merge/split failures)
    this.addEventListenerWithCleanup("pixiError", (e) => {
      this.handlePixiError(e);
    });

    // Store initial state
    this.previousPolygonCount = pixiStore[POLYGONS].length;
    this.previousMode = pixiStore[MODE];
  }

  /**
   * Add event listener with cleanup tracking
   */
  addEventListenerWithCleanup(event, handler, target = window) {
    target.addEventListener(event, handler);
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, []);
    }
    this.eventListeners.get(target).push({ event, handler });
  }

  /**
   * Handle mode changes and dispatch custom events
   */
  handleModeChange() {
    const currentMode = pixiStore[MODE];

    if (this.previousMode !== currentMode) {
      // Dispatch tool change event
      this.dispatchCustomEvent("tool:changed", {
        previousTool: this.previousMode,
        currentTool: currentMode,
      });

      this.previousMode = currentMode;
    }
  }

  /**
   * Handle polygon changes and detect creation/split/merge events
   */
  handlePolygonChange() {
    const currentPolygons = pixiStore[POLYGONS];
    const currentCount = currentPolygons.length;
    if (currentCount > this.previousPolygonCount) {
      // New polygon(s) created
      const newPolygons = currentCount - this.previousPolygonCount;

      if (newPolygons === 1 && pixiStore[MODE] === "pen") {
        const newPolygon = currentPolygons[currentPolygons.length - 1];
        // Single polygon created
        this.dispatchCustomEvent("polygon:created", {
          polygon: newPolygon,
          totalPolygons: currentCount,
          touchesExisting: this.checkIfTouchesExisting(
            newPolygon,
            currentPolygons.slice(0, -1)
          ),
        });
      } else if (newPolygons >= 1 && pixiStore[MODE] === "split") {
        this.dispatchCustomEvent("polygon:split", {
          newPolygons: currentPolygons.slice(this.previousPolygonCount),
          totalPolygons: currentCount,
          splitCount: newPolygons,
        });
      }
    } else {
      // Polygon(s) removed/merged
      const removedCount = this.previousPolygonCount - currentCount;

      this.dispatchCustomEvent("polygon:merged", {
        remainingPolygons: currentPolygons,
        totalPolygons: currentCount,
        mergedCount: removedCount + 1, // +1 because merge combines multiple into one
      });
    }

    this.previousPolygonCount = currentCount;
  }

  /**
   * Handle polygon selection changes
   */
  handlePolygonSelection() {
    const currentSelected = pixiStore[SELECTED_POLYGON];
    const currentCount = currentSelected.length;

    this.dispatchCustomEvent("polygon:selected", {
      selectedPolygons: currentSelected,
      selectedCount: currentCount,
    });
  }

  /**
   * Handle PIXI errors (merge/split failures)
   */
  handlePixiError(event) {
    const errorMessage = event.detail?.message || "Unknown error";

    if (
      errorMessage.includes("touching") ||
      errorMessage.includes("intersecting")
    ) {
      this.dispatchCustomEvent("polygon:merge:failed", {
        reason: "not_touching",
        message: errorMessage,
      });
    } else if (
      errorMessage.includes("slicing") ||
      errorMessage.includes("target polygon")
    ) {
      this.dispatchCustomEvent("polygon:split:failed", {
        reason: "no_intersection",
        message: errorMessage,
      });
    }
  }

  /**
   * Check if a polygon touches any existing polygons
   */
  checkIfTouchesExisting(newPolygon, existingPolygons) {
    if (existingPolygons.length === 0) return false;

    const boundary = polygonsToExecutable(newPolygon);

    for (let i = 0; i < existingPolygons.length; i++) {
      const polygonPoints = polygonsToExecutable(existingPolygons[i]);

      const result = polybool.intersect(polygonPoints, boundary);
      if (result.regions?.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Dispatch a custom event
   */
  dispatchCustomEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);
  }

  /**
   * Get current state for debugging
   */
  getCurrentState() {
    return {
      polygonCount: pixiStore[POLYGONS].length,
      selectedCount: pixiStore[SELECTED_POLYGON].length,
      currentMode: pixiStore[MODE],
      polygons: pixiStore[POLYGONS],
      selectedPolygons: pixiStore[SELECTED_POLYGON],
    };
  }

  /**
   * Cleanup all event listeners
   */
  cleanup() {
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler }) => {
        target.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
  }

  /**
   * Destroy the event manager
   */
  destroy() {
    this.cleanup();
  }
}

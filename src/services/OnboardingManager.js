import Shepherd from "shepherd.js";
import { pixiStore, MODE } from "./Store.js";
import { offset } from "@floating-ui/dom";

/**
 * OnboardingManager handles the Shepherd.js tour for the PIXI Boolean Operations app
 */
export class OnboardingManager {
  constructor() {
    this.tour = null;
    this.currentStep = 0;
    this.isActive = false;
    this.eventListeners = new Map();
    this.polygonCount = 0;
    this.hasCreatedTouchingPolygon = false;
    this.hasSplitPolygon = false;
    this.hasMergedPolygons = false;

    // Load completion state from localStorage
    this.completedSteps = this.loadCompletionState();

    this.initializeTour();
    this.setupEventListeners();
  }

  /**
   * Load onboarding completion state from localStorage
   */
  loadCompletionState() {
    try {
      const saved = localStorage.getItem("pixi-onboarding-completed");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save completion state to localStorage
   */
  saveCompletionState() {
    try {
      localStorage.setItem(
        "pixi-onboarding-completed",
        JSON.stringify(this.completedSteps)
      );
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Check if user has completed the onboarding
   */
  isOnboardingCompleted() {
    return this.completedSteps.includes("completed");
  }

  /**
   * Check if onboarding has been completed
   */
  isCompleted() {
    return this.completedSteps.includes("completed");
  }

  /**
   * Start the onboarding tour
   */
  start() {
    if (this.isCompleted()) {
      return;
    }
    this.startTour();
  }

  /**
   * Initialize the Shepherd.js tour with all steps
   */
  initializeTour() {
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: "shepherd-theme-custom",
        scrollTo: false,
        cancelIcon: {
          enabled: true,
        },
        modalOverlayOpeningPadding: 4,
        modalOverlayOpeningRadius: 8,
        floatingUIOptions: {
          middleware: [
            offset({ mainAxis: 20, crossAxis: 20, alignmentAxis: 20 }),
          ],
        },
      },
    });

    // Step 0: Welcome
    this.tour.addStep({
      title: "Let's Go!",
      text: `
        <div class="shepherd-text">
          <p>You'll master 4 quick moves:</p>
          <div class="shepherd-steps-list">
            <div class="shepherd-step-item">1️⃣ Draw a polygon</div>
            <div class="shepherd-step-item">2️⃣ Split it</div>
            <div class="shepherd-step-item">3️⃣ Add a touching one</div>
            <div class="shepherd-step-item">4️⃣ Merge them</div>
          </div>
        </div>
      `,
      attachTo: {
        element: ".canvas-container",
      },
      buttons: [
        {
          text: "Skip",
          classes: "shepherd-button-secondary",
          action: () => this.skipTour(),
        },
        {
          text: "Let's Go",
          classes: "shepherd-button-primary",
          action: () => this.tour.next(),
        },
      ],
      id: "welcome",
    });

    // Step 1: Draw a Polygon (Pen Tool)
    this.tour.addStep({
      title: "Step 1 · Draw A Polygon!",
      text: `
        <div class="shepherd-text">
          <p>Click <strong>Pen</strong> to start drawing.</p>
        </div>
      `,
      attachTo: {
        element: "#pen",
        on: "top",
      },
      id: "draw-polygon",
      when: {
        show: () => {
          this.highlightElement("#pen");
        },
      },
    });

    // Step 1.5: Drawing Instructions (shown after pen tool selected)
    this.tour.addStep({
      title: "Pen is Active!",
      text: `
        <div class="shepherd-text">
          <p>Click the canvas to drop points.</p>
          <p>Click on the first point to close the shape (needs 3+ points).</p>
        </div>
      `,
      attachTo: {
        element: ".canvas-container",
        on: "top",
      },
      id: "drawing-instructions",
      when: {
        show: () => {
          this.highlightElement(".canvas-container");
        },
        hide: () => {
          this.removeHighlight(".canvas-container");
        },
      },
    });

    // Step 2: Split a Polygon
    this.tour.addStep({
      title: "Step 2 · Time to Slice",
      text: `
        <div class="shepherd-text">
          <p>Choose <strong>Split</strong>, draw another polygon overlapping your first one.</p>
        </div>
      `,
      attachTo: {
        element: "#split",
        on: "bottom",
      },
      id: "split-polygon",
      when: {
        show: () => {
          this.highlightElement("#split");
          this.waitForToolChange("split");
        },
      },
    });

    // Step 2.5: Split by Touching
    this.tour.addStep({
      title: "Step 2.5 · Split",
      text: `
        <div class="shepherd-text">
          <p>Choose <strong>Split</strong>, draw another polygon overlapping your first one,</p>
          <p>and double-click to cut!</p>
        </div>
      `,
      attachTo: {
        element: ".canvas-container",
        on: "top",
      },
      id: "splitting-instructions",
      when: {
        show: () => {
          this.highlightElement(".canvas-container");
        },
        hide: () => {
          this.removeHighlight(".canvas-container");
        },
      },
    });

    // Step 3: Draw Touching Polygon
    this.tour.addStep({
      title: "Step 3 · Make It Touch 🤝",
      text: `
        <div class="shepherd-text">
          <p>Switch back to <strong>Pen</strong>.</p>
          <p>Draw a new polygon that touches an existing one (share an edge or corner).</p>
        </div>
      `,
      attachTo: {
        element: "#pen",
        on: "bottom",
      },
      id: "draw-touching",
      when: {
        show: () => {
          this.highlightElement("#pen");
          this.waitForToolChange("pen");
        },
      },
    });

    // Step 3.5: Split by Touching
    this.tour.addStep({
      title: "Step 3.5 · Touch",
      text: `
        <div class="shepherd-text">
          <p>Draw another polygon <strong>touching</strong> the other(s).</p>
        </div>
      `,
      attachTo: {
        element: ".canvas-container",
        on: "top",
      },
      id: "touching-instructions",
      when: {
        show: () => {
          this.highlightElement(".canvas-container");
        },
        hide: () => {
          this.removeHighlight(".canvas-container");
        },
      },
    });

    // Step 4: Select & Merge
    this.tour.addStep({
      title: "Step 4 · Merging",
      text: `
        <div class="shepherd-text">
          <p>Tap <strong>Select</strong>, to select the polygons.</p>
        </div>
      `,
      attachTo: {
        element: "#select",
        on: "bottom",
      },
      id: "select-merge",
      when: {
        show: () => {
          this.highlightElement("#select");
          this.waitForToolChange("select");
        },
      },
    });

    // Step 3.5: Split by Touching
    this.tour.addStep({
      title: "Step 4.5 · Select Polygons",
      text: `
        <div class="shepherd-text">
          <p><strong>Click</strong> on canvas and <strong>Drag</strong> to draw a selection rectangle.</p>
        </div>
      `,
      attachTo: {
        element: ".canvas-container",
        on: "top",
      },
      id: "selection-instructions",
      when: {
        show: () => {
          this.highlightElement(".canvas-container");
        },
        hide: () => {
          this.removeHighlight(".canvas-container");
        },
      },
    });

    // Step 5: Completion
    this.tour.addStep({
      title: "You Did It! 🎉",
      text: `
        <div class="shepherd-text">
          <p>You can now draw, split, and merge like a Boolean wizard.</p>
        </div>
      `,
      attachTo: {
        element: ".canvas-container",
        on: "bottom",
      },
      buttons: [
        {
          text: "Finish",
          classes: "shepherd-button-primary",
          action: () => this.completeTour(),
        },
      ],
      id: "completion",
      when: {
        show: () => {
          this.showConfetti();
        },
      },
    });
  }

  /**
   * Setup event listeners for user actions
   */
  setupEventListeners() {
    // Listen for custom onboarding events
    this.addEventListenerWithCleanup("tool:changed", (e) => {
      this.handleToolChange(e.detail);
    });

    this.addEventListenerWithCleanup("polygon:created", (e) => {
      this.handlePolygonCreated(e.detail);
    });

    this.addEventListenerWithCleanup("polygon:split", (e) => {
      this.handlePolygonSplit(e.detail);
    });

    this.addEventListenerWithCleanup("polygon:merged", (e) => {
      this.handlePolygonMerged(e.detail);
    });

    this.addEventListenerWithCleanup("polygon:selected", (e) => {
      this.handlePolygonSelection(e.detail);
    });

    // Listen for ESC key to cancel tour
    this.addEventListenerWithCleanup(
      "keydown",
      (e) => {
        if (e.key === "Escape" && this.isActive) {
          this.skipTour();
        }
      },
      document
    );
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
   * Handle tool changes during onboarding
   */
  handleToolChange(detail) {
    if (!this.isActive) return;

    const { currentTool } = detail;
    const currentStepId = this.tour.getCurrentStep()?.id;

    // Step 1: Waiting for pen tool selection
    if (currentStepId === "draw-polygon" && currentTool === "pen") {
      this.removeHighlight("#pen");
      this.tour.next(); // Go to drawing instructions
    }

    // Step 2: Waiting for split tool selection
    if (currentStepId === "split-polygon" && currentTool === "split") {
      this.removeHighlight("#split");
      this.tour.next(); // Close popup and advance
      this.highlightElement(".canvas-container");
      this.showCanvasHint("Draw a polygon that overlaps your existing shape!");
    }

    // Step 3: Waiting for pen tool selection again
    if (currentStepId === "draw-touching" && currentTool === "pen") {
      this.removeHighlight("#pen");
      this.tour.next(); // Close popup and advance
      this.highlightElement(".canvas-container");
      this.showCanvasHint("Draw a polygon that touches an existing one!");
    }

    // Step 4: Waiting for select tool
    if (currentStepId === "select-merge" && currentTool === "select") {
      this.removeHighlight("#select");
      this.tour.next(); // Close popup and advance
      this.highlightElement(".canvas-container");
      this.showCanvasHint("Select the touching polygon(s) to merge them.");
    }
  }

  /**
   * Handle polygon creation
   */
  handlePolygonCreated(detail) {
    if (!this.isActive) return;

    const { touchesExisting } = detail;
    const currentStepId = this.tour.getCurrentStep()?.id;

    // Step 1.5: First polygon created (from drawing instructions)
    if (currentStepId === "drawing-instructions") {
      this.removeHighlight(".canvas-container");
      setTimeout(() => this.tour.next(), 500);
    }

    // Step 3: Touching polygon created
    if (currentStepId === "touching-instructions") {
      if (touchesExisting) {
        this.hasCreatedTouchingPolygon = true;
        this.removeHighlight(".canvas-container");
        this.hideCanvasHint();
        setTimeout(() => this.tour.next(), 500);
      } else {
        this.showCanvasHint("They need to share an edge or a point.");
      }
    }
  }

  /**
   * Handle polygon split
   */
  handlePolygonSplit(detail) {
    if (!this.isActive) return;

    const currentStepId = this.tour.getCurrentStep()?.id;

    // Step 2: Split operation completed
    if (currentStepId === "splitting-instructions") {
      this.hasSplitPolygon = true;
      this.removeHighlight(".canvas-container");
      this.hideCanvasHint();
      setTimeout(() => this.tour.next(), 500);
    }
  }

  /**
   * Handle polygon merge
   */
  handlePolygonMerged(detail) {
    if (!this.isActive) return;

    const currentStepId = this.tour.getCurrentStep()?.id;

    // Step 4: Merge completed
    if (currentStepId === "selection-instructions") {
      this.hasMergedPolygons = true;
      this.removeHighlight(".canvas-container");
      this.hideCanvasHint();
      setTimeout(() => this.tour.next(), 500);
    }
  }

  /**
   * Handle polygon selection changes
   */
  handlePolygonSelection(detail) {
    if (!this.isActive) return;

    const { selectedCount } = detail;
    const currentStepId = this.tour.getCurrentStep()?.id;

    // Step 4: Multiple polygons selected, highlight merge button
    if (currentStepId === "selection-instructions" && selectedCount >= 2) {
      this.removeHighlight(".canvas-container");
      this.highlightElement("#merge");
      this.showCanvasHint("Now click the Merge button!");
    }
  }

  /**
   * Start the onboarding tour
   */
  startTour() {
    if (this.isOnboardingCompleted()) {
      return false; // Don't start if already completed
    }

    this.isActive = true;
    this.tour.start();
    return true;
  }

  /**
   * Skip the entire tour
   */
  skipTour() {
    this.isActive = false;
    this.tour.cancel();
    this.cleanup();
  }

  /**
   * Complete the tour successfully
   */
  completeTour() {
    this.completedSteps.push("completed");
    this.saveCompletionState();
    this.isActive = false;
    this.tour.complete();
    this.cleanup();
  }

  /**
   * Reset onboarding state (for testing or replay)
   */
  resetOnboarding() {
    this.completedSteps = [];
    this.saveCompletionState();
    this.polygonCount = 0;
    this.hasCreatedTouchingPolygon = false;
    this.hasSplitPolygon = false;
    this.hasMergedPolygons = false;
  }

  /**
   * Wait for specific tool change
   */
  waitForToolChange(expectedTool) {
    // This creates a visual indication that we're waiting for tool selection
    const checkTool = () => {
      if (pixiStore[MODE] === expectedTool) {
        return;
      }
      // Show idle hint after 20 seconds
      setTimeout(() => {
        if (this.isActive && pixiStore[MODE] !== expectedTool) {
          this.showIdleHint();
        }
      }, 20000);
    };
    checkTool();
  }

  /**
   * Highlight a specific element
   */
  highlightElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add("shepherd-highlight");
    }
  }

  /**
   * Remove highlight from element
   */
  removeHighlight(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.remove("shepherd-highlight");
    }
  }

  /**
   * Show canvas hint
   */
  showCanvasHint(message) {
    this.hideCanvasHint(); // Remove any existing hint

    const hint = document.createElement("div");
    hint.className = "shepherd-canvas-hint";
    hint.textContent = message;

    const canvas = document.querySelector(".canvas-container");
    if (canvas) {
      canvas.appendChild(hint);
    }
  }

  /**
   * Hide canvas hint
   */
  hideCanvasHint() {
    const hint = document.querySelector(".shepherd-canvas-hint");
    if (hint) {
      hint.remove();
    }
  }

  /**
   * Show idle hint when user is inactive
   */
  showIdleHint() {
    this.showCanvasHint("Need help? Follow the blue highlight and step title.");
  }

  /**
   * Show confetti animation on completion
   */
  showConfetti() {
    const canvas = document.querySelector(".canvas-container");
    if (canvas) {
      canvas.classList.add("shepherd-confetti");
      setTimeout(() => {
        canvas.classList.remove("shepherd-confetti");
      }, 3000);
    }
  }

  /**
   * Cleanup event listeners and highlights
   */
  cleanup() {
    // Remove all event listeners
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler }) => {
        target.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();

    // Remove highlights and hints
    document.querySelectorAll(".shepherd-highlight").forEach((el) => {
      el.classList.remove("shepherd-highlight");
    });
    this.hideCanvasHint();
  }

  /**
   * Destroy the onboarding manager
   */
  destroy() {
    if (this.tour) {
      this.tour.cancel();
    }
    this.cleanup();
  }
}

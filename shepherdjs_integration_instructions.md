# 🎨 Shepherd.js Onboarding — PIXI Boolean Drawing App

_(BMED Method Instruction Guide)_

## Overview

This guide defines the step-by-step onboarding prompts for your **mini drawing app** using **PIXI.js** and **Shepherd.js**.
The tutorial teaches users how to draw, split, and merge polygons using the app’s interactive tools.

---

## Step 0 — Welcome

**🧠 Behavior:**
Introduce the user to what they’ll learn and set the stage for interaction.

**💡 Motivation:**
Make the user curious and confident—this will be a short, fun tutorial where they’ll learn to manipulate shapes visually.

**🎨 Example Prompt:**

> “Hey Creator 👋
> You’ll master 4 quick moves:
> 1️⃣ Draw a polygon 🖊️
> 2️⃣ Split it ✂️
> 3️⃣ Add a touching one 🧩
> 4️⃣ Merge them 💥”

**➡️ Direction:**
Attach to the **canvas container**.
Show `Skip` and `Let’s Go` buttons.
Proceed when the user clicks “Let’s Go”.

---

## Step 1 — Draw a Polygon (Pen Tool)

**🧠 Behavior:**
Guide the user to select the **Pen Tool** and create a polygon by connecting points.

**💡 Motivation:**
Help them understand how drawing works — it’s simple and immediate visual feedback.

**🎨 Example Prompt:**

> “Step 1 · Draw Something! ✏️
> Tap **Pen** → click the canvas to drop points.
> Double-click to close the shape (needs 3+ points).”

**➡️ Direction:**

- Attach to the **Pen button** (`#pen`).
- Highlight the button until selected.
- Advance when `tool:changed` event = `"pen"`.
- Then prompt them to draw on the canvas.
- When `polygon:created` fires, advance to the next step.
- Idle > 20s → show hint “Try clicking the Pen icon 👇”.

---

## Step 2 — Split a Polygon (Split Tool)

**🧠 Behavior:**
Teach the user to cut a polygon using another polygon (split operation).

**💡 Motivation:**
Demonstrate Boolean operations visually — make geometry feel like a creative act.

**🎨 Example Prompt:**

> “Step 2 · Time to Slice ✂️
> Choose **Split**, draw another polygon overlapping your first one,
> and double-click to cut!”

**➡️ Direction:**

- Attach to the **Split button** (`#split`).
- Wait for `tool:changed` = `"split"`.
- When drawing starts, highlight the canvas.
- Auto-advance after `polygon:split` with 2+ produced polygons.
- If no split detected, show hint: “Try overlapping the shape more.”

---

## Step 3 — Draw Another Polygon That Touches

**🧠 Behavior:**
Encourage creating another polygon that touches an existing one.

**💡 Motivation:**
Prepare the user for the **Merge** operation by demonstrating adjacency.

**🎨 Example Prompt:**

> “Step 3 · Make It Touch 🤝
> Switch back to **Pen**.
> Draw a new polygon that touches an existing one (share an edge or corner).”

**➡️ Direction:**

- Attach to the **Pen button** again.
- Wait for `tool:changed` = `"pen"`.
- Require `polygon:created` where `touchesExisting = true`.
- If not touching, display hint: “They need to share an edge or a point.”

---

## Step 4 — Select & Merge

**🧠 Behavior:**
Show the user how to select multiple polygons and merge them.

**💡 Motivation:**
Rewarding end-step—visually satisfying to see separate shapes combine into one.

**🎨 Example Prompt:**

> “Step 4 · Combine Forces 💥
> Tap **Select**, click both polygons,
> then hit **Merge**. Watch them fuse!”

**➡️ Direction:**

- Attach to the **Select button** (`#select`).
- After polygons selected (`polygon:selected` with ≥2 IDs), guide user to **Merge** button (`#merge`).
- Advance when `polygon:merged` event fires.
- If merge fails → “Make sure they touch before merging.”

---

## Step 5 — Completion

**🧠 Behavior:**
Celebrate success and close the loop with an option to replay or explore freely.

**💡 Motivation:**
Positive reinforcement boosts retention and satisfaction.

**🎨 Example Prompt:**

> “You Did It! 🎉
> You can now draw, split, and merge like a Boolean wizard.
> Replay anytime via Help → Tutorial.”

**➡️ Direction:**

- Attach to the **canvas container** (bottom).
- Show confetti or success animation.
- Close the tour when the user clicks “Finish”.

---

## 💬 Optional Hints & Recovery

| Situation       | Hint Message                                           |
| --------------- | ------------------------------------------------------ |
| User idle > 20s | “Need help? Follow the blue highlight and step title.” |
| Invalid polygon | “Add at least 3 points and double-click to close.”     |
| Split fails     | “Make sure your cutter overlaps the polygon’s area.”   |
| Merge fails     | “Ensure polygons actually touch before merging.”       |

---

## 🎛️ UX Notes

- Enable modal overlay but keep canvas clickable.
- Tooltip positions: toolbar = bottom, canvas = top.
- Allow “ESC” to cancel tour anytime.
- Respect reduced-motion preferences.
- Confetti burst and “pop” sound on merge completion.

---

## 🎛️ Styling Notes

- It must be using figma/figma alike styling.
- Use tailwindcss for styling.
- It must be clean and minimalistic.

---

## 🔁 Progress Overview

| Step | Tool           | Goal                  | Event to Advance                  |
| ---- | -------------- | --------------------- | --------------------------------- |
| 0    | None           | Introduction          | Manual Next                       |
| 1    | Pen            | Create polygon        | `polygon:created`                 |
| 2    | Split          | Cut polygon           | `polygon:split`                   |
| 3    | Pen            | Draw touching polygon | `polygon:created` (touching=true) |
| 4    | Select + Merge | Merge polygons        | `polygon:merged`                  |
| 5    | None           | Complete tutorial     | Manual Finish                     |

---

Would you like me to extend this with **agent action definitions** (like “highlight target,” “wait for event,” “show tooltip”) in a YAML-style format next — for use in your editor’s workflow scripting layer?

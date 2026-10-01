# 🚗 Permit Quest - Washington Driver's Test Prep

**Permit Quest** is the name of the app. **Princess Permit's Rescue** is the adventure inside it: a gamified Progressive Web App that helps students prepare for the Washington State **Driving Knowledge Exam**. Fight your way up a 15-floor tower, one Driver Guide topic at a time, and rescue the Princess from Lord Violation.

All content is drawn from the Washington Driver Guide published by the Department of Licensing (`docs/WA-driver-guide.pdf`).

## 🏰 The Tower

The tower mirrors the five parts of the Washington Driver Guide. Each part is a **wing**, and each wing gets harder as you climb.

| Wing | Guide part | Floors (topic - enemy) |
|------|-----------|------------------------|
| 🚪 The Gatehouse | 1. Licenses | 1 Licensing basics - Bureaucrat of Barriers<br>2 Teen licensing - Curfew Wraith |
| 🔨 The Forge | 2. Vehicles | 3 Vehicle ownership - Titleless Trickster<br>4 Vehicle readiness - Rust Reaper<br>5 Vehicle control - Blindspot Behemoth |
| 🧠 The Mind Spire | 3. Drivers | 6 Driver fitness - Slumber Shade<br>7 Impaired driving - Intoxication Imp<br>8 Focus and attitude - Focus Fiend |
| 🧭 The Labyrinth | 4. Roads | 9 Signs and signals - Sign Sentinel<br>10 Intersections and turns - Roundabout Revenant<br>11 Lanes, zones and parking - Space Stealer<br>12 Sharing the road - Selfish Specter |
| ⛈️ The Storm Deck | 5. Risks | 13 Speed, space and time - Highway Hellhound<br>14 Conditions and hazards - Hydroplane Horror<br>15 Emergencies and collisions - Danger Drake |

Clear all 15 floors to unlock the **final boss**: three trials of 20 questions each, drawn from every topic.

## 🎮 How It Plays

- Each floor is a battle: the enemy's health equals the number of questions, and only correct answers damage it.
- A floor is conquered only by answering every question correctly, but a loss doesn't send you back to the start: **Finish the Fight** replays just the questions you missed, with their answer options reshuffled, until the enemy falls. A full replay is available too.
- A wrong answer stops the battle and shows the correct answer and its explanation, and waits for you to acknowledge it. Correct answers show the explanation briefly and move on.
- Clearing a floor without a single miss counts as a *perfect* run; clearing it after a retry still earns the artifact and unlocks the next floor.
- Every conquered floor awards an artifact and a message from the Princess.
- Clearing a whole wing, a perfect floor, every artifact, or holding 90% accuracy earns a badge. Earned and locked badges are listed in the quest journal.
- Each floor has a study-tips panel that points to the exact Driver Guide sections it covers.
- Progress (floors, artifacts, stats) is saved in the browser's local storage.
- Combat sounds are synthesized in the browser: a hit, a miss, the enemy's defeat, and the artifact award. The Sound Effects checkbox in Game Options remembers its setting. Boss trials stay silent.

The question bank has **120 questions** (8 per floor), each with an explanation that cites the facts from the guide.

## 🚀 Running It

```bash
./run.sh        # serves the app on http://localhost:8000
```

No build step and no dependencies beyond Python 3 for the local server (or open `index.html` directly). On Android, open the app in Chrome and use "Add to Home Screen" to install it as a PWA.

## 🧱 Project Layout

```
index.html                 App shell and script loading (order matters)
style.css                  All styling
js/curriculum.js           Single source of truth: state info, wings, floors, enemies,
                           artifacts, study tips, difficulty, derived floor counts
js/questions/registry.js   questionsData + registerQuestions()
js/questions/01-05-*.js    Questions, one file per Driver Guide part
js/adventureData.js        Story, boss, princess messages, config
js/AdventureGame.js        Game engine (reads everything from the files above)
docs/WA-driver-guide.pdf   Source material
```

## ✏️ Changing the Content

The code is deliberately DRY: nothing outside `js/curriculum.js` hardcodes a floor count or restates floor metadata.

- **Add or edit a floor**: change the wing's `floors` array in `js/curriculum.js`. Floor ids, counts, difficulty, the tower map, and progress totals all update automatically.
- **Add or edit questions**: edit the matching `js/questions/0N-*.js` file. Each floor's `category` must match a key passed to `registerQuestions()`.
- **Use another state**: update `curriculum.state` and the content files. The state name, agency and guide title shown in the UI come from there.

A question looks like:

```js
{
    question: "...",
    answers: ["...", "...", "...", "..."],
    correct: 2,            // 0-based index into answers
    explanation: "..."
}
```

Keep the correct answers spread across all four positions and avoid making the right answer the obviously longest one.

## 📈 Progress Storage

Progress is stored under the key in `adventureData.config.storageKey` (currently `adventureProgress-v2`). Bump it whenever floor ids change meaning so old saves can't corrupt the new tower.

## 🗺️ Roadmap

See `ADVENTURE_ROADMAP.md` for the phased plan. Phases 1 through 9 are complete, including offline caching.

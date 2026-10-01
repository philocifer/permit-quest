# 🏰 Princess Permit's Rescue - Adventure Game Roadmap

## 📖 Project Overview

**Goal:** A gamified Washington State driver's permit test prep app, framed as an adventure where players rescue Princess Permit from Lord Violation's Tower of Chaos.

**Current Status:** Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅ | Phase 4 ✅ | Phase 5 ✅ | Phase 6 ✅ | Phase 7 ✅ | Phase 8 ✅ | Phase 9 ✅ | **Next Phase: none**

**Content source:** [Washington Driver Guide](docs/WA-driver-guide.pdf) (191 pages, published by the Washington State Department of Licensing). The app previously used the Missouri Driver Guide; see Phase 6.

---

## 🎮 Adventure Story & Design

### Core Narrative
Princess Permit, beloved guardian of traffic wisdom in the Kingdom of Roadlandia, has been kidnapped by the evil Lord Violation. She is imprisoned at the top of the Tower of Chaos. As the kingdom's newest Knight of the Road, you must:

1. **Ascend the 15-floor tower**, defeating a traffic demon lieutenant on each floor
2. **Face Lord Violation** in the final boss battle (3 trials of 20 questions each)
3. **Rescue Princess Permit** and restore order to the kingdom

### Tower Layout (16 Total Levels)

The tower is divided into **5 wings**, one per part of the Washington Driver Guide. Difficulty is a property of the wing, so all floors within a wing share a difficulty rating.

```
Floor 16: 👑 Lord Violation's Throne Room          (Final Boss - 3 trials)

── Wing 5: The Storm Deck ──── Guide Part 5: Risks ──── ⭐⭐⭐⭐⭐
Floor 15: ⚠️  Danger Drake          (emergencies-and-collisions)
Floor 14: 🌧️  Hydroplane Horror      (conditions-and-hazards)
Floor 13: 🏁 Highway Hellhound      (speed-space-and-time)

── Wing 4: The Labyrinth ───── Guide Part 4: Roads ──── ⭐⭐⭐⭐
Floor 12: 🤝 Selfish Specter        (sharing-the-road)
Floor 11: 🅿️  Space Stealer          (lanes-zones-and-parking)
Floor 10: 🔄 Roundabout Revenant    (intersections-and-turns)
Floor 09: 🚸 Sign Sentinel          (signs-and-signals)

── Wing 3: The Mind Spire ──── Guide Part 3: Drivers ── ⭐⭐⭐
Floor 08: 📱 Focus Fiend            (focus-and-attitude)
Floor 07: 🍺 Intoxication Imp       (impaired-driving)
Floor 06: 😴 Slumber Shade          (driver-fitness)

── Wing 2: The Forge ───────── Guide Part 2: Vehicles ─ ⭐⭐
Floor 05: 🚙 Blindspot Behemoth     (vehicle-control)
Floor 04: 🔧 Rust Reaper            (vehicle-readiness)
Floor 03: 📋 Titleless Trickster    (vehicle-ownership)

── Wing 1: The Gatehouse ───── Guide Part 1: Licenses ─ ⭐
Floor 02: 🌙 Curfew Wraith          (teen-licensing)
Floor 01: 📄 Bureaucrat of Barriers (licensing-basics)
```

**Retired in Phase 6:** Rule Wrecker (`rules-road`) and Point Punisher (`point-system`) — Washington has no driver point system, and its rules-of-the-road material is distributed across the Roads wing instead of sitting in one floor.

### Floor Battle System
- **8 questions per floor**, drawn only from that floor's category and shuffled
- **Enemy health equals the question count**, and only correct answers deal damage, so a floor requires answering everything correctly; after a loss, "Finish the Fight" re-fights only the missed questions
- **Immediate feedback** with explanations after each answer
- **Unlimited retries**, with per-floor attempt and best-score tracking
- **Replay modes** for cleared floors: Standard, Practice, and Speed Challenge

### Boss Battle System
- **3 Trials:** Each is a complete 20-question permit test drawn from all 15 categories
- **Perfect Score Required:** Must get 100% to proceed to next trial
- **No Mid-Test Feedback:** Questions appear one by one, results shown only at end
- **Boss Health:** Decreases by 1/3 with each completed trial
- **Retake on Failure:** Failed trials restart from the beginning

---

## 📋 Implementation Plan

### ✅ COMPLETED PHASES

#### ✅ Phase 1: Adventure Data Structure
**Goal:** Create foundation for adventure game with optimal architecture

**Completed Tasks:**
- ✅ 1a. Create `adventureData.js` with enemy/floor definitions
- ✅ 1b. Design and implement adventure game class structure
- ✅ 1c. Create adventure-focused welcome/menu system
- ✅ 1d. Implement adventure progress tracking and persistence
- ✅ 1e. Establish question data integration for combat system

**Success Criteria Met:**
- ✅ Adventure data loads without errors
- ✅ Adventure game launches and displays properly
- ✅ Adventure progress saves/loads correctly
- ✅ Floor unlock logic works properly

#### ✅ Phase 2: Story System
**Goal:** Implement narrative screens and character dialogue

**Completed Tasks:**
- ✅ 2a. Implement story screen animations and typewriter effects
- ✅ 2b. Create character dialogue system with personality responses
- ✅ 2c. Add enemy intro/defeat narrative sequences
- ✅ 2d. Implement Princess Permit encouragement message system
- ✅ 2e. Create victory/defeat story transitions

**Key Features Delivered:**
- Cinematic story sequences with staggered fade-in animations
- Dynamic dialogue system with a distinct personality per enemy
- Multi-stage narrative sequences (3-stage intros, 6-stage victories, 4-stage defeats)
- Princess message system with a per-floor message plus performance and streak bonuses
- Transition system with victory, defeat, epic, and story-reveal effects

#### ✅ Phase 3: Tower Progression
**Goal:** Implement floor-based level selection and progression system

**Completed Tasks:**
- ✅ 3a. Create visual tower map interface with floor indicators
- ✅ 3b. Implement floor unlocking logic and progress tracking
- ✅ 3c. Add progress indicators and milestone celebrations
- ✅ 3d. Create replay system for completed floors
- ✅ 3e. Add floor difficulty indicators and player guidance

**Key Features Delivered:**
- Tower map with difficulty stars, progress bars, attempt badges, and status indicators
- Floor unlocking with validation, plus per-floor statistics in `floorStats`
- Milestone celebrations and a quest journal with treasure vault and knowledge mastery
- Replay system with three modes and mode-specific analytics
- Difficulty modal with per-floor preparation guidance and time estimates

#### ✅ Phase 4: Combat Mechanics
**Goal:** Transform the quiz system into enemy battles with engaging combat mechanics

**Completed Tasks:**
- ✅ 4a. Implement enemy health system and damage mechanics
- ✅ 4b. Create combat animations and visual feedback
- ✅ 4c. Add personality-based enemy responses during battles
- ✅ 4d. ~~Combat sound effects and battle atmosphere~~ — **deferred to Phase 7** (no audio exists yet)
- ✅ 4e. Create victory/defeat animations and battle transitions

**Key Features Delivered:**
- Enemy health bar driven by the floor's question count, damaged only by correct answers
- 40 CSS keyframe animations including `damage-shake` and `enemy-defeat-fade`
- Context-aware enemy taunts for first hit, desperation, win streaks, player struggles, and mid-battle
- Dramatic multi-stage defeat sequence with artifact award and Princess reaction

#### ✅ Phase 5: Boss Battle System
**Goal:** Implement the final Lord Violation encounter

**Completed Tasks:**
- ✅ 5a. Three-trial system, 20 questions each, sampled from every category
- ✅ 5b. No-feedback trial interface (`trial-screen`, `trial-progress`, `trial-results-screen`)
- ✅ 5c. 100% score requirement per trial with retry on failure
- ✅ 5d. Boss phase transitions with per-phase dialogue
- ✅ 5e. Victory sequence with Princess rescue and end-game story

---

#### ✅ Phase 6: Washington Conversion

**Goal:** Replace all Missouri content with Washington content, restructure the tower to mirror the five parts of the Washington Driver Guide, and remove the duplication that made the old structure expensive to change.

**Why the restructure:** Washington's guide is organized into five parts, and two Missouri floors have no Washington equivalent — Washington has **no driver point system** and **no emissions or safety inspection program**. Washington also adds material the old tower had nowhere to put: cannabis/THC limits, ferries, light rail, snowplows, roundabouts and diverging diamonds, HOV/toll/reversible lanes, ramp meters, and secure-load rules.

**Tasks:**
- ✅ 6a. Create `js/curriculum.js` as the single source of truth: Washington state info, 5 parts with difficulty ratings, and 15 floor objects each carrying its category slug, name, theme, guide sections, study tips, enemy (personality + reactions), story, artifact, and Princess message. Derive `floors`, `totalFloors`, `bossFloorId`, and `floorById` at the bottom of the file.
- ✅ 6b. Split the question bank into `js/questions/registry.js` plus one file per guide part (`01-licenses.js` … `05-risks.js`), 8 questions per category for 120 total. Delete root `questions.js` along with its dead `mixed` and `achievements` exports.
- ✅ 6c. Strip `js/adventureData.js` down to story, boss, Princess performance/streak messages, and config; delete the `floors` array, the duplicate `artifacts` map, and the `princessMessages.floorN` lookup table.
- ✅ 6d. Remove every hardcoded floor count from `js/AdventureGame.js` and `index.html` in favor of `curriculum.totalFloors` / `curriculum.bossFloorId`.
- ✅ 6e. Collapse the five enemy-name-keyed taunt maps into one `getEnemyReaction(kind)` reading `enemy.reactions`, and read study tips from `floor.studyTips` (the slug/display-name lookup `getCategorySpecificTips` was deleted).
- ✅ 6f. Render the tower map grouped by wing, and rewrite milestone celebrations to fire on wing completion.
- ✅ 6g. Update the shell and branding: `index.html` meta and About copy, `manifest.json`, `run.sh`, and wing styles in `style.css`. The two names were later given a rule: Permit Quest is the app, Princess Permit's Rescue is the adventure.
- ✅ 6h. Bump the progress storage key to `adventureProgress-v2` — floor IDs change meaning, and `loadAdventureProgress` shallow-merges saved data over defaults, so an old save would carry stale `floorsCompleted`.
- ✅ 6i. Rewrite `README.md` and `INSTRUCTIONS.md` for Washington, and delete `docs/MO-Driver-Guide.pdf`.

**Success Criteria:**
- ✅ Console integration stats report 15 validated categories at 8 questions each and 120 boss-eligible questions
- ✅ Tower map renders 5 wing headers with their floors, boss locked until all 15 are cleared
- ✅ The difficulty modal shows real study tips (it silently showed none before, due to a slug/display-name key mismatch)
- ✅ No file contains a hardcoded total floor count
- ✅ Every question's explanation states a fact traceable to the Washington Driver Guide *(all 120 audited line-by-line against the guide text in Session 6; every marked answer was correct, and nine wording/metadata imprecisions were fixed)*

---

#### ✅ Phase 7: Sound Effects
**Goal:** Add the combat sounds deferred from Phase 4, using tones synthesized in the browser so there are no audio files to source or license

- ✅ 7a. Add a small audio manager on the Web Audio API that synthesizes short tones, stays silent until the first user gesture, and plays nothing when Sound Effects is off
- ✅ 7b. Play a distinct tone for a correct hit, a wrong answer, an enemy defeat, and an artifact award
- ✅ 7c. Persist the Sound Effects checkbox to `localStorage` and restore it on load
- ✅ 7d. Remove the Background Music checkbox from the options screen. The unused Battle Animations checkbox was removed later, with the offline work.

Background music and an animations-off path stay out of scope.

#### ✅ Phase 8: Achievements
**Goal:** Give the player goals beyond clearing a floor, built on progress the game already tracks

- ✅ 8a. Define a short achievement list in `js/curriculum.js`: one badge per wing, a perfect floor, every artifact, and 90% accuracy across at least 20 questions
- ✅ 8b. Award each badge once, show earned and locked badges in the quest journal, and reuse the milestone toast for the unlock

Particle effects and animated enemy portraits stay out of scope.

#### ✅ Phase 9: Offline PWA
**Goal:** Actually deliver the offline capability the manifest advertises

- ✅ 9a. Write `sw.js` caching the shell, styles, curriculum, and all question files. The driver guide PDF is not cached.
- ✅ 9b. Replace the unregister logic with real registration. The cache name is `permit-quest-v1`.
- ✅ 9c. Remove the `document.write` cache-busting and the no-store meta tags in `index.html`, and move to explicit `?v=1` URLs. Bump that query and the cache name together.
- ✅ 9d. The shell, a floor battle, and the quest journal load from the cache while offline. Installing to a phone home screen is still a manual check.

---

## 📁 File Structure

### Current
```
index.html
style.css
manifest.json
sw.js              # cache name permit-quest-v1; bump it with the ?v=1 asset URLs
run.sh
icons/icon.svg
js/
├── curriculum.js       # single source of truth: state info, 5 parts, 15 floors
├── adventureData.js    # Story, boss, princess messages, config
├── soundEffects.js     # Synthesized combat tones and the Sound Effects setting
├── AdventureGame.js    # Engine, with all counts and dialogue derived from curriculum
└── questions/
    ├── registry.js     # questionsData + registerQuestions()
    ├── 01-licenses.js  # licensing-basics, teen-licensing
    ├── 02-vehicles.js  # vehicle-ownership, -readiness, -control
    ├── 03-drivers.js   # driver-fitness, impaired-driving, focus-and-attitude
    ├── 04-roads.js     # signs-and-signals, intersections-and-turns,
    │                   #       lanes-zones-and-parking, sharing-the-road
    └── 05-risks.js     # speed-space-and-time, conditions-and-hazards,
                        #       emergencies-and-collisions
docs/
└── WA-driver-guide.pdf
```

**Note on load order:** the app has no build step and uses plain script tags, so `curriculum.js` and `questions/registry.js` must load before the part files, which must load before `adventureData.js` and `AdventureGame.js`.

---

## 🎯 Quick Start Guide for New Sessions

### To Resume Development:
1. **Read this roadmap** to understand current phase and progress
2. **Check the "CURRENT PHASE"** section for specific next steps
3. **Review success criteria** to understand what needs testing
4. **Update progress** by moving completed tasks to "COMPLETED PHASES"

### To Start New Phase:
1. **Update current status** at top of document
2. **Move the completed phase** to "COMPLETED PHASES" with what was actually delivered
3. **Update "CURRENT PHASE"** to the next phase
4. **Begin implementing** the first task in the new phase

### Extracting facts from the driver guide
`pdftotext` is not installed. Read `docs/WA-driver-guide.pdf` with the file-read tool, which converts it to about 4,876 lines of text, in `offset`/`limit` chunks. The table of contents with every section number is at lines 79-352. Section headers appear as `2.5 | VEHICLE MAINTENANCE` and page breaks as `-- 34 of 191 --`.

---

## 💡 Technical Notes & Decisions

### Architecture Decisions:
- **Adventure-first approach** - Design the optimal adventure experience rather than preserving the old quiz flow
- **No build step** - Plain script tags and globals; keep it that way so the app runs from `file://` or any static server
- **Single source of truth for curriculum** - Floor identity, ordering, difficulty, dialogue, artifacts, and tips all live in `js/curriculum.js`; nothing else may hardcode a floor count or restate a floor's metadata
- **Derive, don't duplicate** - Floor IDs, totals, and the boss level are computed from the curriculum array
- **Modular phases** - Each phase adds discrete functionality and leaves a working game

### Key Design Principles:
- **Testable increments** - Each phase has clear success criteria
- **Story-driven progression** - Narrative motivates the gameplay
- **Every question is traceable** - An explanation must state a fact from the Washington Driver Guide, with the guide section recorded on the floor
- **Two names, one rule** - Permit Quest is the app (`manifest.json`, the run scripts, the README and INSTRUCTIONS titles). Princess Permit's Rescue is the adventure (the in-game heading, `adventureData.gameTitle`, the document title, and the Apple web-app title). The manifest description names both.

---

## 📝 Session Notes

### Session 1 (Initial Planning & Phase 1)
- Completed adventure concept design and the phase-based roadmap
- **Key Decision:** Changed from "preserve existing quiz" to "adventure-first" architecture
- Built the adventure data structure, engine skeleton, medieval CSS theming, progress tracking, and question integration with validation

### Session 2 (Phase 2 - Story System)
- Built story screens, enemy dialogue with per-enemy personalities, multi-stage victory and defeat sequences, and the Princess encouragement system

### Session 3 (Phase 3 - Tower Progression)
- Built the tower map with difficulty stars and status badges, floor unlocking, milestone celebrations, the quest journal, the three-mode replay system, and the difficulty guidance modal

### Session 4 (Phases 4 & 5 - Combat and Boss)
- Built the enemy health and damage model, combat animations and feedback, context-aware enemy taunts, and the defeat sequence
- Built the three-trial boss encounter with no-feedback trials, per-phase dialogue, and the Princess rescue ending
- Audio was skipped and is now tracked as Phase 7

### Session 5 (Roadmap Audit & Washington Planning)
- **Audited the roadmap against the code** and corrected it: Phase 4 was marked in progress and Phase 5 as upcoming, but both were fully implemented. The old file-structure section described directories (`/adventure/`, `/assets/`) and files (`app.js`, `adventureUI.js`, `storySystem.js`, `combatSystem.js`) that were never created.
- Recorded the real gaps as Phases 7-9: audio and options wiring, achievements and particles, offline PWA
- **Key Decision:** The family moved to Washington, so the app converts from Missouri to Washington content
- **Key Decision:** Restructure the tower from 11 topic floors into 5 wings mirroring the guide's parts, going from 11 floors to 15 and from 75 questions to 120
- **Key Decision:** Introduce `js/curriculum.js` as the single source of truth, because the conversion would otherwise have to touch 19 hardcoded floor counts, 55 taunt strings keyed by enemy display name, and two parallel artifact definitions

### Session 6 (Phase 6 - Washington Conversion)
- Built `js/curriculum.js`, the five question files (120 questions, correct-answer positions balanced 30/30/30/30), and refactored `adventureData.js` and `AdventureGame.js` to derive everything from `curriculum`
- Tower map now groups floors under wing headers; milestones fire on wing completion
- Fixed a latent bug: the "player struggling" taunt read `a.correct` but answers store `isCorrect`
- Verified in the browser: 15 categories / 120 questions, artifact awards, wing milestone, difficulty modal tips, boss locked until all 15 floors are cleared, and a full boss run (3 trials × 20 questions) through the Princess rescue ending
- **Audited all 120 questions against the guide text.** Every marked answer was correct and no distractor was accidentally true. Fixed nine imprecisions: four `guideSections` mismatches, three study tips, and three explanations (license plate frames, the THC 5.00 ng wording, the hands-free exception for permit/intermediate holders, and the tire-blowout "do not brake" instruction)
- Derived the boss trial size and trial count from `adventureData` as well, so no file hardcodes 20 questions or 3 trials
- **Reconciled floor statistics.** `attempts` is now counted once when a battle starts, so it covers wins as well as losses (it previously only counted defeats, while `attempts.floors` double-counted them). Four copies of the `floorStats` initializer collapsed into `getFloorStats()`, which also backfills the `replays` key — its absence made replaying any already-entered floor throw. A retry round no longer overwrites `bestScore`, since it is scored over only the missed questions
- **Added answer feedback and a smarter retry.** The 120 explanations were being stored in `playerAnswers` and never rendered anywhere; a wrong answer now shows the correct answer plus its explanation and waits for acknowledgement, and the defeat screen reviews every miss. "Finish the Fight" re-fights only the missed questions with reshuffled answer options, and perfect-run stats now key off a miss-free attempt rather than a single run's accuracy

### Session 7 (Phase 7 - Sound Effects)
- Added `js/soundEffects.js`: four synthesized combat tones (hit, miss, enemy defeat, artifact), silent until the first click and silent when Sound Effects is off
- The Sound Effects checkbox is saved in `localStorage` and restored on load. Turning it on plays the hit tone so the setting is audible
- Removed the Background Music checkbox. Boss trials stay silent, since they give no feedback during the test
- Verified in the browser: a miss schedules nothing while muted, a hit schedules its two notes, the victory sequence plays the defeat fanfare and then the artifact chime, and an unchecked box survives a reload

### Session 8 (Phase 8 - Achievements)
- Added eight badges to `js/curriculum.js`: one per wing, Flawless Victory, Vault Complete, and Master of the Road (90% over at least 20 questions)
- Each badge is awarded once. Locked badges stay visible in the quest journal so they can be chased, and a new badge reuses the milestone toast
- A cleared wing no longer toasts twice: the badge carries the message the wing milestone used to show
- Badges already satisfied by a saved game are recorded on load without replaying the toast
- Verified in the browser: a clean first floor awards Flawless Victory, clearing the Gatehouse awards that wing, a reload does not toast them again, and the other six badges toast when their conditions become true

### Session 9 (Known issues and Phase 9)
- Removed the unused Battle Animations checkbox. The options screen now has Sound Effects only.
- Stated the two-name rule: Permit Quest is the app, Princess Permit's Rescue is the adventure. The manifest description names the adventure.
- `loadAdventureProgress` deletes the old `adventureProgress` key and does not merge it.
- A failed boss trial now lists each missed question with the correct answer and explanation. Retry still restarts the whole trial.
- The document title and meta description are set from `adventureData.gameTitle` and `curriculum.state` after the scripts load. Startup warns if the manifest description no longer contains the state name.
- Replaced `Date.now()` cache-busting and the no-store meta tags with `?v=1` URLs, and registered `sw.js` (`permit-quest-v1`) instead of unregistering workers. The driver guide PDF is not cached.
- Verified in the browser: options screen, a failed-trial review, the old save key, the meta description, and an offline reload of the shell, a floor battle, and the quest journal. Installing to a phone home screen was not checked.

---

*Last Updated: Session 9 - Phases 1-9 complete*

// Princess Permit's Rescue - Adventure Game Data
// Story, boss, and messaging. Floors, enemies, artifacts, and study tips live in
// js/curriculum.js (the single source of truth); this file must load after it.

const adventureData = {
    // Game metadata
    gameTitle: "Princess Permit's Rescue",
    gameSubtitle: "A Knight's Quest Through the Tower of Chaos",

    // Story narrative
    story: {
        opening: {
            title: "The Kingdom in Peril",
            text: [
                "In the peaceful Kingdom of Roadlandia, Princess Permit was beloved by all for her wisdom in safe travel and mastery of traffic laws.",
                "But the evil Lord Violation, banished long ago for his reckless ways, has returned with an army of traffic demons.",
                "In a dark ritual, he has kidnapped Princess Permit and imprisoned her in the Tower of Chaos - his fortress built from twisted metal and broken road signs.",
                "As the kingdom's newest Knight of the Road, you must climb the tower's five wings, defeat his demon lieutenants, and rescue Princess Permit before her knowledge is corrupted forever!"
            ]
        },
        victory: {
            title: "The Kingdom Restored",
            text: [
                "With Lord Violation defeated and the Tower of Chaos crumbling, Princess Permit is free at last!",
                "Her wisdom flows back across the kingdom, restoring order to the roads and safety to all travelers.",
                "The kingdom celebrates your heroic deeds, and Princess Permit knights you as the Grand Champion of the Road.",
                "Peace and safe travels return to Roadlandia, thanks to your mastery of traffic wisdom!"
            ]
        }
    },

    // Final boss, one level above the last floor (floor id comes from the curriculum)
    boss: {
        id: curriculum.bossFloorId,
        name: "Lord Violation's Throne Room",
        enemy: {
            name: "Lord Violation",
            title: "The Chaos Lord",
            health: 3, // Represents 3 trials to complete
            portrait: "👑",
            description: "The fallen knight who commands all traffic demons. Only perfect mastery can defeat him.",
            phases: [
                {
                    id: 1,
                    name: "Trial of Basic Mastery",
                    description: "Face the first test of your knowledge",
                    dialogue: {
                        intro: "So, little knight, you've made it this far. Let's see if you truly deserve to be here!",
                        success: "What?! Impossible! But I have two more trials that will surely break you!",
                        failure: "Pathetic! You're not worthy of rescuing anyone! Start over and study harder!"
                    }
                },
                {
                    id: 2,
                    name: "Trial of Advanced Knowledge",
                    description: "Face deeper challenges of traffic mastery",
                    dialogue: {
                        intro: "Your beginner's luck won't hold! This trial will expose your weaknesses!",
                        success: "No... this cannot be! My power wanes, but one final trial remains!",
                        failure: "Even after coming so far, you crumble under pressure! Begin again!"
                    }
                },
                {
                    id: 3,
                    name: "Trial of Ultimate Mastery",
                    description: "The final test - only perfection will suffice",
                    dialogue: {
                        intro: "This is my ultimate gambit! No one has EVER passed this final trial with perfection!",
                        success: "IMPOSSIBLE! My reign of chaos... is... ending... Princess Permit... I... have... failed...",
                        failure: "Even at the threshold of victory, you fail! Your princess will remain my prisoner!"
                    }
                }
            ]
        },
        story: {
            intro: "You climb the final stairs to face Lord Violation in his throne room. Princess Permit hangs suspended in a crystal prison above his dark throne, her light dimming with each passing moment.",
            victory: "With Lord Violation's defeat, the crystal prison shatters and Princess Permit floats down gracefully. The Tower of Chaos begins to crumble as her light returns to the kingdom.",
            rescueDialogue: [
                "My brave knight! You have saved not only me, but all the travelers of Roadlandia!",
                "Your perfect mastery of traffic wisdom has broken Lord Violation's power forever.",
                "Rise, Grand Champion of the Road. The kingdom will sing of your deeds for generations!"
            ]
        }
    },

    // Princess Permit's contextual messages (per-floor messages live on each floor in the curriculum)
    princessMessages: {
        beforeBoss: "You've come so far, brave knight! Remember - only perfection can shatter my chains!",
        firstVictory: "You did it! My first guardian has fallen! I knew you were destined for greatness!",
        halfway: "Halfway up the tower! Your dedication fills me with hope, brave knight!",
        nearEnd: "So close I can almost see you! Lord Violation trembles at your approach!"
    },

    // Dynamic princess messages based on performance
    princessPerformanceMessages: {
        perfect: [
            "Perfect! Your flawless knowledge shines like a beacon of hope!",
            "Incredible! Not a single mistake! You truly are a master of the road!",
            "Flawless victory! Lord Violation must be terrified of your expertise!"
        ],
        excellent: [
            "Outstanding work! Your skill grows stronger with each floor!",
            "Excellent! I can feel the tower's dark magic weakening!",
            "Superb knowledge! You fight like a true Knight of the Road!"
        ],
        good: [
            "Well fought! Each victory brings us closer together!",
            "Good work! Your determination inspires me greatly!",
            "Solid effort! You're learning and growing stronger!"
        ],
        struggle: [
            "Don't give up! Even the greatest knights face challenges!",
            "Stay strong! Knowledge comes to those who persist!",
            "Keep trying! I believe in you, brave knight!"
        ]
    },

    // Princess reactions to consecutive victories, keyed by number of floors conquered
    princessStreakMessages: {
        3: "Three victories! You're on fire, noble knight!",
        5: "Five floors conquered! Lord Violation grows desperate!",
        8: "Eight guardians defeated! Your legend grows with each step!",
        10: "Ten floors climbed! The summit draws near!"
    },

    // Game configuration (floor counts come from the curriculum, never from here)
    config: {
        questionsPerBossTrial: 20,
        passingGradeFloor: 100, // Must answer all correctly to defeat enemy
        passingGradeBoss: 100,  // Must get 100% on each trial
        allowRetry: true,
        showProgressDuringBattle: true,
        showProgressDuringBoss: false, // No feedback during boss trials
        // Bumped from 'adventureProgress' when floor ids were restructured for Washington
        storageKey: 'adventureProgress-v2'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = adventureData;
} else if (typeof window !== 'undefined') {
    window.adventureData = adventureData;
}

// Princess Permit's Rescue - Main Adventure Game Class
// Clean architecture designed specifically for the adventure experience

class AdventureGame {
    constructor() {
        // Core game state
        this.currentScreen = 'story-intro';
        this.gamePhase = 'intro'; // 'intro', 'tower', 'boss', 'victory'
        
        // Adventure-specific state
        this.currentFloor = null;
        this.currentEnemy = null;
        this.currentBattle = null;
        this.adventureProgress = this.loadAdventureProgress();
        
        // Battle state
        this.battleQuestions = [];
        this.currentQuestionIndex = 0;
        this.enemyHealth = 0;
        this.maxEnemyHealth = 0;
        this.playerAnswers = [];
        this.battleStartTime = null;
        this.missedQuestions = [];
        this.attemptWasClean = true; // false once the player misses anything on this floor
        this.currentBattleIsRetry = false; // true while re-fighting only the missed questions
        this.battleActive = false;
        this.battleAdvanceTimer = null;
        
        // Boss battle state
        this.bossPhase = 0; // 0, 1, 2 (3 trials)
        this.bossTrialResults = [];
        
        // Don't auto-initialize - let the HTML code call initializeAdventure() when ready
    }

    // ===== INITIALIZATION =====
    async initializeAdventure() {
        console.log('🔍 initializeAdventure: Starting...');
        
        try {
            // Load and validate adventure data
            console.log('🔍 initializeAdventure: Checking adventure data...');
            if (typeof curriculum === 'undefined' || typeof adventureData === 'undefined') {
                console.error('❌ Curriculum or adventure data not loaded!');
                return;
            }
            console.log('✅ Adventure data is available');
            
            // Validate question data integration
            console.log('🔍 initializeAdventure: Validating question data integration...');
            if (!this.validateQuestionDataIntegration()) {
                console.error('❌ Question data integration failed!');
                return;
            }
            console.log('✅ Question data integration validated');
            
            // Register service worker (reuse existing logic)
            console.log('🔍 initializeAdventure: Registering service worker...');
            this.registerServiceWorker();
            console.log('✅ Service worker registration attempted');
            
            // Initialize UI
            console.log('🔍 initializeAdventure: Updating UI...');
            this.updateUI();
            if (typeof soundEffects !== 'undefined') soundEffects.init();
            this.checkManifestDrift();
            // Record badges already satisfied by a saved game, without replaying their toasts
            this.awardAchievements(false);
            console.log('✅ UI updated');
            
            // Log integration statistics
            console.log('🔍 initializeAdventure: Logging integration statistics...');
            this.logQuestionIntegrationStats();
            console.log('✅ Integration statistics logged');
            
            // Hide loading screen and start adventure
            console.log('🔍 initializeAdventure: Hiding loading screen...');
            this.hideLoadingScreen();
            console.log('✅ Loading screen hide initiated');
            
            // Show appropriate screen based on progress
            console.log('🔍 initializeAdventure: Determining initial screen...');
            if (this.adventureProgress.floorsCompleted.length > 0 || this.adventureProgress.currentFloor > 1) {
                console.log('🏰 Player has progress - showing kingdom welcome screen');
                this.showScreen('welcome-screen');
            } else {
                console.log('📚 New player - showing story intro');
                this.showStoryIntro();
            }
            console.log('✅ Initial screen set');
            
            console.log('🎉 initializeAdventure: Complete!');
        } catch (error) {
            console.error('❌ Error in initializeAdventure:', error);
            console.error('❌ Stack trace:', error.stack);
            throw error; // Re-throw so the calling code can handle it
        }
    }

    // ===== QUESTION DATA INTEGRATION =====
    validateQuestionDataIntegration() {
        // Ensure questionsData is available
        if (typeof questionsData === 'undefined') {
            console.error('questionsData is not loaded!');
            return false;
        }

        // Validate that all floor categories have corresponding questions
        let validationPassed = true;
        
        curriculum.floors.forEach(floor => {
            const category = floor.category;
            const questions = questionsData[category];
            
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                console.error(`No questions found for category: ${category} (Floor ${floor.id})`);
                validationPassed = false;
                return;
            }

            // Validate question structure
            const sampleQuestion = questions[0];
            if (!this.validateQuestionStructure(sampleQuestion)) {
                console.error(`Invalid question structure in category: ${category}`);
                validationPassed = false;
                return;
            }

            console.log(`✓ Category '${category}' validated: ${questions.length} questions`);
        });

        // Validate mixed questions for boss battles
        const allCategoriesQuestions = this.getAllQuestionsForBoss();
        const perTrial = adventureData.config.questionsPerBossTrial;
        if (allCategoriesQuestions.length < perTrial) {
            console.error(`Insufficient questions for boss battles (need at least ${perTrial})`);
            validationPassed = false;
        } else {
            console.log(`✓ Boss battles validated: ${allCategoriesQuestions.length} total questions available`);
        }

        return validationPassed;
    }

    validateQuestionStructure(question) {
        // Validate that a question has the required structure
        if (!question || typeof question !== 'object') return false;
        
        const requiredFields = ['question', 'answers', 'correct', 'explanation'];
        for (let field of requiredFields) {
            if (!(field in question)) {
                console.error(`Question missing required field: ${field}`);
                return false;
            }
        }

        // Validate answers array
        if (!Array.isArray(question.answers) || question.answers.length < 2) {
            console.error('Question must have at least 2 answers');
            return false;
        }

        // Validate correct answer index
        if (typeof question.correct !== 'number' || 
            question.correct < 0 || 
            question.correct >= question.answers.length) {
            console.error('Question has invalid correct answer index');
            return false;
        }

        return true;
    }

    getAllQuestionsForBoss() {
        // Get all questions from all categories for boss battles
        const allQuestions = [];
        
        Object.entries(questionsData).forEach(([category, questions]) => {
            if (Array.isArray(questions) && category !== 'mixed') {
                // Add sourceCategory to track origin
                const questionsWithSource = questions.map(q => ({
                    ...q,
                    sourceCategory: category
                }));
                allQuestions.push(...questionsWithSource);
            }
        });

        return allQuestions;
    }

    getQuestionsForCategory(category) {
        // Get questions for a specific category with validation
        const questions = questionsData[category];
        
        if (!questions || !Array.isArray(questions)) {
            console.error(`No questions available for category: ${category}`);
            return [];
        }

        // Add sourceCategory for tracking
        return questions.map(q => ({
            ...q,
            sourceCategory: category
        }));
    }

    getRandomBossQuestions(count = adventureData.config.questionsPerBossTrial) {
        // Get a random selection of questions for boss trials
        const allQuestions = this.getAllQuestionsForBoss();
        
        if (allQuestions.length < count) {
            console.warn(`Only ${allQuestions.length} questions available, requested ${count}`);
            return this.shuffleArray(allQuestions);
        }

        return this.shuffleArray(allQuestions).slice(0, count);
    }

    getCategoryStats() {
        // Get statistics about question categories
        const stats = {};
        
        Object.entries(questionsData).forEach(([category, questions]) => {
            if (Array.isArray(questions) && category !== 'mixed') {
                stats[category] = {
                    count: questions.length,
                    hasFloor: curriculum.floors.some(floor => floor.category === category)
                };
            }
        });

        return stats;
    }

    logQuestionIntegrationStats() {
        // Log comprehensive question integration statistics
        console.log('\n🎮 PRINCESS PERMIT\'S RESCUE - QUESTION INTEGRATION STATS 🎮');
        console.log('═══════════════════════════════════════════════════════════');
        
        const stats = this.getCategoryStats();
        const totalQuestions = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
        const perTrial = adventureData.config.questionsPerBossTrial;
        const trialCount = adventureData.boss.enemy.phases.length;
        
        console.log(`📊 Total Questions Available: ${totalQuestions}`);
        console.log(`🏰 Adventure Floors: ${curriculum.floors.length}`);
        console.log(`👑 Boss Questions Required: ${perTrial} per trial (${perTrial * trialCount} total for ${trialCount} trials)`);
        console.log('\n📚 Category Breakdown:');
        
        Object.entries(stats).forEach(([category, stat]) => {
            const floorInfo = stat.hasFloor ? '✅' : '⚠️ ';
            const floor = curriculum.floors.find(f => f.category === category);
            const floorName = floor ? `(Floor ${floor.id}: ${floor.name})` : '(No floor assigned)';
            console.log(`  ${floorInfo} ${category}: ${stat.count} questions ${floorName}`);
        });
        
        console.log('\n🗡️ Combat Integration:');
        console.log(`  • Floor Battles: Using category-specific questions`);
        console.log(`  • Boss Trials: Using mixed questions from all categories`);
        console.log(`  • Progress Tracking: Integrated with question performance`);
        
        const bossQuestions = this.getAllQuestionsForBoss();
        console.log(`\n👹 Boss Battle Readiness:`);
        console.log(`  • Available Questions: ${bossQuestions.length}`);
        console.log(`  • Required per Trial: ${perTrial}`);
        console.log(`  • Max Unique Trials: ${Math.floor(bossQuestions.length / perTrial)}`);
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('🚀 Adventure Ready! Questions successfully integrated! 🚀\n');
    }

    registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        // sw.js is served from the site root. Registration fails on file://, which is fine.
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.warn('Service worker registration failed:', error);
        });
    }

    // manifest.json is requested before any script runs, so it cannot read curriculum.state.
    // Warn when its description no longer names the state, which is the hand-edited copy.
    checkManifestDrift() {
        fetch('manifest.json')
            .then(response => response.ok ? response.json() : null)
            .then(manifest => {
                if (!manifest) return;
                const stateName = curriculum.state.name;
                if (!manifest.description || !manifest.description.includes(stateName)) {
                    console.warn(`manifest.json description does not mention ${stateName}. Update it by hand if the state changed.`);
                }
            })
            .catch(error => {
                console.warn('Could not read manifest.json to check the state name:', error);
            });
    }

    hideLoadingScreen() {
        // Hide the loading overlay to reveal the adventure game
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loading');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                console.log('🏰 Loading complete! Welcome to the adventure!');
            }
        }, 1200); // Slight delay to let users see the stats
    }

    // ===== SCREEN MANAGEMENT =====
    showScreen(screenId, transitionType = 'default') {
        console.log('showScreen called with:', screenId);
        const currentScreen = document.querySelector('.adventure-screen.active');
        const targetScreen = document.getElementById(screenId);
        
        if (!targetScreen) {
            console.error(`Screen not found: ${screenId}`);
            return;
        }
        
        console.log('Target screen found, transitioning from:', currentScreen?.id, 'to:', screenId);
        
        // Apply enhanced story transitions
        this.performStoryTransition(currentScreen, targetScreen, transitionType);
        
        this.currentScreen = screenId;
    }

    performStoryTransition(currentScreen, targetScreen, transitionType) {
        switch (transitionType) {
            case 'victory':
                this.victoryTransition(currentScreen, targetScreen);
                break;
            case 'defeat': 
                this.defeatTransition(currentScreen, targetScreen);
                break;
            case 'epic-entrance':
                this.epicEntranceTransition(currentScreen, targetScreen);
                break;
            case 'story-reveal':
                this.storyRevealTransition(currentScreen, targetScreen);
                break;
            default:
                this.defaultTransition(currentScreen, targetScreen);
                break;
        }
    }

    victoryTransition(currentScreen, targetScreen) {
        if (currentScreen) {
            currentScreen.style.transition = 'all 0.8s ease-out';
            currentScreen.style.transform = 'scale(0.9) rotate(1deg)';
            currentScreen.style.opacity = '0';
            currentScreen.style.filter = 'brightness(1.2) blur(3px)';
            
            setTimeout(() => {
                currentScreen.classList.remove('active');
            }, 400);
        }
        
        setTimeout(() => {
            targetScreen.classList.add('active');
            targetScreen.style.opacity = '0';
            targetScreen.style.transform = 'scale(1.1)';
            targetScreen.style.filter = 'brightness(1.1)';
            targetScreen.style.transition = 'all 0.8s ease-out';
            
            setTimeout(() => {
                targetScreen.style.opacity = '1';
                targetScreen.style.transform = 'scale(1)';
                targetScreen.style.filter = 'brightness(1)';
            }, 50);
        }, 400);
    }

    defeatTransition(currentScreen, targetScreen) {
        if (currentScreen) {
            currentScreen.style.transition = 'all 0.6s ease-in';
            currentScreen.style.transform = 'scale(0.95)';
            currentScreen.style.opacity = '0';
            currentScreen.style.filter = 'brightness(0.4) blur(2px)';
            
            setTimeout(() => {
                currentScreen.classList.remove('active');
                // Clear inline styles after transition
                currentScreen.style.transition = '';
                currentScreen.style.transform = '';
                currentScreen.style.opacity = '';
                currentScreen.style.filter = '';
            }, 600);
        }
        
        setTimeout(() => {
            targetScreen.classList.add('active');
            targetScreen.style.opacity = '0';
            targetScreen.style.transform = 'scale(0.98)';
            targetScreen.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                targetScreen.style.opacity = '1';
                targetScreen.style.transform = 'scale(1)';
                
                // Clear inline styles after transition completes
                setTimeout(() => {
                    targetScreen.style.transition = '';
                    targetScreen.style.transform = '';
                    targetScreen.style.opacity = '';
                    targetScreen.style.filter = '';
                    console.log('Defeat transition complete, inline styles cleared');
                }, 650);
            }, 50);
        }, 400);
    }

    epicEntranceTransition(currentScreen, targetScreen) {
        if (currentScreen) {
            currentScreen.style.transition = 'all 0.7s ease-in';
            currentScreen.style.transform = 'scale(0.8) rotateY(10deg)';
            currentScreen.style.opacity = '0';
            
            setTimeout(() => {
                currentScreen.classList.remove('active');
            }, 350);
        }
        
        setTimeout(() => {
            targetScreen.classList.add('active');
            targetScreen.style.opacity = '0';
            targetScreen.style.transform = 'scale(1.2) rotateY(-8deg)';
            targetScreen.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            setTimeout(() => {
                targetScreen.style.opacity = '1';
                targetScreen.style.transform = 'scale(1) rotateY(0deg)';
            }, 50);
        }, 400);
    }

    storyRevealTransition(currentScreen, targetScreen) {
        if (currentScreen) {
            currentScreen.style.transition = 'all 1s ease-out';
            currentScreen.style.transform = 'translateY(-50px)';
            currentScreen.style.opacity = '0';
            
            setTimeout(() => {
                currentScreen.classList.remove('active');
            }, 500);
        }
        
        setTimeout(() => {
            targetScreen.classList.add('active');
            targetScreen.style.opacity = '0';
            targetScreen.style.transform = 'translateY(50px)';
            targetScreen.style.transition = 'all 1s ease-out';
            
            setTimeout(() => {
                targetScreen.style.opacity = '1';
                targetScreen.style.transform = 'translateY(0)';
            }, 50);
        }, 500);
    }

    defaultTransition(currentScreen, targetScreen) {
        if (currentScreen) {
            currentScreen.classList.remove('active');
        }
        
        setTimeout(() => {
            targetScreen.classList.add('active');
            // Ensure no inline styles are interfering with the active state
            targetScreen.style.opacity = '';
            targetScreen.style.visibility = '';
            targetScreen.style.transform = '';
            targetScreen.style.filter = '';
        }, 100);
    }

    // ===== ADVENTURE PROGRESS SYSTEM =====
    loadAdventureProgress() {
        const defaultProgress = {
            floorsCompleted: [],
            currentFloor: 1,
            artifactsCollected: [],
            bossUnlocked: false,
            gameCompleted: false,
            totalPlayTime: 0,
            attempts: {
                floors: {},
                boss: 0
            },
            floorStats: {}, // Enhanced floor statistics for Phase 3
            achievements: {}, // id -> true, once a badge is earned
            stats: {
                questionsAnswered: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                enemiesDefeated: 0,
                perfectFloors: 0,
                bossAttempts: 0
            }
        };

        // The Missouri-era key. Floor ids changed meaning, so it is discarded, not merged.
        localStorage.removeItem('adventureProgress');

        const saved = localStorage.getItem(adventureData.config.storageKey);
        if (!saved) return defaultProgress;

        try {
            const parsed = JSON.parse(saved);
            return { ...defaultProgress, ...parsed };
        } catch (error) {
            console.error('Error loading adventure progress:', error);
            return defaultProgress;
        }
    }

    saveAdventureProgress() {
        localStorage.setItem(adventureData.config.storageKey, JSON.stringify(this.adventureProgress));
    }

    // ===== STORY SYSTEM =====
    showStoryIntro() {
        this.gamePhase = 'intro';
        this.displayStorySequence(adventureData.story.opening);
        this.showScreen('story-screen');
    }

    displayStorySequence(storyData) {
        const storyContainer = document.getElementById('story-content');
        if (!storyContainer) return;

        // Create story sequence with initial hidden state for animations
        storyContainer.innerHTML = `
            <div class="story-sequence">
                <h2 class="story-title">${storyData.title}</h2>
                <div class="story-text" id="story-text-container">
                    <!-- Paragraphs will be added dynamically with typewriter effect -->
                </div>
                <button class="story-continue-btn" onclick="adventureGame.continueFromStory()">
                    ${this.gamePhase === 'intro' ? 'Begin Your Quest' : 'Continue Adventure'}
                </button>
            </div>
        `;

        // Start animated text sequence
        this.animateStoryText(storyData.text);
    }

    animateStoryText(paragraphs) {
        const container = document.getElementById('story-text-container');
        if (!container) return;

        let currentParagraph = 0;
        let animationDelay = 1500; // Start after title animation

        const addNextParagraph = () => {
            if (currentParagraph >= paragraphs.length) {
                // Story text complete, show button with delay
                const button = document.querySelector('.story-continue-btn');
                if (button) {
                    button.style.animationDelay = '0.5s';
                }
                return;
            }

            const paragraph = document.createElement('p');
            paragraph.className = 'story-paragraph';
            paragraph.textContent = paragraphs[currentParagraph];
            
            // Add staggered animation delay for each paragraph
            paragraph.style.animationDelay = `${animationDelay / 1000}s`;
            
            // All paragraphs use fade-in animation - simple and reliable
            
            container.appendChild(paragraph);
            currentParagraph++;
            animationDelay += 800; // 0.8s between paragraphs

            // Schedule next paragraph
            setTimeout(addNextParagraph, 800); // Consistent timing for all paragraphs
        };

        // Start the animation sequence
        setTimeout(addNextParagraph, animationDelay);
    }

    continueFromStory() {
        if (this.gamePhase === 'intro') {
            this.showTowerMap();
        } else if (this.gamePhase === 'victory') {
            this.returnToTowerMap();
        }
    }

    // ===== TOWER PROGRESSION =====
    showTowerMap() {
        this.gamePhase = 'tower';
        this.updateTowerMapDisplay();
        this.showScreen('tower-map-screen');
    }

    showTowerMapVictorious() {
        this.gamePhase = 'tower';
        this.updateTowerMapDisplay();
        this.showScreen('tower-map-screen', 'victory');
    }

    showTowerMapDefeated() {
        this.gamePhase = 'tower';
        this.updateTowerMapDisplay();
        this.showScreen('tower-map-screen', 'defeat');
    }

    updateTowerMapDisplay() {
        const mapContainer = document.getElementById('tower-map');
        if (!mapContainer) return;

        // Ensure currentFloor is properly set based on completed floors
        this.updateCurrentFloor();

        // Create enhanced tower visualization with progress indicators
        let mapHTML = '<div class="tower-floors">';
        
        // Boss level (top) - Enhanced with better visual indicators
        const bossUnlocked = this.adventureProgress.floorsCompleted.length >= curriculum.totalFloors;
        const bossAttempts = this.adventureProgress.stats.bossAttempts || 0;
        mapHTML += `
            <div class="floor-level boss-level ${bossUnlocked ? 'unlocked' : 'locked'}" 
                 onclick="${bossUnlocked ? 'adventureGame.enterBoss()' : ''}">
                <div class="floor-icon">👑</div>
                <div class="floor-number boss-number">${curriculum.bossFloorId}</div>
                <div class="floor-info">
                    <h3>Lord Violation's Throne</h3>
                    <p>${bossUnlocked ? 'Face the final challenge!' : 'Defeat all enemies first'}</p>
                    ${bossAttempts > 0 ? `<span class="attempt-badge">Attempts: ${bossAttempts}</span>` : ''}
                    <div class="floor-difficulty">
                        <span class="difficulty-label">Difficulty:</span>
                        <div class="difficulty-stars">⭐⭐⭐⭐⭐</div>
                    </div>
                </div>
                <div class="floor-status">
                    ${bossUnlocked ? '<span class="status-ready">Ready!</span>' : '<span class="status-locked">Locked</span>'}
                </div>
            </div>
        `;

        // Wings from the top of the tower down, each header followed by its floors (highest first)
        [...curriculum.parts].reverse().forEach(part => {
            mapHTML += this.renderWingHeader(part);
            [...part.floors].reverse().forEach(floor => {
                mapHTML += this.renderTowerFloor(floor);
            });
        });

        mapHTML += '</div>';
        
        // Enhanced progress information with milestone celebrations
        mapHTML += `
            <div class="tower-progress">
                <div class="progress-header">
                    <h3>🏰 Quest Progress</h3>
                    <div class="progress-percentage">${Math.round((this.adventureProgress.floorsCompleted.length / curriculum.totalFloors) * 100)}%</div>
                </div>
                <div class="progress-stats">
                    <div class="stat-item">
                        <span class="stat-icon">⚔️</span>
                        <span class="stat-label">Floors Conquered</span>
                        <span class="stat-value">${this.adventureProgress.floorsCompleted.length}/${curriculum.totalFloors}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">💎</span>
                        <span class="stat-label">Artifacts Found</span>
                        <span class="stat-value">${this.adventureProgress.artifactsCollected.length}/${curriculum.totalFloors}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🎯</span>
                        <span class="stat-label">Overall Accuracy</span>
                        <span class="stat-value">${this.getOverallAccuracy()}%</span>
                    </div>
                </div>
                <div class="next-objective">
                    ${this.getNextObjective()}
                </div>
                ${this.getMilestoneCelebration()}
            </div>
        `;

        mapContainer.innerHTML = mapHTML;
        
        // Add visual enhancements after DOM update
        this.addTowerMapEnhancements();
    }

    // Banner shown above each wing's floors on the tower map
    renderWingHeader(part) {
        const completed = part.floors.filter(f => this.adventureProgress.floorsCompleted.includes(f.id)).length;
        return `
            <div class="wing-header ${completed === part.floors.length ? 'wing-cleared' : ''}">
                <span class="wing-icon">${part.icon}</span>
                <div class="wing-text">
                    <h3 class="wing-name">${part.name}</h3>
                    <p class="wing-subtitle">${part.subtitle} - Guide Part ${part.guidePart} (${completed}/${part.floors.length})</p>
                </div>
            </div>
        `;
    }

    renderTowerFloor(floor) {
        const i = floor.id;
        const isCompleted = this.adventureProgress.floorsCompleted.includes(i);
        const isUnlocked = i <= this.adventureProgress.currentFloor;
        const isCurrent = i === this.adventureProgress.currentFloor && !isCompleted;
        const floorStats = this.adventureProgress.floorStats?.[i] || {};
        const attempts = floorStats.attempts || 0;
        const bestScore = floorStats.bestScore || 0;
        const difficulty = this.getFloorDifficulty(i);

        return `
            <div class="floor-level ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}" 
                 onclick="${isUnlocked ? `adventureGame.enterFloor(${i})` : ''}">
                <div class="floor-number">${i}</div>
                <div class="floor-icon">${floor.enemy.portrait}</div>
                <div class="floor-info">
                    <h3>${floor.name}</h3>
                    <p>${floor.enemy.name}</p>
                    <div class="floor-difficulty">
                        <span class="difficulty-label">Difficulty:</span>
                        <div class="difficulty-stars">${this.getDifficultyStars(difficulty)}</div>
                        <div class="difficulty-info" onclick="adventureGame.showDifficultyInfo(${i}, event)">
                            <span class="info-icon">ℹ️</span>
                        </div>
                    </div>
                    ${isCompleted ? `
                        <div class="completion-info">
                            <span class="completed-badge">✓ Defeated</span>
                            ${bestScore > 0 ? `<span class="score-badge">Best: ${bestScore}%</span>` : ''}
                        </div>
                    ` : ''}
                    ${attempts > 0 ? `<span class="attempt-badge">Attempts: ${attempts}</span>` : ''}
                </div>
                <div class="floor-status">
                    ${isCompleted ? '<span class="status-completed">✓</span>' : 
                      isCurrent ? '<span class="status-current">Current</span>' : 
                      isUnlocked ? '<span class="status-unlocked">Available</span>' : 
                      '<span class="status-locked">Locked</span>'}
                </div>
                <div class="floor-progress">
                    ${this.getFloorProgressBar(i)}
                </div>
            </div>
        `;
    }

    // ===== TOWER MAP HELPER METHODS =====
    getFloorDifficulty(floorId) {
        // Difficulty is a property of the wing the floor belongs to (see js/curriculum.js)
        return curriculum.floorById(floorId).difficulty;
    }

    getFloorDifficultyInfo(floorId) {
        // Get detailed difficulty information and guidance
        const difficulty = this.getFloorDifficulty(floorId);
        const floor = curriculum.floorById(floorId);
        
        // Per-level labels only; what to study comes from the floor itself (js/curriculum.js)
        const difficultyInfo = {
            1: { name: 'Easy', description: 'Foundational knowledge', timeEstimate: '5-10 minutes' },
            2: { name: 'Medium', description: 'Intermediate material', timeEstimate: '8-15 minutes' },
            3: { name: 'Hard', description: 'Demanding judgment calls', timeEstimate: '12-20 minutes' },
            4: { name: 'Very Hard', description: 'Complex road situations', timeEstimate: '15-25 minutes' },
            5: { name: 'Extreme', description: 'Master-level risk management', timeEstimate: '20-30 minutes' }
        };

        return {
            ...difficultyInfo[difficulty],
            floor: floor,
            enemy: floor.enemy,
            category: this.formatCategoryName(floor.category),
            preparation: `Review the ${curriculum.state.guideTitle}, sections ${floor.guideSections.join(', ')}.`,
            tips: floor.studyTips,
            recommendedAccuracy: this.getRecommendedAccuracy(difficulty)
        };
    }

    getRecommendedAccuracy(difficulty) {
        // Get recommended accuracy for each difficulty level
        const recommendations = {
            1: 70, // Easy - 70% accuracy acceptable
            2: 75, // Medium - 75% accuracy recommended
            3: 80, // Hard - 80% accuracy expected
            4: 85, // Very Hard - 85% accuracy required
            5: 90  // Extreme - 90% accuracy needed
        };
        return recommendations[difficulty] || 80;
    }

    getPlayerGuidance(floorId) {
        // Generate personalized guidance based on player progress
        const progress = this.adventureProgress;
        const floorStats = progress.floorStats?.[floorId] || {};
        const difficulty = this.getFloorDifficulty(floorId);
        const overallAccuracy = this.getOverallAccuracy();
        
        const guidance = {
            preparation: [],
            warnings: [],
            encouragement: [],
            tips: []
        };

        // Preparation guidance based on difficulty
        const difficultyInfo = this.getFloorDifficultyInfo(floorId);
        guidance.preparation.push(difficultyInfo.preparation);

        // Warnings based on previous performance
        if (floorStats.attempts > 3 && floorStats.bestScore < 70) {
            guidance.warnings.push(`This floor has been challenging. Consider reviewing ${difficultyInfo.category} rules before attempting again.`);
        }

        if (overallAccuracy < 75 && difficulty >= 3) {
            guidance.warnings.push('Your overall accuracy is below recommended levels. Consider practicing easier floors first.');
        }

        // Encouragement based on progress
        if (floorStats.bestScore >= 90) {
            guidance.encouragement.push('You\'ve achieved excellent scores on this floor! You\'re ready for the challenge.');
        } else if (floorStats.bestScore >= 80) {
            guidance.encouragement.push('Good performance so far! You\'re well-prepared for this floor.');
        } else if (floorStats.attempts === 0) {
            guidance.encouragement.push('First time attempting this floor! Take your time and read each question carefully.');
        } else {
            guidance.encouragement.push('Each attempt makes you stronger. Focus on the areas you\'ve struggled with before.');
        }

        // Tips come straight from the floor (copied so callers can't mutate the curriculum)
        guidance.tips = [...difficultyInfo.tips];

        return guidance;
    }

    showDifficultyInfo(floorId, event) {
        // Show detailed difficulty information and player guidance
        event.stopPropagation();
        
        const difficultyInfo = this.getFloorDifficultyInfo(floorId);
        const guidance = this.getPlayerGuidance(floorId);
        
        // Create difficulty info modal
        const modal = document.createElement('div');
        modal.className = 'difficulty-modal-overlay';
        modal.innerHTML = `
            <div class="difficulty-modal">
                <div class="difficulty-header">
                    <h3>🎯 Floor ${floorId}: ${difficultyInfo.floor?.name || 'Unknown'}</h3>
                    <button class="difficulty-close" onclick="this.closest('.difficulty-modal-overlay').remove()">×</button>
                </div>
                
                <div class="difficulty-content">
                    <div class="difficulty-overview">
                        <div class="difficulty-badge difficulty-${difficultyInfo.name.toLowerCase().replace(' ', '-')}">
                            <span class="difficulty-level">${difficultyInfo.name}</span>
                            <div class="difficulty-stars">${this.getDifficultyStars(this.getFloorDifficulty(floorId))}</div>
                        </div>
                        <div class="difficulty-details">
                            <p><strong>Category:</strong> ${difficultyInfo.category}</p>
                            <p><strong>Description:</strong> ${difficultyInfo.description}</p>
                            <p><strong>Estimated Time:</strong> ${difficultyInfo.timeEstimate}</p>
                            <p><strong>Recommended Accuracy:</strong> ${difficultyInfo.recommendedAccuracy}%</p>
                        </div>
                    </div>
                    
                    <div class="guidance-section">
                        <h4>📚 Preparation</h4>
                        <div class="guidance-item preparation">
                            <p>${guidance.preparation.join(' ')}</p>
                        </div>
                        
                        ${guidance.encouragement.length > 0 ? `
                            <h4>💪 Encouragement</h4>
                            <div class="guidance-item encouragement">
                                <p>${guidance.encouragement.join(' ')}</p>
                            </div>
                        ` : ''}
                        
                        ${guidance.warnings.length > 0 ? `
                            <h4>⚠️ Warnings</h4>
                            <div class="guidance-item warnings">
                                <p>${guidance.warnings.join(' ')}</p>
                            </div>
                        ` : ''}
                        
                        <h4>💡 Tips for Success</h4>
                        <div class="guidance-item tips">
                            <ul>
                                ${guidance.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="difficulty-actions">
                    <button class="difficulty-btn primary" onclick="adventureGame.enterFloor(${floorId}); this.closest('.difficulty-modal-overlay').remove();">
                        ⚔️ Challenge This Floor
                    </button>
                    <button class="difficulty-btn secondary" onclick="this.closest('.difficulty-modal-overlay').remove();">
                        Close
                    </button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(modal);

        // Add entrance animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    getDifficultyStars(difficulty) {
        const stars = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
        return stars[difficulty - 1] || stars[0];
    }

    getFloorProgressBar(floorId) {
        const floorStats = this.adventureProgress.floorStats?.[floorId] || {};
        const attempts = floorStats.attempts || 0;
        const isCompleted = this.adventureProgress.floorsCompleted.includes(floorId);
        
        if (isCompleted) {
            return '<div class="progress-bar completed"><div class="progress-fill" style="width: 100%"></div></div>';
        } else if (attempts > 0) {
            const progress = Math.min((attempts * 20), 80); // Show progress based on attempts, max 80% until completed
            return `<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>`;
        } else {
            return '<div class="progress-bar"><div class="progress-fill" style="width: 0%"></div></div>';
        }
    }

    getOverallAccuracy() {
        if (!this.adventureProgress.stats.totalQuestions || this.adventureProgress.stats.totalQuestions === 0) {
            return 0;
        }
        return Math.round((this.adventureProgress.stats.correctAnswers / this.adventureProgress.stats.totalQuestions) * 100);
    }

    getNextObjective() {
        const completedFloors = this.adventureProgress.floorsCompleted.length;
        
        if (completedFloors >= curriculum.totalFloors) {
            return `
                <div class="objective boss-ready">
                    <span class="objective-icon">👑</span>
                    <div class="objective-text">
                        <h4>Ready for the Final Battle!</h4>
                        <p>Face Lord Violation in his throne room</p>
                    </div>
                </div>
            `;
        } else {
            const nextFloor = this.adventureProgress.currentFloor;
            const floor = curriculum.floorById(nextFloor);
            return `
                <div class="objective next-floor">
                    <span class="objective-icon">⚔️</span>
                    <div class="objective-text">
                        <h4>Next Challenge: Floor ${nextFloor}</h4>
                        <p>Face ${floor?.enemy.name || 'the enemy'} in ${floor?.name || 'the tower'}</p>
                    </div>
                </div>
            `;
        }
    }

    getMilestoneCelebration() {
        const completedFloors = this.adventureProgress.floorsCompleted.length;
        const progress = this.adventureProgress;
        
        // Check for various milestone achievements
        if (completedFloors === 0) {
            return '<div class="milestone first-floor"><span class="milestone-icon">🎯</span><span class="milestone-text">Begin your quest by conquering the first floor!</span></div>';
        } else if (completedFloors >= curriculum.totalFloors) {
            return '<div class="milestone all-complete"><span class="milestone-icon">👑</span><span class="milestone-text">All floors conquered! Ready to face Lord Violation!</span></div>';
        }

        // A wing was just cleared
        const clearedWing = this.getJustClearedWing();
        if (clearedWing) {
            const { title, message } = this.describeWingCleared(clearedWing);
            return `<div class="milestone wing-cleared"><span class="milestone-icon">${clearedWing.icon}</span><span class="milestone-text">${title} ${message}</span></div>`;
        }
        
        // Check for accuracy milestones
        const overallAccuracy = this.getOverallAccuracy();
        if (overallAccuracy >= 90 && completedFloors >= 3) {
            return '<div class="milestone high-accuracy"><span class="milestone-icon">🎯</span><span class="milestone-text">Outstanding accuracy! You\'re a true master of the road!</span></div>';
        }
        
        // Check for perfect floor milestones
        const perfectFloors = progress.stats.perfectFloors || 0;
        if (perfectFloors >= 3 && completedFloors >= 5) {
            return '<div class="milestone perfect-master"><span class="milestone-icon">⭐</span><span class="milestone-text">Perfect mastery! You\'ve achieved flawless victories!</span></div>';
        }
        
        // Check for artifact collection milestones
        const artifactsCollected = progress.artifactsCollected.length;
        if (artifactsCollected >= 5 && completedFloors >= 5) {
            return '<div class="milestone treasure-hunter"><span class="milestone-icon">💎</span><span class="milestone-text">Treasure hunter! You\'ve collected many artifacts!</span></div>';
        }
        
        return '';
    }

    addTowerMapEnhancements() {
        // Add visual enhancements and animations to the tower map
        const floorLevels = document.querySelectorAll('.floor-level');
        
        floorLevels.forEach((floor, index) => {
            // Add staggered entrance animation
            floor.style.animationDelay = `${index * 0.1}s`;
            floor.classList.add('tower-entrance');
            
            // Add hover effects for completed episodes
            if (floor.classList.contains('completed')) {
                floor.addEventListener('click', (e) => {
                    if (e.target.closest('.floor-level')) {
                        this.showFloorReplayOptions(floor);
                    }
                });
            }
        });

        // Add progress bar animations
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const fill = bar.querySelector('.progress-fill');
            if (fill) {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 500);
            }
        });
    }

    showFloorReplayOptions(floorElement) {
        // Enhanced replay system for completed floors
        const floorNumber = parseInt(floorElement.querySelector('.floor-number').textContent);
        const floor = curriculum.floorById(floorNumber);
        const floorStats = this.adventureProgress.floorStats?.[floorNumber] || {};
        
        if (!floor) return;

        // Create replay options modal
        const modal = document.createElement('div');
        modal.className = 'replay-modal-overlay';
        modal.innerHTML = `
            <div class="replay-modal">
                <div class="replay-header">
                    <h3>🏰 Floor ${floorNumber}: ${floor.name}</h3>
                    <button class="replay-close" onclick="this.closest('.replay-modal-overlay').remove()">×</button>
                </div>
                
                <div class="replay-info">
                    <div class="floor-preview">
                        <div class="preview-icon">${floor.enemy.portrait}</div>
                        <div class="preview-details">
                            <h4>${floor.enemy.name}</h4>
                            <p>${floor.theme}</p>
                            <div class="difficulty-display">
                                <span>Difficulty: ${this.getDifficultyStars(this.getFloorDifficulty(floorNumber))}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="floor-stats">
                        <h4>Your Performance</h4>
                        <div class="stat-grid">
                            <div class="stat-item">
                                <span class="stat-label">Attempts:</span>
                                <span class="stat-value">${floorStats.attempts || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Victories:</span>
                                <span class="stat-value">${floorStats.victories || 0}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Best Score:</span>
                                <span class="stat-value">${floorStats.bestScore || 0}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Perfect Runs:</span>
                                <span class="stat-value">${floorStats.perfectRuns || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="replay-options">
                    <h4>Replay Options</h4>
                    <div class="option-buttons">
                        <button class="replay-btn primary" onclick="adventureGame.startFloorReplay(${floorNumber}, 'normal')">
                            ⚔️ Standard Replay
                            <span class="btn-desc">Challenge this floor again</span>
                        </button>
                        <button class="replay-btn secondary" onclick="adventureGame.startFloorReplay(${floorNumber}, 'practice')">
                            🎯 Practice Mode
                            <span class="btn-desc">Learn without pressure</span>
                        </button>
                        <button class="replay-btn tertiary" onclick="adventureGame.startFloorReplay(${floorNumber}, 'speedrun')">
                            ⚡ Speed Challenge
                            <span class="btn-desc">Race against time</span>
                        </button>
                    </div>
                </div>
                
                <div class="replay-actions">
                    <button class="replay-btn cancel" onclick="this.closest('.replay-modal-overlay').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(modal);

        // Add entrance animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    startFloorReplay(floorId, replayMode = 'normal') {
        // Start a floor replay with the specified mode
        const floor = curriculum.floorById(floorId);
        if (!floor) return;

        // Set replay mode
        this.currentReplayMode = replayMode;
        this.replayStartTime = Date.now();

        // Close any open modals
        const modals = document.querySelectorAll('.replay-modal-overlay');
        modals.forEach(modal => modal.remove());

        // Set up the floor for replay
        this.currentFloor = floor;
        this.currentEnemy = floor.enemy;

        // Record replay attempt
        this.recordReplayAttempt(floorId, replayMode);

        // Show floor intro with replay mode indicator
        this.showFloorIntroWithMode(floor, replayMode);
    }

    recordReplayAttempt(floorId, replayMode) {
        // Record replay attempt for statistics
        const floorStats = this.getFloorStats(floorId);
        floorStats.replays[replayMode] = (floorStats.replays[replayMode] || 0) + 1;
        floorStats.lastEntry = Date.now();
    }

    showFloorIntroWithMode(floor, replayMode) {
        // Show floor intro with replay mode context
        const introContainer = document.getElementById('floor-intro-content');
        if (!introContainer) return;

        const modeInfo = this.getReplayModeInfo(replayMode);

        // Create enhanced narrative intro sequence with replay context
        introContainer.innerHTML = `
            <div class="floor-intro replay-mode-${replayMode}">
                <div class="floor-header animated-entrance">
                    <h2>Floor ${floor.id}: ${floor.name}</h2>
                    <div class="floor-theme">${floor.theme}</div>
                    <div class="replay-mode-indicator">
                        <span class="mode-icon">${modeInfo.icon}</span>
                        <span class="mode-text">${modeInfo.title}</span>
                    </div>
                </div>

                <div class="enemy-intro animated-entrance" style="animation-delay: 0.3s;">
                    <div class="enemy-portrait-large">${floor.enemy.portrait}</div>
                    <div class="enemy-details">
                        <h3>${floor.enemy.name}</h3>
                        <p class="enemy-description">${floor.enemy.description}</p>
                        <div class="enemy-stats">
                            <span class="stat">Questions: ${questionsData[floor.category].length}</span>
                            <span class="stat">Difficulty: ${this.getDifficultyStars(this.getFloorDifficulty(floor.id))}</span>
                        </div>
                    </div>
                </div>

                <div class="replay-context animated-entrance" style="animation-delay: 0.6s;">
                    <h4>${modeInfo.contextTitle}</h4>
                    <p>${modeInfo.contextDescription}</p>
                    ${modeInfo.specialRules ? `<div class="special-rules">${modeInfo.specialRules}</div>` : ''}
                </div>

                <div class="floor-actions animated-entrance" style="animation-delay: 0.9s;">
                    <button class="adventure-btn btn-primary" onclick="adventureGame.startFloorBattle()">
                        ${modeInfo.actionText}
                    </button>
                    <button class="adventure-btn btn-secondary" onclick="adventureGame.showScreen('tower-map-screen')">
                        Return to Tower
                    </button>
                </div>
            </div>
        `;

        this.showScreen('floor-intro-screen');
    }

    getReplayModeInfo(replayMode) {
        // Get information about different replay modes
        const modeInfo = {
            normal: {
                icon: '⚔️',
                title: 'Standard Replay',
                contextTitle: 'Challenge Awaits',
                contextDescription: 'Face this floor again with the same challenge as before. Prove your mastery!',
                actionText: 'Begin Battle',
                specialRules: null
            },
            practice: {
                icon: '🎯',
                title: 'Practice Mode',
                contextTitle: 'Learning Session',
                contextDescription: 'Practice without pressure. Take your time to learn and improve your knowledge.',
                actionText: 'Start Practice',
                specialRules: '<strong>Practice Rules:</strong> No time pressure, detailed feedback after each question'
            },
            speedrun: {
                icon: '⚡',
                title: 'Speed Challenge',
                contextTitle: 'Speed Test',
                contextDescription: 'Challenge yourself to complete this floor as quickly as possible while maintaining accuracy.',
                actionText: 'Start Speedrun',
                specialRules: '<strong>Speed Rules:</strong> Timer active, bonus points for fast completion'
            }
        };

        return modeInfo[replayMode] || modeInfo.normal;
    }

    // ===== FLOOR BATTLES =====
    enterFloor(floorId) {
        // Enhanced floor entry with validation and unlock checking
        if (!this.canEnterFloor(floorId)) {
            this.showFloorUnlockMessage(floorId);
            return;
        }

        const floor = curriculum.floorById(floorId);
        if (!floor) return;

        // Record floor entry attempt
        this.recordFloorEntry(floorId);

        this.currentFloor = floor;
        this.currentEnemy = floor.enemy;
        this.showFloorIntro(floor);
    }

    canEnterFloor(floorId) {
        // Enhanced floor unlock validation
        const progress = this.adventureProgress;
        
        // Check if floor exists
        if (floorId < 1 || floorId > curriculum.totalFloors) {
            return false;
        }

        // Check if floor is unlocked
        if (floorId > progress.currentFloor) {
            return false;
        }

        // Check if floor is already completed (allow replay)
        if (progress.floorsCompleted.includes(floorId)) {
            return true; // Allow replay of completed floors
        }

        // Check if this is the current floor
        if (floorId === progress.currentFloor) {
            return true;
        }

        // Check if all previous floors are completed (safety check)
        for (let i = 1; i < floorId; i++) {
            if (!progress.floorsCompleted.includes(i)) {
                return false;
            }
        }

        return true;
    }

    showFloorUnlockMessage(floorId) {
        const progress = this.adventureProgress;
        const floor = curriculum.floorById(floorId);
        
        if (!floor) return;

        let message = '';
        if (floorId > progress.currentFloor) {
            const requiredFloor = progress.currentFloor;
            const requiredFloorData = curriculum.floorById(requiredFloor);
            message = `You must complete Floor ${requiredFloor}: ${requiredFloorData?.name || 'Unknown'} before accessing Floor ${floorId}: ${floor.name}.`;
        } else {
            message = `Floor ${floorId}: ${floor.name} is not yet accessible. Complete the previous floors to unlock it.`;
        }

        // Show unlock message with styling
        this.showUnlockNotification(message, 'floor-locked');
    }

    recordFloorEntry(floorId) {
        // Record floor entry for statistics
        const floorStats = this.getFloorStats(floorId);
        floorStats.entries++;
        floorStats.lastEntry = Date.now();
        
        // Don't save here - will be saved when battle completes
    }

    showUnlockNotification(message, type = 'info') {
        // Create and show unlock notification
        const notification = document.createElement('div');
        notification.className = `unlock-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'floor-locked' ? '🔒' : 'ℹ️'}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    unlockNextFloor(completedFloorId) {
        // Enhanced floor unlocking logic with milestone celebrations
        const progress = this.adventureProgress;
        
        // Unlock the next floor
        const nextFloor = completedFloorId + 1;
        if (nextFloor <= curriculum.totalFloors) {
            progress.currentFloor = Math.max(progress.currentFloor, nextFloor);
            
            // Show unlock celebration for next floor
            this.showFloorUnlockCelebration(nextFloor);
        }
        
        // Check for milestone unlocks
        this.checkMilestoneUnlocks();
        
        // Unlock boss if all floors completed
        if (progress.floorsCompleted.length >= curriculum.totalFloors) {
            progress.bossUnlocked = true;
            this.showBossUnlockCelebration();
        }
    }

    updateCurrentFloor() {
        // Ensure currentFloor is always set to the next available floor
        const progress = this.adventureProgress;
        const completedFloors = progress.floorsCompleted;
        
        // Find the highest completed floor and set currentFloor to the next one
        if (completedFloors.length > 0) {
            const highestCompleted = Math.max(...completedFloors);
            progress.currentFloor = Math.max(progress.currentFloor, highestCompleted + 1);
        } else {
            // If no floors are completed, currentFloor should be 1
            progress.currentFloor = Math.max(progress.currentFloor, 1);
        }
        
        // Ensure currentFloor doesn't exceed the top floor
        if (progress.currentFloor > curriculum.totalFloors) {
            progress.currentFloor = curriculum.totalFloors;
        }
        
        // Ensure currentFloor is at least 1
        if (progress.currentFloor < 1) {
            progress.currentFloor = 1;
        }
    }

    checkMilestoneUnlocks() {
        // Check for milestone achievements and unlock celebrations
        const progress = this.adventureProgress;
        const completedFloors = progress.floorsCompleted.length;
        
        progress.milestoneUnlocks = progress.milestoneUnlocks || {};

        // A cleared wing is celebrated by its achievement badge, so this only
        // remembers that the wing milestone happened. The "one floor left" toast
        // is not a badge and stays here.
        const clearedWing = this.getJustClearedWing();
        if (clearedWing && completedFloors < curriculum.totalFloors && !progress.milestoneUnlocks[clearedWing.id]) {
            progress.milestoneUnlocks[clearedWing.id] = true;
        } else if (completedFloors === curriculum.totalFloors - 1 && !progress.milestoneUnlocks.almostDone) {
            progress.milestoneUnlocks.almostDone = true;
            this.showMilestoneCelebration('almostDone', '⚔️ Almost There!', 'Only one floor left! Prepare for the final battle!');
        }
    }

    // The wing whose last floor the player has just cleared, or null. Floors are
    // conquered in order, so this is true exactly when the number of completed
    // floors equals the cumulative floor count through that wing.
    getJustClearedWing() {
        const completed = this.adventureProgress.floorsCompleted.length;
        let cumulative = 0;
        for (const part of curriculum.parts) {
            cumulative += part.floors.length;
            if (completed === cumulative) return part;
        }
        return null;
    }

    describeWingCleared(part) {
        const next = curriculum.parts[curriculum.parts.indexOf(part) + 1];
        return {
            title: `${part.name} conquered!`,
            message: next
                ? `The ${part.subtitle} wing is yours. Next up: ${next.name} (${next.subtitle})!`
                : `The ${part.subtitle} wing is yours. Only Lord Violation remains!`
        };
    }

    showFloorUnlockCelebration(floorId) {
        const floor = curriculum.floorById(floorId);
        if (!floor) return;

        const message = `Floor ${floorId}: ${floor.name} is now accessible! Face ${floor.enemy.name} when you're ready.`;
        this.showUnlockNotification(message, 'floor-unlocked');
    }

    showBossUnlockCelebration() {
        const message = '🏰 All floors conquered! Lord Violation\'s throne room is now accessible. Prepare for the ultimate challenge!';
        this.showUnlockNotification(message, 'boss-unlocked');
    }

    showMilestoneCelebration(type, title, message) {
        // Create milestone celebration notification
        const notification = document.createElement('div');
        notification.className = `milestone-notification ${type}`;
        notification.innerHTML = `
            <div class="milestone-content">
                <div class="milestone-header">
                    <span class="milestone-icon">${title.split(' ')[0]}</span>
                    <h3 class="milestone-title">${title}</h3>
                </div>
                <p class="milestone-message">${message}</p>
                <button class="milestone-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);

        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    showFloorIntro(floor) {
        const introContainer = document.getElementById('floor-intro-content');
        if (!introContainer) return;

        // Create enhanced narrative intro sequence
        introContainer.innerHTML = `
            <div class="floor-intro">
                <button class="btn-back" onclick="adventureGame.showTowerMap()">← Return to Tower</button>
                <div class="floor-header animated-entrance">
                    <h2>Floor ${floor.id}: ${floor.name}</h2>
                    <div class="floor-theme">${floor.theme}</div>
                </div>
                
                <div class="narrative-section">
                    <div class="story-scroll">
                        <div class="story-text-intro" id="intro-story-text">
                            <!-- Story will be animated in -->
                        </div>
                    </div>
                </div>
                
                <div class="enemy-reveal">
                    <div class="enemy-emergence" id="enemy-emergence" style="opacity: 0;">
                        <div class="enemy-portrait-dramatic">${floor.enemy.portrait}</div>
                        <div class="enemy-identity">
                            <div class="enemy-name-dramatic">${floor.enemy.name}</div>
                            <div class="enemy-title-dramatic">${floor.enemy.title}</div>
                        </div>
                        <div class="enemy-description-dramatic">${floor.enemy.description}</div>
                    </div>
                </div>
                
                <div class="challenge-section" id="challenge-section" style="opacity: 0;">
                    <div class="battle-challenge">
                        <div class="challenge-text">The enemy challenges you to battle!</div>
                        <button class="begin-battle-btn" onclick="adventureGame.startFloorBattle()">
                            ⚔️ Accept Challenge ⚔️
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Scroll to top immediately before transition
        window.scrollTo({ top: 0, behavior: 'instant' });

        this.showScreen('floor-intro-screen', 'epic-entrance');
        
        // Start narrative animation sequence
        this.animateEnemyIntroSequence(floor);
    }

    animateEnemyIntroSequence(floor) {
        const storyContainer = document.getElementById('intro-story-text');
        const enemyReveal = document.getElementById('enemy-emergence');
        const challengeSection = document.getElementById('challenge-section');
        
        if (!storyContainer) return;
        
        // Stage 1: Animate story text (typewriter for first sentence)
        setTimeout(() => {
            this.animateIntroStory(floor.story.intro, storyContainer);
        }, 500);
        
        // Stage 2: Dramatic enemy reveal
        setTimeout(() => {
            enemyReveal.style.opacity = '0';
            enemyReveal.style.transform = 'translateY(50px)';
            enemyReveal.style.transition = 'all 0.8s ease-out';
            
            setTimeout(() => {
                enemyReveal.style.opacity = '1';
                enemyReveal.style.transform = 'translateY(0)';
            }, 100);
        }, 4000);
        
        // Stage 3: Challenge appears
        setTimeout(() => {
            challengeSection.style.opacity = '0';
            challengeSection.style.transform = 'translateY(30px)';
            challengeSection.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                challengeSection.style.opacity = '1';
                challengeSection.style.transform = 'translateY(0)';
            }, 100);
        }, 5500);
    }

    animateIntroStory(storyText, container) {
        // Split story into sentences for better animation
        const sentences = storyText.split('. ').map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
        let currentSentence = 0;
        
        const addNextSentence = () => {
            if (currentSentence >= sentences.length) return;
            
            const paragraph = document.createElement('p');
            paragraph.className = 'story-sentence';
            paragraph.textContent = sentences[currentSentence];
            
            // All sentences use fade-in effect
            paragraph.classList.add('fade-in-sentence');
            paragraph.style.animationDelay = `${currentSentence * 0.3}s`;
            
            container.appendChild(paragraph);
            currentSentence++;
            
            // Schedule next sentence
            setTimeout(addNextSentence, 600);
        };
        
        addNextSentence();
    }

    startFloorBattle({ onlyMissed = false } = {}) {
        console.log('startFloorBattle called! Stack trace:');
        console.trace();
        
        if (!this.currentFloor) return;

        this.battleActive = true;
        clearTimeout(this.battleAdvanceTimer);
        this.currentBattleIsRetry = onlyMissed;

        // Record this as an attempt
        this.recordFloorAttempt(this.currentFloor.id);

        if (onlyMissed) {
            // Finish the fight: only the questions that got through the player's guard
            // last time, with answers reshuffled so position can't be memorized
            const missed = this.missedQuestions.map(q => this.shuffleAnswers(q));
            if (missed.length === 0) return;
            this.battleQuestions = this.shuffleArray(missed);
        } else {
            // Prepare battle questions from the floor's category using integrated method
            const category = this.currentFloor.category;
            const allQuestions = this.getQuestionsForCategory(category);
            
            if (allQuestions.length === 0) {
                console.error(`No questions available for floor ${this.currentFloor.id} (${category})`);
                return;
            }
            
            // Use all questions from the category (different from quiz mode's 20-question limit)
            this.battleQuestions = this.shuffleArray([...allQuestions]);
            // A fresh run is clean until the player misses something
            this.attemptWasClean = true;
        }

        this.missedQuestions = [];
        this.currentQuestionIndex = 0;
        this.enemyHealth = this.battleQuestions.length;
        this.maxEnemyHealth = this.enemyHealth;
        this.playerAnswers = [];
        this.battleStartTime = Date.now();
        this.hideAnswerFeedback();

        // Show screen first, then initialize battle UI
        this.showScreen('battle-screen');
        
        // Wait for screen transition to complete, then update UI and display question
        setTimeout(() => {
            if (!this.battleActive) return;
            console.log('Starting battle UI initialization after screen transition');
            
            // Ensure battle screen is properly visible
            const battleScreen = document.getElementById('battle-screen');
            if (battleScreen) {
                battleScreen.style.opacity = '';
                battleScreen.style.visibility = '';
                battleScreen.style.transform = '';
                battleScreen.style.filter = '';
            }
            
            this.updateBattleUI();
            this.displayBattleQuestion();
            // Scroll to top of the page
            window.scrollTo({ top: 0});
            
            // Verify battle screen is active
            setTimeout(() => {
                const battleScreen = document.getElementById('battle-screen');
                const isActive = battleScreen?.classList.contains('active');
                console.log('Battle screen active:', isActive);
                console.log('Battle screen computed opacity:', window.getComputedStyle(battleScreen).opacity);
                console.log('Battle screen computed visibility:', window.getComputedStyle(battleScreen).visibility);
            }, 100);
        }, 1200); // Increased timeout to ensure defeat transition completes
    }

    // ===== BATTLE MECHANICS =====
    updateBattleUI() {
        if (!this.currentEnemy) {
            console.error('updateBattleUI: No current enemy!');
            return;
        }

        console.log('updateBattleUI: Updating UI for', this.currentEnemy.name);

        // Update enemy info
        const enemyNameEl = document.getElementById('enemy-name');
        const enemyPortraitEl = document.getElementById('enemy-portrait');
        
        if (!enemyNameEl || !enemyPortraitEl) {
            console.error('updateBattleUI: Enemy UI elements not found!');
            return;
        }
        
        enemyNameEl.textContent = this.currentEnemy.name;
        enemyPortraitEl.textContent = this.currentEnemy.portrait;
        
        // Update health bar
        const healthPercent = (this.enemyHealth / this.maxEnemyHealth) * 100;
        document.getElementById('enemy-health-fill').style.width = healthPercent + '%';
        document.getElementById('enemy-health-text').textContent = `${this.enemyHealth}/${this.maxEnemyHealth}`;
        
        // Update question progress
        const progress = ((this.currentQuestionIndex + 1) / this.battleQuestions.length) * 100;
        document.getElementById('battle-progress-fill').style.width = progress + '%';
        document.getElementById('battle-progress-text').textContent = `Question ${this.currentQuestionIndex + 1} of ${this.battleQuestions.length}`;
    }

    displayBattleQuestion() {
        console.log('displayBattleQuestion called. Index:', this.currentQuestionIndex, 'Total questions:', this.battleQuestions.length);
        
        if (this.currentQuestionIndex >= this.battleQuestions.length) {
            console.log('All questions answered, completing battle');
            this.completeBattle();
            return;
        }

        const question = this.battleQuestions[this.currentQuestionIndex];
        console.log('Displaying question:', question.question.substring(0, 50) + '...');
        
        this.hideAnswerFeedback();
        
        // Update UI elements
        const questionEl = document.getElementById('battle-question');
        if (!questionEl) {
            console.error('displayBattleQuestion: battle-question element not found!');
            return;
        }
        questionEl.textContent = question.question;
        
        // Generate answer buttons
        const answersContainer = document.getElementById('battle-answers');
        if (!answersContainer) {
            console.error('displayBattleQuestion: battle-answers container not found!');
            return;
        }
        answersContainer.innerHTML = '';
        console.log('Creating', question.answers.length, 'answer buttons');
        
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'battle-answer-btn';
            button.textContent = answer;
            button.onclick = () => this.selectBattleAnswer(index);
            answersContainer.appendChild(button);
        });

        // Update battle UI
        this.updateBattleUI();
    }

    selectBattleAnswer(answerIndex) {
        const question = this.battleQuestions[this.currentQuestionIndex];
        const isCorrect = answerIndex === question.correct;
        const buttons = document.querySelectorAll('.battle-answer-btn');
        
        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);
        
        // Visual feedback
        if (isCorrect) {
            buttons[answerIndex].classList.add('correct');
            this.enemyHealth--;
            this.showEnemyDamage();
        } else {
            buttons[answerIndex].classList.add('incorrect');
            buttons[question.correct].classList.add('correct');
            this.showPlayerMiss();
        }

        // Record answer
        this.playerAnswers.push({
            question: question.question,
            userAnswer: question.answers[answerIndex],
            correctAnswer: question.answers[question.correct],
            isCorrect: isCorrect,
            explanation: question.explanation
        });

        if (!isCorrect) {
            // Remember the miss so the player can retry just these questions,
            // and mark the attempt so it can no longer count as a perfect run
            this.missedQuestions.push(question);
            this.attemptWasClean = false;
        }

        // Stats will be updated at battle completion level

        // Show enemy dialogue
        this.showEnemyDialogue(isCorrect);

        if (typeof soundEffects !== 'undefined') soundEffects.play(isCorrect ? 'hit' : 'miss');
        this.showAnswerFeedback(question, isCorrect);
        
        // A wrong answer waits for acknowledgement; a correct one keeps the pace up.
        // The timer is tracked so leaving the battle cancels it.
        if (isCorrect) {
            clearTimeout(this.battleAdvanceTimer);
            this.battleAdvanceTimer = setTimeout(() => {
                this.battleAdvanceTimer = null;
                if (this.battleActive) this.nextBattleQuestion();
            }, 2000);
        }
    }

    abandonBattle() {
        // Leave without a victory or a defeat. The attempt was already counted
        // when the battle started; nothing else about this run is recorded.
        this.battleActive = false;
        clearTimeout(this.battleAdvanceTimer);
        this.battleAdvanceTimer = null;
        this.hideAnswerFeedback();
        this.showTowerMap();
    }

    showAnswerFeedback(question, isCorrect) {
        const feedback = document.getElementById('battle-feedback');
        if (!feedback) return;

        feedback.className = `battle-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-icon">${isCorrect ? '⚔️' : '🛡️'}</span>
                <span class="feedback-verdict">${isCorrect ? 'Direct hit!' : 'The blow misses'}</span>
            </div>
            ${isCorrect ? '' : `<p class="feedback-answer"><strong>Correct answer:</strong> ${question.answers[question.correct]}</p>`}
            <p class="feedback-explanation">${question.explanation}</p>
            ${isCorrect ? '' : `
                <button class="feedback-continue-btn" onclick="adventureGame.acknowledgeFeedback()">
                    Got it &mdash; continue
                </button>
            `}
        `;
        feedback.style.display = 'block';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    acknowledgeFeedback() {
        if (!this.battleActive) return;
        this.hideAnswerFeedback();
        this.nextBattleQuestion();
    }

    hideAnswerFeedback() {
        const feedback = document.getElementById('battle-feedback');
        if (feedback) {
            feedback.style.display = 'none';
            feedback.innerHTML = '';
        }
    }

    showEnemyDamage() {
        // Add damage animation
        document.getElementById('enemy-portrait').classList.add('damage-animation');
        setTimeout(() => {
            document.getElementById('enemy-portrait').classList.remove('damage-animation');
        }, 500);
    }

    showPlayerMiss() {
        // Add miss effect
        document.getElementById('battle-screen').classList.add('miss-effect');
        setTimeout(() => {
            document.getElementById('battle-screen').classList.remove('miss-effect');
        }, 300);
    }

    showEnemyDialogue(playerWasCorrect) {
        const dialogueElement = document.getElementById('enemy-dialogue');
        if (!dialogueElement || !this.currentEnemy) return;

        const message = this.generatePersonalityDialogue(playerWasCorrect);
        
        // Enhanced dialogue display with character personality
        this.displayCharacterDialogue(dialogueElement, message, this.currentEnemy);
    }

    generatePersonalityDialogue(playerWasCorrect) {
        const enemy = this.currentEnemy;
        const healthPercentage = (this.enemyHealth / this.maxEnemyHealth) * 100;
        const questionProgress = this.currentQuestionIndex + 1;
        const totalQuestions = this.battleQuestions.length;
        
        // Base personality response
        let baseMessage;
        if (this.enemyHealth <= 0) {
            baseMessage = enemy.personality.defeated;
        } else if (playerWasCorrect) {
            baseMessage = enemy.personality.damaged;
        } else {
            baseMessage = enemy.personality.confident;
        }
        
        // Add dynamic personality modifiers based on battle context
        let contextualMessage = this.addPersonalityContext(baseMessage, {
            enemy,
            healthPercentage,
            questionProgress,
            totalQuestions,
            playerWasCorrect,
            consecutiveCorrect: this.getConsecutiveCorrect(),
            battleDuration: Date.now() - this.battleStartTime
        });
        
        return contextualMessage;
    }

    addPersonalityContext(baseMessage, context) {
        const { enemy, healthPercentage, questionProgress, totalQuestions, playerWasCorrect, consecutiveCorrect } = context;
        
        // Add personality-specific reactions based on battle state
        let enhancedMessage = baseMessage;
        
        // First question special reactions
        if (questionProgress === 1) {
            if (playerWasCorrect) {
                enhancedMessage = this.getEnemyReaction(enemy, 'firstHit') || baseMessage;
            }
        }
        
        // Low health dramatic reactions (below 30%)
        else if (healthPercentage <= 30 && healthPercentage > 0) {
            if (playerWasCorrect) {
                enhancedMessage = this.getEnemyReaction(enemy, 'desperation') || baseMessage;
            }
        }
        
        // Consecutive correct answers (player is doing very well)
        else if (consecutiveCorrect >= 3 && playerWasCorrect) {
            enhancedMessage = this.getEnemyReaction(enemy, 'streak') || baseMessage;
        }
        
        // Player struggling (multiple wrong answers)
        else if (!playerWasCorrect && this.playerAnswers.slice(-3).filter(a => !a.isCorrect).length >= 2) {
            enhancedMessage = this.getEnemyReaction(enemy, 'mocking') || baseMessage;
        }
        
        // Mid-battle encouragement/taunting
        else if (questionProgress === Math.floor(totalQuestions / 2)) {
            enhancedMessage = this.getEnemyReaction(enemy, playerWasCorrect ? 'midBattleCorrect' : 'midBattleWrong') || baseMessage;
        }
        
        return enhancedMessage;
    }

    // Enemy-specific line for a battle moment. Lines live on each enemy in
    // js/curriculum.js (enemy.reactions); kind is one of: firstHit, desperation,
    // streak, mocking, midBattleCorrect, midBattleWrong.
    getEnemyReaction(enemy, kind) {
        return enemy.reactions?.[kind];
    }

    displayCharacterDialogue(dialogueElement, message, enemy) {
        // Clear any existing content
        dialogueElement.innerHTML = '';
        
        // Create enhanced dialogue with character portrait and typing animation
        const dialogueContent = document.createElement('div');
        dialogueContent.className = 'dialogue-content';
        dialogueContent.innerHTML = `
            <div class="dialogue-portrait">${enemy.portrait}</div>
            <div class="dialogue-text">
                <div class="dialogue-name">${enemy.name}</div>
                <div class="dialogue-message" id="current-dialogue-message"></div>
            </div>
        `;
        
        dialogueElement.appendChild(dialogueContent);
        dialogueElement.style.display = 'block';
        
        // Display dialogue message
        this.displayDialogueText(message);
        
        // Auto-hide after delay
        setTimeout(() => {
            dialogueElement.style.display = 'none';
        }, 3500);
    }

    displayDialogueText(message) {
        const messageElement = document.getElementById('current-dialogue-message');
        if (!messageElement) return;
        
        // Simple immediate text display - no typewriter
        messageElement.textContent = message;
    }

    getConsecutiveCorrect() {
        // Count consecutive correct answers from the end of the array
        let count = 0;
        for (let i = this.playerAnswers.length - 1; i >= 0; i--) {
            if (this.playerAnswers[i] && this.playerAnswers[i].correct) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    nextBattleQuestion() {
        this.currentQuestionIndex++;
        
        if (this.enemyHealth <= 0 || this.currentQuestionIndex >= this.battleQuestions.length) {
            this.completeBattle();
        } else {
            this.displayBattleQuestion();
        }
    }

    completeBattle() {
        const victory = this.enemyHealth <= 0;
        const battleTime = Math.floor((Date.now() - this.battleStartTime) / 1000);
        const accuracy = Math.round((this.playerAnswers.filter(a => a.isCorrect).length / this.playerAnswers.length) * 100);

        if (victory) {
            this.handleBattleVictory(battleTime, accuracy);
        } else {
            this.handleBattleDefeat(battleTime, accuracy);
        }
    }

    handleBattleVictory(battleTime, accuracy) {
        // Update play time tracking
        this.updatePlayTime();
        
        // Update progress
        const floorId = this.currentFloor.id;
        if (!this.adventureProgress.floorsCompleted.includes(floorId)) {
            this.adventureProgress.floorsCompleted.push(floorId);
            this.adventureProgress.stats.enemiesDefeated++;
            
            // Only a run with no misses at all counts as perfect, so finishing the
            // fight after a defeat still conquers the floor without inflating the stat
            if (this.attemptWasClean) {
                this.adventureProgress.stats.perfectFloors++;
            }
            
            // Unlock next floor with enhanced logic
            this.unlockNextFloor(floorId);
            
            // Collect artifact
            const artifactKey = curriculum.floorById(floorId).artifact.key;
            if (!this.adventureProgress.artifactsCollected.includes(artifactKey)) {
                this.adventureProgress.artifactsCollected.push(artifactKey);
            }
        }

        // Update enhanced floor statistics for Phase 3
        const floorStats = this.getFloorStats(floorId);
        floorStats.victories++;
        floorStats.totalTime += battleTime;
        this.recordBestScore(floorStats, accuracy);
        if (this.attemptWasClean) {
            floorStats.perfectRuns++;
        }
        
        // Update global stats
        this.adventureProgress.stats.questionsAnswered += this.playerAnswers.length;
        this.adventureProgress.stats.correctAnswers += this.playerAnswers.filter(a => a.isCorrect).length;
        this.adventureProgress.stats.totalQuestions += this.playerAnswers.length;

        this.awardAchievements(true);
        this.saveAdventureProgress();
        this.updateUI(); // Update welcome screen button states after progress change
        
        // Show dramatic enemy defeat sequence
        setTimeout(() => {
            this.showEnemyDefeatSequence(this.currentFloor, true, battleTime, accuracy);
        }, 1500);
    }

    handleBattleDefeat(battleTime, accuracy) {
        const floorId = this.currentFloor.id;
        
        // Update enhanced floor statistics for Phase 3
        // (the attempt itself was counted by recordFloorAttempt when the battle began)
        const floorStats = this.getFloorStats(floorId);
        floorStats.totalTime += battleTime;
        this.recordBestScore(floorStats, accuracy);
        
        // Update global stats
        this.adventureProgress.stats.questionsAnswered += this.playerAnswers.length;
        this.adventureProgress.stats.correctAnswers += this.playerAnswers.filter(a => a.isCorrect).length;
        this.adventureProgress.stats.totalQuestions += this.playerAnswers.length;

        this.awardAchievements(true);
        this.saveAdventureProgress();
        
        // Show defeat sequence (less dramatic for player loss)
        setTimeout(() => {
            this.showEnemyDefeatSequence(this.currentFloor, false, battleTime, accuracy);
        }, 1500);
    }

    showEnemyDefeatSequence(floor, victory, battleTime, accuracy) {
        const resultsContainer = document.getElementById('battle-results-content');
        if (!resultsContainer) {
            console.error('Results container not found!');
            return;
        }

        console.log('Showing defeat/victory sequence. Victory:', victory);
        
        // Create dramatic defeat/victory sequence
        const sequenceHTML = victory ? this.createVictorySequence(floor, battleTime, accuracy) : this.createDefeatSequence(floor, battleTime, accuracy);
        console.log('Sequence HTML:', sequenceHTML.substring(0, 200));
        
        resultsContainer.innerHTML = `
            <div class="defeat-sequence">
                <div class="battle-outcome-stage" id="outcome-stage">
                    ${sequenceHTML}
                </div>
            </div>
        `;

        console.log('Results container innerHTML set, length:', resultsContainer.innerHTML.length);
        this.showScreen('battle-results-screen', victory ? 'victory' : 'defeat');
        
        if (victory) {
            this.animateVictorySequence(floor);
        } else {
            this.animateDefeatSequence(floor);
        }
    }

    createVictorySequence(floor, battleTime, accuracy) {
        return `
            <div class="victory-narrative">
                <div class="enemy-defeat-moment" id="enemy-defeat">
                    <div class="defeated-enemy-portrait">${floor.enemy.portrait}</div>
                    <div class="defeat-text">
                        <h3 class="enemy-defeated-name">${floor.enemy.name}</h3>
                        <p class="final-words" id="final-words"></p>
                    </div>
                </div>
                
                <div class="victory-story" id="victory-story" style="opacity: 0;">
                    <div class="story-scroll-victory">
                        <div class="victory-narrative-text" id="victory-narrative-text">
                            <!-- Victory story will animate in -->
                        </div>
                    </div>
                </div>
                
                <div class="artifact-revelation" id="artifact-revelation" style="opacity: 0;">
                    <div class="artifact-container">
                        <div class="artifact-glow">
                            <div class="artifact-icon">💎</div>
                            <h3>Artifact Obtained!</h3>
                            <div class="artifact-name">${floor.artifact.name}</div>
                            <div class="artifact-description">${floor.artifact.description}</div>
                        </div>
                    </div>
                </div>
                
                <div class="princess-encouragement" id="princess-encouragement" style="opacity: 0;">
                    ${this.getPrincessMessage(floor.id, { accuracy: accuracy, time: battleTime })}
                </div>
                
                <div class="battle-stats" id="battle-stats" style="opacity: 0;">
                    <div class="stats-container">
                        <div class="stat-item">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value">${this.formatTime(battleTime)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Accuracy:</span>
                            <span class="stat-value">${accuracy}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Correct:</span>
                            <span class="stat-value">${this.playerAnswers.filter(a => a.isCorrect).length}/${this.playerAnswers.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="victory-actions" id="victory-actions" style="opacity: 0; pointer-events: none;">
                    <button class="continue-adventure-btn" onclick="adventureGame.showTowerMapVictorious()">
                        🏰 Continue Your Quest
                    </button>
                </div>
            </div>
        `;
    }

    createDefeatSequence(floor, battleTime, accuracy) {
        console.log('Creating defeat sequence for floor:', floor);
        const html = `
            <div class="defeat-narrative">
                <div class="player-defeat-moment" id="player-defeat">
                    <div class="victorious-enemy-portrait">${floor.enemy.portrait}</div>
                    <div class="defeat-message">
                        <h3 class="enemy-victory-name">${floor.enemy.name} Stands Victorious</h3>
                        <p class="enemy-taunt" id="enemy-taunt"></p>
                    </div>
                </div>
                
                <div class="defeat-reflection" id="defeat-reflection" style="opacity: 0;">
                    <div class="reflection-text">
                        <p>The battle is lost, but knowledge has been gained. Even defeat teaches us valuable lessons on the road to mastery.</p>
                        <p>Study your mistakes, brave knight, and return with greater wisdom!</p>
                    </div>
                    ${this.renderMissedReview()}
                </div>
                
                <div class="battle-stats defeat-stats" id="defeat-battle-stats" style="opacity: 0;">
                    <div class="stats-container">
                        <div class="stat-item">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value">${this.formatTime(battleTime)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Accuracy:</span>
                            <span class="stat-value">${accuracy}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Correct:</span>
                            <span class="stat-value">${this.playerAnswers.filter(a => a.isCorrect).length}/${this.playerAnswers.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="defeat-actions" id="defeat-actions" style="opacity: 0; pointer-events: none;">
                    <button class="finish-fight-btn" onclick="adventureGame.startFloorBattle({ onlyMissed: true })">
                        🗡️ Finish the Fight (${this.missedQuestions.length})
                    </button>
                    <button class="retry-battle-btn" onclick="adventureGame.startFloorBattle()">
                        ⚔️ Challenge Again
                    </button>
                    <button class="retreat-btn" onclick="adventureGame.showTowerMapDefeated()">
                        🏰 Retreat to Tower
                    </button>
                </div>
            </div>
        `;
        console.log('Defeat sequence HTML length:', html.length);
        return html;
    }

    renderMissedReview() {
        const missed = this.playerAnswers.filter(a => !a.isCorrect);
        if (missed.length === 0) return '';

        return `
            <div class="missed-review">
                <h4>📖 What got past your guard</h4>
                ${missed.map(a => `
                    <div class="missed-item">
                        <p class="missed-question">${a.question}</p>
                        <p class="missed-yours"><strong>You answered:</strong> ${a.userAnswer}</p>
                        <p class="missed-correct"><strong>Correct answer:</strong> ${a.correctAnswer}</p>
                        <p class="missed-explanation">${a.explanation}</p>
                    </div>
                `).join('')}
            </div>`;
    }

    animateVictorySequence(floor) {
        if (typeof soundEffects !== 'undefined') soundEffects.play('defeat');

        // Stage 1: Enemy defeat with final words
        setTimeout(() => {
            document.getElementById('final-words').textContent = floor.enemy.personality.defeated;
        }, 500);
        
        // Stage 2: Victory story narrative
        setTimeout(() => {
            const victoryStory = document.getElementById('victory-story');
            victoryStory.style.transition = 'all 0.8s ease-out';
            victoryStory.style.opacity = '1';
            
            setTimeout(() => {
                this.animateVictoryNarrative(floor.story.victory);
            }, 400);
        }, 3000);
        
        // Stage 3: Artifact revelation
        setTimeout(() => {
            if (typeof soundEffects !== 'undefined') soundEffects.play('artifact');
            const artifactRevelation = document.getElementById('artifact-revelation');
            if (!artifactRevelation) return;
            artifactRevelation.style.transition = 'all 0.6s ease-out';
            artifactRevelation.style.opacity = '1';
        }, 5500);
        
        // Stage 4: Princess encouragement
        setTimeout(() => {
            const princessMessage = document.getElementById('princess-encouragement');
            if (princessMessage && princessMessage.textContent.trim()) {
                princessMessage.style.transition = 'all 0.6s ease-out';
                princessMessage.style.opacity = '1';
            }
        }, 7000);
        
        // Stage 5: Battle stats
        setTimeout(() => {
            const battleStats = document.getElementById('battle-stats');
            battleStats.style.transition = 'all 0.5s ease-out';
            battleStats.style.opacity = '1';
        }, 8000);
        
        // Stage 6: Continue actions
        setTimeout(() => {
            const victoryActions = document.getElementById('victory-actions');
            if (victoryActions) {
                victoryActions.style.transition = 'all 0.5s ease-out';
                victoryActions.style.opacity = '1';
                victoryActions.style.pointerEvents = 'auto';
            }
        }, 8500);
    }

    animateDefeatSequence(floor) {
        console.log('Animating defeat sequence for floor:', floor.name);
        
        // Stage 1: Enemy taunt
        setTimeout(() => {
            const taunts = [
                `"${floor.enemy.personality.confident}"`,
                "Your journey ends here, would-be hero!",
                "Return when you have truly mastered the knowledge!"
            ];
            const taunt = taunts[Math.floor(Math.random() * taunts.length)];
            const tauntElement = document.getElementById('enemy-taunt');
            if (tauntElement) {
                tauntElement.textContent = taunt;
                console.log('Set enemy taunt:', taunt);
            } else {
                console.error('enemy-taunt element not found!');
            }
        }, 500);
        
        // Stage 2: Reflection on defeat
        setTimeout(() => {
            const defeatReflection = document.getElementById('defeat-reflection');
            defeatReflection.style.transition = 'all 0.6s ease-out';
            defeatReflection.style.opacity = '1';
        }, 3500);
        
        // Stage 3: Battle stats
        setTimeout(() => {
            const battleStats = document.getElementById('defeat-battle-stats');
            battleStats.style.transition = 'all 0.5s ease-out';
            battleStats.style.opacity = '1';
        }, 5000);
        
        // Stage 4: Action options
        setTimeout(() => {
            const defeatActions = document.getElementById('defeat-actions');
            if (defeatActions) {
                defeatActions.style.transition = 'all 0.5s ease-out';
                defeatActions.style.opacity = '1';
                defeatActions.style.pointerEvents = 'auto';
                console.log('Defeat actions now visible and clickable');
            }
        }, 6000);
    }

    animateVictoryNarrative(storyText) {
        const container = document.getElementById('victory-narrative-text');
        if (!container) return;
        
        // Use similar animation as intro but faster for victory
        const sentences = storyText.split('. ').map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
        let currentSentence = 0;
        
        const addNextSentence = () => {
            if (currentSentence >= sentences.length) return;
            
            const paragraph = document.createElement('p');
            paragraph.className = 'victory-sentence';
            paragraph.textContent = sentences[currentSentence];
            paragraph.style.animationDelay = `${currentSentence * 0.2}s`;
            
            container.appendChild(paragraph);
            currentSentence++;
            
            setTimeout(addNextSentence, 400);
        };
        
        addNextSentence();
    }

    // Keep the old method as backup for any direct calls
    showBattleResults(victory, battleTime, accuracy) {
        // Redirect to new dramatic sequence
        this.showEnemyDefeatSequence(this.currentFloor, victory, battleTime, accuracy);
    }

    getPrincessMessage(floorId, battleStats = null) {
        const message = curriculum.floorById(floorId)?.princessMessage;
        
        // If no base message exists, skip
        if (!message) return '';
        
        // Add dynamic performance-based message if battle stats provided
        let performanceMessage = '';
        if (battleStats) {
            const accuracy = battleStats.accuracy;
            const performance = this.categorizePerformance(accuracy);
            performanceMessage = this.getPerformanceEncouragement(performance);
        }
        
        // Check for streak bonuses
        const streak = this.adventureProgress.floorsCompleted.length;
        const streakMessage = adventureData.princessStreakMessages[streak];
        
        // Special contextual messages
        const contextMessage = this.getContextualPrincessMessage(floorId, streak);
        
        return `
            <div class="princess-message-container">
                <div class="princess-portrait">👸</div>
                <div class="princess-speech">
                    <div class="princess-name">Princess Permit</div>
                    <div class="princess-main-message">"${message}"</div>
                    ${performanceMessage ? `<div class="princess-performance-note">"${performanceMessage}"</div>` : ''}
                    ${streakMessage ? `<div class="princess-streak-bonus">"${streakMessage}"</div>` : ''}
                    ${contextMessage ? `<div class="princess-context-note">"${contextMessage}"</div>` : ''}
                </div>
            </div>
        `;
    }

    categorizePerformance(accuracy) {
        if (accuracy >= 100) return 'perfect';
        if (accuracy >= 90) return 'excellent'; 
        if (accuracy >= 70) return 'good';
        return 'struggle';
    }

    getPerformanceEncouragement(performance) {
        const messages = adventureData.princessPerformanceMessages[performance];
        return messages ? messages[Math.floor(Math.random() * messages.length)] : '';
    }

    getContextualPrincessMessage(floorId, floorsCompleted) {
        // First victory special message
        if (floorId === 1 && floorsCompleted === 1) {
            return adventureData.princessMessages.firstVictory;
        }
        
        // Halfway point
        if (floorId === Math.ceil(curriculum.totalFloors / 2)) {
            return adventureData.princessMessages.halfway;
        }
        
        // Near the end
        if (floorId >= curriculum.totalFloors - 2) {
            return adventureData.princessMessages.nearEnd;
        }
        
        return null;
    }

    // Enhanced method to show Princess message with animations
    displayPrincessMessage(floorId, battleStats = null) {
        const messageElement = document.getElementById('princess-encouragement');
        if (!messageElement) return;
        
        const messageHTML = this.getPrincessMessage(floorId, battleStats);
        if (!messageHTML) return;
        
        messageElement.innerHTML = messageHTML;
        
        // Add special animation for Princess messages
        setTimeout(() => {
            this.animatePrincessMessage();
        }, 200);
    }

    animatePrincessMessage() {
        const container = document.querySelector('.princess-message-container');
        const portrait = document.querySelector('.princess-portrait');
        const speech = document.querySelector('.princess-speech');
        
        if (!container || !portrait || !speech) return;
        
        // Stage 1: Princess portrait appears with glow
        portrait.style.opacity = '0';
        portrait.style.transform = 'scale(0.5)';
        portrait.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            portrait.style.opacity = '1';
            portrait.style.transform = 'scale(1)';
        }, 100);
        
        // Stage 2: Speech bubble types in after portrait
        setTimeout(() => {
            speech.style.opacity = '0';
            speech.style.transform = 'translateY(20px)';
            speech.style.transition = 'all 0.5s ease-out';
            
            setTimeout(() => {
                speech.style.opacity = '1';
                speech.style.transform = 'translateY(0)';
            }, 100);
        }, 600);
        
        // Stage 3: Show main message
        setTimeout(() => {
            const mainMessage = document.querySelector('.princess-main-message');
            if (mainMessage) {
                // Just show the text immediately - no typewriter
                mainMessage.style.opacity = '1';
            }
        }, 1200);
    }

    // Typewriter effect removed - using simple fade-in animations instead

    // ===== BOSS BATTLE =====
    enterBoss() {
        if (this.adventureProgress.floorsCompleted.length < curriculum.totalFloors) {
            alert(`You must defeat all ${curriculum.totalFloors} enemies before facing Lord Violation!`);
            return;
        }

        this.bossPhase = 0;
        this.bossTrialResults = [];
        this.showBossIntro();
    }

    showBossIntro() {
        const boss = adventureData.boss;
        const bossContainer = document.getElementById('boss-intro-content');
        
        bossContainer.innerHTML = `
            <div class="boss-intro">
                <button class="btn-back" onclick="adventureGame.showTowerMap()">← Return to Tower</button>
                <h2>${boss.name}</h2>
                <div class="boss-portrait">${boss.enemy.portrait}</div>
                <h3>${boss.enemy.name}</h3>
                <p class="boss-title">${boss.enemy.title}</p>
                <p class="boss-description">${boss.enemy.description}</p>
                <div class="boss-story">
                    <p>${boss.story.intro}</p>
                </div>
                <div class="trials-info">
                    <h4>The Three Trials</h4>
                    <p>You must complete 3 permit tests with perfect scores (100%) to shatter Princess Permit's prison.</p>
                    <p><strong>Warning:</strong> Any test with less than 100% must be retaken from the beginning!</p>
                </div>
                <button class="begin-boss-battle-btn" onclick="adventureGame.startBossTrial(1)">
                    Begin First Trial
                </button>
            </div>
        `;

        this.showScreen('boss-intro-screen');
    }

    startBossTrial(trialNumber) {
        this.bossPhase = trialNumber - 1;
        const trial = adventureData.boss.enemy.phases[this.bossPhase];
        
        // Record boss attempt (only for first trial)
        if (trialNumber === 1) {
            this.recordBossAttempt();
        }
        
        // Generate the trial's questions from all categories
        this.generateBossTrialQuestions();
        
        this.currentQuestionIndex = 0;
        this.playerAnswers = [];
        this.battleStartTime = Date.now();
        
        this.showTrialIntro(trial, trialNumber);
    }

    generateBossTrialQuestions() {
        // Use integrated method to get random boss questions
        const perTrial = adventureData.config.questionsPerBossTrial;
        this.battleQuestions = this.getRandomBossQuestions(perTrial);
        
        if (this.battleQuestions.length < perTrial) {
            console.warn(`Boss trial only has ${this.battleQuestions.length} questions (expected ${perTrial})`);
        }
    }

    showTrialIntro(trial, trialNumber) {
        const trialContainer = document.getElementById('trial-intro-content');
        const perTrial = this.battleQuestions.length;
        
        trialContainer.innerHTML = `
            <div class="trial-intro">
                <button class="btn-back" onclick="adventureGame.showTowerMap()">← Return to Tower</button>
                <h2>Trial ${trialNumber}: ${trial.name}</h2>
                <p class="trial-description">${trial.description}</p>
                <div class="lord-violation-dialogue">
                    <div class="boss-portrait">${adventureData.boss.enemy.portrait}</div>
                    <p><em>"${trial.dialogue.intro}"</em></p>
                </div>
                <div class="trial-rules">
                    <h4>Trial Rules:</h4>
                    <ul>
                        <li>${perTrial} questions from all traffic knowledge areas</li>
                        <li>No feedback during the test</li>
                        <li>100% score required to proceed</li>
                        <li>Failure means retaking from the beginning</li>
                    </ul>
                </div>
                <button class="start-trial-btn" onclick="adventureGame.beginTrial()">
                    Start Trial ${trialNumber}
                </button>
            </div>
        `;

        this.showScreen('trial-intro-screen');
    }

    beginTrial() {
        this.updateTrialUI();
        this.displayTrialQuestion();
        this.showScreen('trial-screen');
    }

    updateTrialUI() {
        // Update trial progress
        const progress = ((this.currentQuestionIndex + 1) / this.battleQuestions.length) * 100;
        document.getElementById('trial-progress-fill').style.width = progress + '%';
        document.getElementById('trial-progress-text').textContent = `Question ${this.currentQuestionIndex + 1} of ${this.battleQuestions.length}`;
        
        // Update trial info
        document.getElementById('current-trial').textContent = `Trial ${this.bossPhase + 1}`;
    }

    displayTrialQuestion() {
        if (this.currentQuestionIndex >= this.battleQuestions.length) {
            this.completeTrialTest();
            return;
        }

        const question = this.battleQuestions[this.currentQuestionIndex];
        
        // Update question display
        document.getElementById('trial-question').textContent = question.question;
        
        // Generate answer buttons
        const answersContainer = document.getElementById('trial-answers');
        answersContainer.innerHTML = '';
        
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'trial-answer-btn';
            button.textContent = answer;
            button.onclick = () => this.selectTrialAnswer(index);
            answersContainer.appendChild(button);
        });

        this.updateTrialUI();
    }

    selectTrialAnswer(answerIndex) {
        const question = this.battleQuestions[this.currentQuestionIndex];
        const isCorrect = answerIndex === question.correct;
        
        // Record answer (no visual feedback during boss trials)
        this.playerAnswers.push({
            question: question.question,
            userAnswer: question.answers[answerIndex],
            correctAnswer: question.answers[question.correct],
            isCorrect: isCorrect,
            explanation: question.explanation
        });

        // Stats will be updated at battle completion level

        // Continue to next question immediately
        this.nextTrialQuestion();
    }

    nextTrialQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.battleQuestions.length) {
            this.completeTrialTest();
        } else {
            this.displayTrialQuestion();
        }
    }

    completeTrialTest() {
        // Update play time tracking
        this.updatePlayTime();
        
        const correctAnswers = this.playerAnswers.filter(a => a.isCorrect).length;
        const percentage = Math.round((correctAnswers / this.battleQuestions.length) * 100);
        const trialTime = Math.floor((Date.now() - this.battleStartTime) / 1000);
        
        // Record trial result
        this.bossTrialResults[this.bossPhase] = {
            score: percentage,
            time: trialTime,
            passed: percentage === 100
        };

        this.showTrialResults(percentage, trialTime);
    }

    showTrialResults(percentage, trialTime) {
        const trial = adventureData.boss.enemy.phases[this.bossPhase];
        const passed = percentage === 100;
        const resultsContainer = document.getElementById('trial-results-content');
        
        resultsContainer.innerHTML = `
            <div class="trial-results ${passed ? 'passed' : 'failed'}">
                <h2>${passed ? 'Trial Completed!' : 'Trial Failed'}</h2>
                <div class="trial-score">
                    <h3>Final Score: ${percentage}%</h3>
                    <p>Time: ${this.formatTime(trialTime)}</p>
                    <p>Correct: ${this.playerAnswers.filter(a => a.isCorrect).length}/${this.battleQuestions.length}</p>
                </div>
                <div class="boss-reaction">
                    <div class="boss-portrait">${adventureData.boss.enemy.portrait}</div>
                    <p><em>"${passed ? trial.dialogue.success : trial.dialogue.failure}"</em></p>
                </div>
                ${passed ? '' : this.renderMissedReview()}
                <div class="trial-actions">
                    ${passed ? (this.bossPhase < adventureData.boss.enemy.phases.length - 1 ? 
                        `<button onclick="adventureGame.startBossTrial(${this.bossPhase + 2})">Continue to Trial ${this.bossPhase + 2}</button>` :
                        `<button onclick="adventureGame.completeBossBattle()">Witness the Final Victory!</button>`
                    ) : `
                        <button onclick="adventureGame.startBossTrial(${this.bossPhase + 1})">Retry Trial ${this.bossPhase + 1}</button>
                        <button onclick="adventureGame.showTowerMap()">Return to Tower</button>
                    `}
                </div>
            </div>
        `;

        this.showScreen('trial-results-screen');
    }

    completeBossBattle() {
        // Mark game as completed
        this.adventureProgress.gameCompleted = true;
        this.adventureProgress.bossUnlocked = true;
        this.saveAdventureProgress();
        
        // Show victory sequence
        this.showVictorySequence();
    }

    showVictorySequence() {
        this.gamePhase = 'victory';
        this.displayStorySequence(adventureData.story.victory);
        this.showScreen('story-screen');
    }

    returnToTowerMap() {
        this.showTowerMap();
    }

    // ===== UTILITY METHODS =====
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    shuffleAnswers(question) {
        // Copy of the question with its options reordered and `correct` remapped
        const order = this.shuffleArray(question.answers.map((_, i) => i));
        return {
            ...question,
            answers: order.map(i => question.answers[i]),
            correct: order.indexOf(question.correct)
        };
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateUI() {
        // Update any persistent UI elements
        this.updateWelcomeStats();
        this.updateProgressDisplay();
        this.checkContinueButton();
    }

    updateWelcomeStats() {
        // Update welcome screen status displays
        const statusElements = {
            'princess-status': document.getElementById('princess-status'),
            'floors-conquered': document.getElementById('floors-conquered'),
            'enemies-defeated': document.getElementById('enemies-defeated')
        };

        if (statusElements['princess-status']) {
            statusElements['princess-status'].textContent = 
                this.adventureProgress.gameCompleted ? 'Rescued! 👸' : 'Imprisoned 🔒';
        }

        if (statusElements['floors-conquered']) {
            statusElements['floors-conquered'].textContent = 
                `${this.adventureProgress.floorsCompleted.length}/${curriculum.totalFloors}`;
        }

        if (statusElements['enemies-defeated']) {
            statusElements['enemies-defeated'].textContent = 
                this.adventureProgress.stats.enemiesDefeated.toString();
        }
    }

    checkContinueButton() {
        // Show/hide continue button and update button highlighting based on progress
        const continueBtn = document.getElementById('continue-btn');
        const beginBtn = document.querySelector('button[onclick="startAdventure()"]');
        
        const hasProgress = this.adventureProgress.floorsCompleted.length > 0 || 
                          this.adventureProgress.currentFloor > 1;
        
        if (continueBtn && beginBtn) {
            if (hasProgress) {
                // Show continue button and make it primary
                continueBtn.style.display = 'inline-block';
                continueBtn.className = 'adventure-btn btn-primary';
                beginBtn.className = 'adventure-btn btn-secondary';
            } else {
                // Hide continue button and keep begin as primary
                continueBtn.style.display = 'none';
                beginBtn.className = 'adventure-btn btn-primary';
            }
        }
    }

    updateProgressDisplay() {
        // Update progress screen displays
        const progressElements = {
            'progress-floors': document.getElementById('progress-floors'),
            'progress-artifacts': document.getElementById('progress-artifacts'), 
            'progress-accuracy': document.getElementById('progress-accuracy'),
            'progress-time': document.getElementById('progress-time')
        };

        if (progressElements['progress-floors']) {
            progressElements['progress-floors'].textContent = 
                `${this.adventureProgress.floorsCompleted.length}/${curriculum.totalFloors}`;
        }

        if (progressElements['progress-artifacts']) {
            progressElements['progress-artifacts'].textContent = 
                `${this.adventureProgress.artifactsCollected.length}/${curriculum.totalFloors}`;
        }

        if (progressElements['progress-accuracy']) {
            const accuracy = this.getOverallAccuracy();
            progressElements['progress-accuracy'].textContent = accuracy + '%';
        }

        if (progressElements['progress-time']) {
            progressElements['progress-time'].textContent = 
                this.formatTime(this.adventureProgress.totalPlayTime);
        }

        // Update artifacts grid
        this.updateAchievementsDisplay();
        this.updateArtifactsDisplay();
        // Update knowledge areas
        this.updateKnowledgeDisplay();
    }

    awardAchievements(announce) {
        const progress = this.adventureProgress;
        progress.achievements = progress.achievements || {};

        curriculum.achievements.forEach(achievement => {
            if (progress.achievements[achievement.id]) return;
            if (!achievement.earned(progress)) return;

            progress.achievements[achievement.id] = true;
            if (!announce) return;

            // A cleared wing keeps the message it already had; the other badges
            // speak for themselves.
            const wing = curriculum.parts.find(part => achievement.id === `wing-${part.id}`);
            const celebration = wing ? this.describeWingCleared(wing) : null;
            this.showMilestoneCelebration(
                `achievement-${achievement.id}`,
                `${achievement.icon} ${celebration ? celebration.title : achievement.name}`,
                celebration ? celebration.message : achievement.description
            );
        });
    }

    updateAchievementsDisplay() {
        const grid = document.getElementById('achievement-grid');
        if (!grid) return;

        const earned = this.adventureProgress.achievements || {};
        grid.innerHTML = '';

        curriculum.achievements.forEach(achievement => {
            const unlocked = !!earned[achievement.id];
            const card = document.createElement('div');
            card.className = `achievement-card ${unlocked ? 'earned' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${unlocked ? achievement.icon : '🔒'}</div>
                <h4 class="achievement-name">${achievement.name}</h4>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-status">${unlocked ? '✓ Earned' : 'Not yet'}</div>
            `;
            grid.appendChild(card);
        });
    }

    updateArtifactsDisplay() {
        const treasureGrid = document.getElementById('treasure-grid');
        if (!treasureGrid) return;

        treasureGrid.innerHTML = '';
        
        curriculum.floors.forEach(floor => {
            const artifact = floor.artifact;
            const isCollected = this.adventureProgress.artifactsCollected.includes(artifact.key);
            const treasureElement = document.createElement('div');
            treasureElement.className = `treasure-item ${isCollected ? 'collected' : ''}`;
            
            treasureElement.innerHTML = `
                <div class="treasure-icon">${isCollected ? '💎' : '🔒'}</div>
                <h4 class="treasure-name">${artifact.name}</h4>
                <p class="treasure-description">${artifact.description}</p>
                <div class="treasure-source">Obtained from Floor ${floor.id}</div>
                <div class="treasure-status ${isCollected ? 'collected' : 'locked'}">
                    ${isCollected ? '✓ Collected' : '🔒 Locked'}
                </div>
            `;
            
            treasureGrid.appendChild(treasureElement);
        });
    }

    updateKnowledgeDisplay() {
        const masteryGrid = document.getElementById('mastery-grid');
        if (!masteryGrid) return;

        masteryGrid.innerHTML = '';

        // Map categories to floors for knowledge display
        const categoryFloorMap = {};
        curriculum.floors.forEach(floor => {
            categoryFloorMap[floor.category] = floor;
        });

        Object.entries(categoryFloorMap).forEach(([category, floor]) => {
            const isCompleted = this.adventureProgress.floorsCompleted.includes(floor.id);
            const masteryElement = document.createElement('div');
            masteryElement.className = `mastery-item ${isCompleted ? 'mastered' : ''}`;
            
            // Calculate mastery status
            const attempts = this.adventureProgress.attempts.floors[floor.id] || 0;
            let progressClass, progressText;
            
            if (isCompleted) {
                progressClass = 'complete';
                progressText = '100% Mastery';
            } else if (attempts > 0) {
                progressClass = 'in-progress';
                progressText = 'In Progress';
            } else {
                progressClass = 'not-attempted';
                progressText = 'Not Attempted';
            }
            
            masteryElement.innerHTML = `
                <div class="mastery-icon">${floor.enemy.portrait}</div>
                <div class="mastery-content">
                    <h4 class="mastery-title">${floor.name}</h4>
                    <p class="mastery-category">${this.formatCategoryName(category)}</p>
                    <div class="mastery-progress ${progressClass}">${progressText}</div>
                </div>
            `;
            
            masteryGrid.appendChild(masteryElement);
        });
    }

    formatCategoryName(category) {
        // Convert category slug to readable name
        return category
            .split('-')
            .map(word => word === 'and' ? word : word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Enhanced progress tracking methods
    updatePlayTime() {
        // Update total play time (call this periodically during gameplay)
        if (this.battleStartTime) {
            const currentTime = Date.now();
            const sessionTime = Math.floor((currentTime - this.battleStartTime) / 1000);
            this.adventureProgress.totalPlayTime += sessionTime;
            this.battleStartTime = currentTime; // Reset for next calculation
        }
    }

    // Per-floor statistics, created on first use. Every caller goes through here so
    // the shape stays consistent no matter which path touches a floor first.
    getFloorStats(floorId) {
        const allStats = this.adventureProgress.floorStats;
        if (!allStats[floorId]) {
            allStats[floorId] = {
                attempts: 0,
                victories: 0,
                bestScore: 0,
                totalTime: 0,
                perfectRuns: 0,
                entries: 0,
                lastEntry: null,
                replays: { normal: 0, practice: 0, speedrun: 0 }
            };
        }
        if (!allStats[floorId].replays) {
            allStats[floorId].replays = { normal: 0, practice: 0, speedrun: 0 };
        }
        return allStats[floorId];
    }

    // A retry round is scored over only the questions that were missed, so its
    // accuracy says nothing about mastery of the whole floor and is not a best score.
    recordBestScore(floorStats, accuracy) {
        if (this.currentBattleIsRetry) return;
        floorStats.bestScore = Math.max(floorStats.bestScore, accuracy);
    }

    recordFloorAttempt(floorId) {
        // Record an attempt at a floor (for statistics). Counted when the battle
        // starts, so it covers wins, losses, and retries alike.
        this.adventureProgress.attempts.floors[floorId] = 
            (this.adventureProgress.attempts.floors[floorId] || 0) + 1;
        this.getFloorStats(floorId).attempts++;
        this.saveAdventureProgress();
    }

    recordBossAttempt() {
        // Record an attempt at the boss battle
        this.adventureProgress.attempts.boss++;
        this.adventureProgress.stats.bossAttempts++;
        this.saveAdventureProgress();
    }

    getProgressSummary() {
        // Return a comprehensive summary of progress for external use
        const progress = this.adventureProgress;
        const overallAccuracy = this.getOverallAccuracy();
        
        return {
            floorsCompleted: progress.floorsCompleted.length,
            totalFloors: curriculum.totalFloors,
            artifactsCollected: progress.artifactsCollected.length,
            totalArtifacts: curriculum.totalFloors,
            overallAccuracy: overallAccuracy,
            totalPlayTime: progress.totalPlayTime,
            gameCompleted: progress.gameCompleted,
            bossUnlocked: progress.floorsCompleted.length >= curriculum.totalFloors,
            perfectFloors: progress.stats.perfectFloors || 0,
            totalQuestions: progress.stats.totalQuestions || 0,
            correctAnswers: progress.stats.correctAnswers || 0,
            enemiesDefeated: progress.stats.enemiesDefeated || 0,
            bossAttempts: progress.stats.bossAttempts || 0,
            currentFloor: progress.currentFloor,
            milestoneUnlocks: progress.milestoneUnlocks || {},
            floorStats: progress.floorStats || {}
        };
    }

    getDetailedProgressReport() {
        // Generate a detailed progress report with insights
        const summary = this.getProgressSummary();
        const progress = this.adventureProgress;
        
        const report = {
            overview: {
                completionPercentage: Math.round((summary.floorsCompleted / summary.totalFloors) * 100),
                overallAccuracy: summary.overallAccuracy,
                playTime: this.formatPlayTime(summary.totalPlayTime),
                currentStreak: this.calculateCurrentStreak(),
                bestStreak: this.calculateBestStreak()
            },
            achievements: {
                perfectFloors: summary.perfectFloors,
                milestones: Object.keys(summary.milestoneUnlocks || {}),
                artifactsFound: summary.artifactsCollected,
                bossReady: summary.bossUnlocked,
                earned: Object.keys(this.adventureProgress.achievements || {})
            },
            performance: {
                averageAccuracy: summary.overallAccuracy,
                totalBattles: Object.values(summary.floorStats).reduce((total, stats) => total + (stats.attempts || 0), 0),
                totalVictories: Object.values(summary.floorStats).reduce((total, stats) => total + (stats.victories || 0), 0),
                bestFloorScores: this.getBestFloorScores()
            },
            recommendations: this.getProgressRecommendations()
        };
        
        return report;
    }

    formatPlayTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    calculateCurrentStreak() {
        // Calculate current consecutive victories
        const progress = this.adventureProgress;
        const floors = progress.floorsCompleted.sort((a, b) => b - a); // Sort descending
        
        let streak = 0;
        for (let i = 0; i < floors.length; i++) {
            if (i === 0 || floors[i] === floors[i-1] - 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateBestStreak() {
        // Calculate best consecutive victory streak
        const progress = this.adventureProgress;
        const floors = progress.floorsCompleted.sort((a, b) => a - b); // Sort ascending
        
        let bestStreak = 0;
        let currentStreak = 0;
        
        for (let i = 0; i < floors.length; i++) {
            if (i === 0 || floors[i] === floors[i-1] + 1) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        
        return bestStreak;
    }

    getBestFloorScores() {
        // Get best scores for each floor
        const progress = this.adventureProgress;
        const bestScores = {};
        
        Object.keys(progress.floorStats || {}).forEach(floorId => {
            const stats = progress.floorStats[floorId];
            if (stats.bestScore > 0) {
                bestScores[floorId] = stats.bestScore;
            }
        });
        
        return bestScores;
    }

    getProgressRecommendations() {
        // Generate personalized recommendations based on progress
        const summary = this.getProgressSummary();
        const recommendations = [];
        
        if (summary.overallAccuracy < 70 && summary.floorsCompleted > 0) {
            recommendations.push("Focus on improving accuracy by reviewing traffic laws before battles.");
        }
        
        if (summary.perfectFloors === 0 && summary.floorsCompleted >= 3) {
            recommendations.push("Try to achieve a perfect score on any floor for bonus rewards!");
        }
        
        if (summary.floorsCompleted < 5) {
            recommendations.push("Continue conquering floors to unlock new challenges and artifacts.");
        } else if (summary.floorsCompleted >= 5 && summary.floorsCompleted < curriculum.totalFloors) {
            recommendations.push("You're making great progress! Consider replaying floors to improve your scores.");
        } else if (summary.floorsCompleted === curriculum.totalFloors && !summary.gameCompleted) {
            recommendations.push("All floors conquered! Ready to face Lord Violation in the final battle!");
        }
        
        if (summary.artifactsCollected < 5 && summary.floorsCompleted >= 5) {
            recommendations.push("Make sure to collect artifacts after each victory for bonus rewards.");
        }
        
        return recommendations;
    }

    // ===== DEBUG METHODS =====
    debugFloorProgress() {
        // Debug method to check floor progress state
        const progress = this.adventureProgress;
        console.log('🔍 FLOOR PROGRESS DEBUG:');
        console.log('   - Floors Completed:', progress.floorsCompleted);
        console.log('   - Current Floor:', progress.currentFloor);
        console.log('   - Highest Completed Floor:', progress.floorsCompleted.length > 0 ? Math.max(...progress.floorsCompleted) : 'None');
        console.log('   - Expected Current Floor:', progress.floorsCompleted.length > 0 ? Math.max(...progress.floorsCompleted) + 1 : 1);
        
        // Check each floor's visibility
        console.log('   - Floor Visibility:');
        for (let i = 1; i <= curriculum.totalFloors; i++) {
            const isCompleted = progress.floorsCompleted.includes(i);
            const isUnlocked = i <= progress.currentFloor;
            const isCurrent = i === progress.currentFloor && !isCompleted;
            console.log(`     Floor ${i}: Completed=${isCompleted}, Unlocked=${isUnlocked}, Current=${isCurrent}`);
        }
        
        return {
            floorsCompleted: progress.floorsCompleted,
            currentFloor: progress.currentFloor,
            expectedCurrentFloor: progress.floorsCompleted.length > 0 ? Math.max(...progress.floorsCompleted) + 1 : 1
        };
    }

    fixFloorProgress() {
        // Fix method to correct floor progress issues
        console.log('🔧 FIXING FLOOR PROGRESS...');
        const progress = this.adventureProgress;
        
        // Update currentFloor to be the next available floor
        this.updateCurrentFloor();
        
        console.log('   - Fixed Current Floor:', progress.currentFloor);
        
        // Save the corrected progress
        this.saveAdventureProgress();
        
        // Update the tower map display
        this.updateTowerMapDisplay();
        
        console.log('✅ Floor progress fixed!');
    }

    debugTowerMap() {
        // Comprehensive debug method for tower map issues
        console.log('🔍 TOWER MAP DEBUG:');
        
        const progress = this.adventureProgress;
        console.log('   - Progress State:', progress);
        
        // Check if tower map container exists
        const mapContainer = document.getElementById('tower-map');
        console.log('   - Tower Map Container:', mapContainer);
        
        if (mapContainer) {
            const floorElements = mapContainer.querySelectorAll('.floor-level');
            console.log('   - Floor Elements Found:', floorElements.length);
            
            floorElements.forEach((element, index) => {
                const floorNumber = element.querySelector('.floor-number')?.textContent;
                const classes = element.className;
                console.log(`     Floor ${floorNumber}: Classes="${classes}"`);
            });
        }
        
        // Force refresh the tower map
        this.updateTowerMapDisplay();
        
        console.log('   - Tower map refreshed');
    }

    forceShowFloor3() {
        // Force floor 3 to be visible and accessible
        console.log('🔧 FORCING FLOOR 3 TO BE VISIBLE...');
        
        const progress = this.adventureProgress;
        
        // Ensure floors 1 and 2 are completed
        if (!progress.floorsCompleted.includes(1)) {
            progress.floorsCompleted.push(1);
        }
        if (!progress.floorsCompleted.includes(2)) {
            progress.floorsCompleted.push(2);
        }
        
        // Set currentFloor to 3
        progress.currentFloor = 3;
        
        console.log('   - Floors Completed:', progress.floorsCompleted);
        console.log('   - Current Floor:', progress.currentFloor);
        
        // Save progress
        this.saveAdventureProgress();
        
        // Update tower map
        this.updateTowerMapDisplay();
        
        console.log('✅ Floor 3 should now be visible!');
    }

    fixAllFloorIssues() {
        // Comprehensive fix for all floor visibility issues
        console.log('🔧 COMPREHENSIVE FLOOR FIX...');
        
        const progress = this.adventureProgress;
        
        // Step 1: Ensure currentFloor is properly set
        this.updateCurrentFloor();
        
        // Step 2: Verify floor data exists
        if (typeof curriculum === 'undefined' || !curriculum.totalFloors) {
            console.error('❌ Curriculum not loaded!');
            return;
        }
        
        // Step 3: Force currentFloor to be at least 1
        if (!progress.currentFloor || progress.currentFloor < 1) {
            progress.currentFloor = 1;
        }
        
        // Step 5: Save and refresh
        this.saveAdventureProgress();
        this.updateTowerMapDisplay();
        
        console.log('   - Fixed Current Floor:', progress.currentFloor);
        console.log('   - Floors Completed:', progress.floorsCompleted);
        console.log('   - Adventure Data Floors:', curriculum.floors.length);
        
        console.log('✅ Comprehensive fix complete!');
    }

    debugTowerMapRendering() {
        // Debug the actual tower map rendering process
        console.log('🔍 DEBUGGING TOWER MAP RENDERING...');
        
        const progress = this.adventureProgress;
        const container = document.getElementById('tower-map');
        
        console.log('   - Progress State:');
        console.log('     * currentFloor:', progress.currentFloor);
        console.log('     * floorsCompleted:', progress.floorsCompleted);
        console.log('     * floorsCompleted.length:', progress.floorsCompleted.length);
        
        console.log('   - Adventure Data:');
        console.log('     * floors.length:', curriculum.floors.length);
        console.log('     * first floor:', curriculum.floors[0]);
        
        console.log('   - Container State:');
        console.log('     * container exists:', !!container);
        console.log('     * container innerHTML length:', container ? container.innerHTML.length : 'N/A');
        
        // Check what classes are being applied to floors
        const floorElements = container ? container.querySelectorAll('.floor-level') : [];
        console.log('   - Floor Elements Found:', floorElements.length);
        
        floorElements.forEach((element, index) => {
            const floorNumber = element.querySelector('.floor-number')?.textContent;
            const classes = element.className;
            console.log(`     * Floor ${floorNumber}: classes="${classes}"`);
        });
        
        // Check if any floors are visible
        const visibleFloors = container ? container.querySelectorAll('.floor-level:not([style*="display: none"])') : [];
        console.log('   - Visible Floors:', visibleFloors.length);
        
        console.log('✅ Tower map rendering debug complete!');
    }

    forceRenderTowerMap() {
        // Force render the tower map with detailed logging
        console.log('🔧 FORCE RENDERING TOWER MAP...');
        
        const progress = this.adventureProgress;
        
        // Ensure currentFloor is set correctly
        this.updateCurrentFloor();
        console.log('   - Current Floor after update:', progress.currentFloor);
        
        // Force save progress
        this.saveAdventureProgress();
        console.log('   - Progress saved');
        
        // Force update tower map
        this.updateTowerMapDisplay();
        console.log('   - Tower map updated');
        
        // Debug the result
        this.debugTowerMapRendering();
        
        console.log('✅ Force render complete!');
    }

    forceShowFloors() {
        // Emergency method to force floors to be visible
        console.log('🚨 FORCE SHOWING FLOORS...');
        
        const floors = document.querySelectorAll('.floor-level');
        console.log('Found floors:', floors.length);
        
        floors.forEach((floor, index) => {
            floor.style.opacity = '1';
            floor.style.transform = 'translateY(0)';
            floor.style.display = 'flex';
            console.log(`Floor ${index + 1}: Made visible`);
        });
        
        console.log('✅ All floors should now be visible!');
    }

    resetProgress() {
        // Reset all progress (for game restart)
        const defaultProgress = {
            floorsCompleted: [],
            currentFloor: 1,
            artifactsCollected: [],
            bossUnlocked: false,
            gameCompleted: false,
            totalPlayTime: 0,
            attempts: {
                floors: {},
                boss: 0
            },
            floorStats: {}, // Enhanced floor statistics for Phase 3
            achievements: {}, // id -> true, once a badge is earned
            stats: {
                questionsAnswered: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                enemiesDefeated: 0,
                perfectFloors: 0,
                bossAttempts: 0
            }
        };

        this.adventureProgress = defaultProgress;
        this.saveAdventureProgress();
        this.updateUI();
    }

    exportProgress() {
        // Export progress data for backup/sharing
        return {
            version: '1.0',
            timestamp: Date.now(),
            progress: this.adventureProgress,
            gameData: {
                title: adventureData.gameTitle,
                totalFloors: curriculum.floors.length
            }
        };
    }

    importProgress(progressData) {
        // Import progress data from backup
        try {
            if (progressData.version && progressData.progress) {
                this.adventureProgress = { ...this.adventureProgress, ...progressData.progress };
                this.saveAdventureProgress();
                this.updateUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing progress:', error);
            return false;
        }
    }
}

// Global instance and functions for HTML integration
let adventureGame;

// Initialize the adventure game
function initAdventureGame() {
    adventureGame = new AdventureGame();
}

// Global functions for HTML event handlers
function startAdventure() {
    if (!adventureGame) initAdventureGame();
    adventureGame.showStoryIntro();
}

function showTowerMap() {
    if (adventureGame) adventureGame.showTowerMap();
}

// Note: Initialization is now handled by adventure-index.html DOM event listener

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdventureGame;
}

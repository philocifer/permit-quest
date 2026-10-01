// Princess Permit's Rescue - Curriculum (single source of truth)
//
// Everything about the tower's floors lives here: which guide section a floor
// covers, its enemy and dialogue, its artifact, its study tips, and its
// difficulty. Nothing else in the codebase may hardcode a floor count or restate
// a floor's metadata - derive it from `curriculum` instead.
//
// The tower mirrors the five parts of the Washington Driver Guide
// (docs/WA-driver-guide.pdf). Each part is a "wing"; difficulty is a property of
// the wing. Floor ids (1..totalFloors) are assigned from array order below.
//
// Every floor's `category` must match a key registered in js/questions/*.js.

const curriculum = {
    state: {
        name: 'Washington',
        agency: 'Washington State Department of Licensing',
        agencyShort: 'DOL',
        website: 'dol.wa.gov',
        guideTitle: 'Washington Driver Guide',
        knowledgeExam: 'Driving Knowledge Exam',
        skillsExam: 'Driving Skills Exam'
    },

    parts: [
        // ===== WING 1 - Guide Part 1: Licenses =====
        {
            id: 'licenses',
            guidePart: 1,
            name: 'The Gatehouse',
            subtitle: 'Licenses',
            icon: '🚪',
            difficulty: 1,
            floors: [
                {
                    category: 'licensing-basics',
                    name: 'Hall of Licensing',
                    theme: 'Grand hall with official documents and licensing ceremonies',
                    guideSections: ['1.0', '1.4', '1.5', '1.7', '1.12', '1.13', '1.15', '1.16'],
                    studyTips: [
                        'Know the residency tests and the 30-day rule for new residents',
                        'Learn what REAL ID is and which licenses qualify',
                        'Remember the two exams: knowledge first, then skills'
                    ],
                    enemy: {
                        name: 'Bureaucrat of Barriers',
                        title: 'Keeper of Official Documents',
                        portrait: '📄',
                        description: 'A stern official who guards the knowledge of licensing requirements. Only those who understand the proper procedures may pass.',
                        personality: {
                            confident: 'You cannot proceed without proper documentation and knowledge!',
                            damaged: 'Impressive! You understand the official requirements!',
                            defeated: 'Your knowledge of licensing procedures is... adequate. You may proceed, citizen.'
                        },
                        reactions: {
                            firstHit: 'What?! You understood the fine print? Impossible!',
                            desperation: 'No! The paperwork... it binds me! Your knowledge is... adequate!',
                            streak: 'Consecutive correct procedures! This is highly irregular!',
                            mocking: 'Ah, struggling with the bureaucracy like everyone else!',
                            midBattleCorrect: "We're only halfway through the forms, citizen!",
                            midBattleWrong: 'The bureaucracy grinds on, as it always does!'
                        }
                    },
                    story: {
                        intro: "You enter the Tower's first chamber, a grand hall lined with official documents and licensing stations. The Bureaucrat of Barriers sits behind an imposing desk, stamping papers with methodical precision.",
                        victory: "With your demonstration of licensing knowledge, the Bureaucrat nods approvingly and stamps your quest permit. 'The path upward is now open to you, licensed adventurer.'"
                    },
                    artifact: {
                        key: 'seal-authorization',
                        name: 'Seal of Authorization',
                        description: 'An official seal that proves your right to undertake this heroic quest through proper channels.'
                    },
                    princessMessage: 'I sense a brave knight has entered the tower! Your determination gives me strength!'
                },
                {
                    category: 'teen-licensing',
                    name: 'Vault of Restrictions',
                    theme: 'Moonlit vault of hourglasses, ledgers, and locked curfew chains',
                    guideSections: ['1.8', '1.14'],
                    studyTips: [
                        'Memorize the permit ages: 15 with driver training, 15½ without',
                        'Know the passenger and 1 a.m. to 5 a.m. limits on the intermediate license',
                        'Remember that intermediate license holders cannot use a phone even hands-free, except to report an emergency'
                    ],
                    enemy: {
                        name: 'Curfew Wraith',
                        title: 'Haunter of Restricted Hours',
                        portrait: '🌙',
                        description: 'A pale specter that drifts through the vault between one and five in the morning, binding young knights to the rules of their first license.',
                        personality: {
                            confident: 'Hours pass and restrictions bind! You are not yet free, young knight!',
                            damaged: 'You know the limits by heart... how unsettling!',
                            defeated: 'The hours... are yours to keep... drive wisely, young one...'
                        },
                        reactions: {
                            firstHit: 'You know the passenger limits already? Who taught you that?!',
                            desperation: 'My chains... loosening... you understand every restriction!',
                            streak: 'Answer after answer... you leave me no loophole!',
                            mocking: 'Forgot the curfew hours? How very like a rushing young driver!',
                            midBattleCorrect: 'Halfway through the night, and still no mistakes?',
                            midBattleWrong: 'The restrictions tighten around you!'
                        }
                    },
                    story: {
                        intro: 'A moonlit vault opens before you, its walls hung with hourglasses and ledgers of restricted hours. The Curfew Wraith coils around a locked chain, whispering the rules every new driver must learn.',
                        victory: 'The Curfew Wraith fades and the chains fall away. Moonlight pours through the vault, and the stairs upward glow softly.'
                    },
                    artifact: {
                        key: 'lantern-patience',
                        name: 'Lantern of Patience',
                        description: 'A steady lantern that reminds new drivers that every restriction is a step toward full freedom.'
                    },
                    princessMessage: "Your patience echoes through the tower! The second guardian has fallen, and I feel my prison weakening!"
                }
            ]
        },

        // ===== WING 2 - Guide Part 2: Vehicles =====
        {
            id: 'vehicles',
            guidePart: 2,
            name: 'The Forge',
            subtitle: 'Vehicles',
            icon: '🔨',
            difficulty: 2,
            floors: [
                {
                    category: 'vehicle-ownership',
                    name: 'The Registry Forge',
                    theme: 'Glowing forge where titles, plates, and registrations are hammered out',
                    guideSections: ['2.0', '2.1', '2.2', '2.3'],
                    studyTips: [
                        'Know the difference between a title and a registration',
                        'Remember the deadlines: report of sale, title transfer, new resident registration',
                        'Learn the three liability insurance minimums'
                    ],
                    enemy: {
                        name: 'Titleless Trickster',
                        title: 'Forger of False Ownership',
                        portrait: '📋',
                        description: 'A slippery imp who sells vehicles with no papers and vanishes before the paperwork is filed.',
                        personality: {
                            confident: 'Ownership is whatever I say it is! Who needs a title?',
                            damaged: 'You know which forms to file?! My tricks!',
                            defeated: 'Title signed... plates removed... report filed... I am undone...'
                        },
                        reactions: {
                            firstHit: 'You know a report of sale does not transfer ownership?! Clever!',
                            desperation: 'The deadlines... you remember every one! Stop!',
                            streak: 'So many correct forms in a row... my scheme collapses!',
                            mocking: 'Lost the title already? Finders keepers!',
                            midBattleCorrect: 'Half the paperwork done right... how tedious!',
                            midBattleWrong: 'Sign here, sign there, misfile everywhere!'
                        }
                    },
                    story: {
                        intro: 'Heat rolls over you as you enter a forge where stamped titles and glowing license plates cool on racks. The Titleless Trickster juggles unsigned papers and grins.',
                        victory: 'The Trickster scrambles away, dropping his forged papers. The forge fires burn steady and orderly, and a stairway to the next chamber appears.'
                    },
                    artifact: {
                        key: 'deed-ownership',
                        name: 'Deed of Ownership',
                        description: 'A golden deed that proves every vehicle in the kingdom has a rightful, registered owner.'
                    },
                    princessMessage: 'You have mastered the forge of ownership! The tower trembles at your knowledge, brave knight!'
                },
                {
                    category: 'vehicle-readiness',
                    name: 'The Inspection Chamber',
                    theme: 'Mechanical workshop filled with car parts and inspection tools',
                    guideSections: ['2.4', '2.5', '2.6'],
                    studyTips: [
                        'Know when headlights must be on and when to switch from high beams',
                        'Learn the three hand signals for when lights fail',
                        'Review seat belt fit and the child restraint stages by age'
                    ],
                    enemy: {
                        name: 'Rust Reaper',
                        title: 'Corruptor of Machines',
                        portrait: '🔧',
                        description: 'A mechanical demon that corrupts and degrades all vehicles it touches, spreading rust and malfunction.',
                        personality: {
                            confident: 'Your vehicle will fail my inspection! Rust and decay consume all!',
                            damaged: 'Proper maintenance defeats my corruption!',
                            defeated: 'Well maintained... machines... serve their masters... Keep your chariot... in good order...'
                        },
                        reactions: {
                            firstHit: 'Vehicle maintenance knowledge... troublesome!',
                            desperation: 'Well-maintained vehicles... my weakness!',
                            streak: 'Your mechanical knowledge runs deep!',
                            mocking: 'Neglect your vehicle maintenance! Rust consumes all!',
                            midBattleCorrect: 'Half my corrosion scrubbed away already?',
                            midBattleWrong: 'Bald tires and burnt bulbs... my favorite snacks!'
                        }
                    },
                    story: {
                        intro: 'The chamber resembles a twisted auto shop where the Rust Reaper tends to broken and corroded vehicles. Tools float ominously in the air around its mechanical form.',
                        victory: "Your knowledge of proper vehicle maintenance cleanses the Rust Reaper's corruption. The chamber transforms into a pristine workshop with gleaming tools and well-maintained equipment."
                    },
                    artifact: {
                        key: 'seal-compliance',
                        name: 'Seal of Compliance',
                        description: 'An official seal that ensures any vehicle bearing it is safe, buckled, and road ready.'
                    },
                    princessMessage: 'Your vehicle knowledge shines like polished steel! Lord Violation grows worried!'
                },
                {
                    category: 'vehicle-control',
                    name: 'Hall of Mirrors',
                    theme: 'Endless corridor of mirrors hiding shapes in every blind zone',
                    guideSections: ['2.7', '2.8', '2.9', '2.10', '2.11', '2.12', '2.13', '2.14'],
                    studyTips: [
                        'Know the three steering methods and when to use each',
                        'Remember that ABS lets you steer while braking but does not shorten stopping distance',
                        'Learn pitch, roll, and yaw, and how to reduce your blind zones'
                    ],
                    enemy: {
                        name: 'Blindspot Behemoth',
                        title: 'Lurker in the Unseen Zones',
                        portrait: '🚙',
                        description: 'A hulking beast that hides in the areas you cannot see from the driver seat, and strikes whenever a knight forgets to look twice.',
                        personality: {
                            confident: 'You cannot see me! Nobody ever sees me until it is too late!',
                            damaged: 'You checked over your shoulder?! Nobody does that!',
                            defeated: 'No blind zone... left... Every mirror... set true...'
                        },
                        reactions: {
                            firstHit: 'You adjusted your mirrors first? Insufferable!',
                            desperation: 'My hiding places... shrinking! Your scans reach everywhere!',
                            streak: 'Head check after head check... I have nowhere to hide!',
                            mocking: 'Stared straight ahead again? I love new drivers!',
                            midBattleCorrect: 'Halfway through and my shadows are fading!',
                            midBattleWrong: 'Lurking in your blind zone, right where I like it!'
                        }
                    },
                    story: {
                        intro: 'A corridor of tilted mirrors stretches before you, each reflecting a slightly different room. Something enormous shifts in the spaces between them, always just out of view.',
                        victory: 'The Behemoth shrinks into the glass and every mirror clears. Your reflection stares back at you, sharp-eyed and aware.'
                    },
                    artifact: {
                        key: 'mirror-vigilance',
                        name: 'Mirror of Vigilance',
                        description: 'A mirror with no blind spots, reminding its bearer to always check twice.'
                    },
                    princessMessage: 'I can see your light in every mirror of the tower! Keep climbing, noble one!'
                }
            ]
        },

        // ===== WING 3 - Guide Part 3: Drivers =====
        {
            id: 'drivers',
            guidePart: 3,
            name: 'The Mind Spire',
            subtitle: 'Drivers',
            icon: '🧠',
            difficulty: 3,
            floors: [
                {
                    category: 'driver-fitness',
                    name: 'The Dreaming Gallery',
                    theme: 'Drowsy gallery of soft light, heavy curtains, and half-closed eyes',
                    guideSections: ['3.0', '3.1'],
                    studyTips: [
                        'Know the signs of fatigue and when to pull over',
                        'Remember how much sleep most people need and how often to take breaks',
                        'Learn the vision and night-driving rules, including the law on headphones'
                    ],
                    enemy: {
                        name: 'Slumber Shade',
                        title: 'Whisperer of Heavy Eyelids',
                        portrait: '😴',
                        description: 'A drifting shadow that dims the lights and softens every sound until a driver forgets the last few miles.',
                        personality: {
                            confident: 'Rest your eyes... just for a moment... the road will wait...',
                            damaged: 'You are... still awake? How irritating!',
                            defeated: 'Wide awake... and wise enough... to stop and rest...'
                        },
                        reactions: {
                            firstHit: 'Alert already? I have barely begun to yawn!',
                            desperation: 'Your eyes stay open... my curtains are falling!',
                            streak: 'Sharp answer after sharp answer... you are far too rested!',
                            mocking: 'Heavy eyelids, heavy answers... sleep, knight, sleep!',
                            midBattleCorrect: 'Half through and still wide awake? Unnatural!',
                            midBattleWrong: 'Yawwwwn... you are drifting out of your lane...'
                        }
                    },
                    story: {
                        intro: 'Soft light and heavy curtains fill a long gallery where every painted eye is half closed. The Slumber Shade drifts between the frames, humming a lullaby for tired drivers.',
                        victory: 'The curtains fly open and dawn floods the gallery. The Shade dissolves, and you feel rested and clear-headed.'
                    },
                    artifact: {
                        key: 'lantern-wakefulness',
                        name: 'Lantern of Wakefulness',
                        description: 'A bright lantern that never dims, warning its bearer when it is time to stop and rest.'
                    },
                    princessMessage: 'Your clear mind lights the way! I feel brighter just knowing you are awake and climbing!'
                },
                {
                    category: 'impaired-driving',
                    name: 'The Poison Chamber',
                    theme: 'Hazy chamber filled with toxic mists and distorted reality',
                    guideSections: ['1.15', '3.1'],
                    studyTips: [
                        'Memorize the limits: BAC 0.08% (0.02% under 21) and THC 5 ng (above 0 under 21)',
                        'Remember that driving after using any cannabis is illegal for all ages',
                        'Know the Implied Consent Law and the penalty for refusing a test'
                    ],
                    enemy: {
                        name: 'Intoxication Imp',
                        title: 'Demon of Clouded Judgment',
                        portrait: '🍺',
                        description: 'A sinister creature that feeds on poor judgment and impaired thinking, clouding minds with its toxic influence.',
                        personality: {
                            confident: 'Your judgment clouds... perfect! My mists will consume your mind!',
                            damaged: 'The fog clears... my power wanes before your clarity!',
                            defeated: 'Clear sight... burns away... my essence... Think clearly, Knight...'
                        },
                        reactions: {
                            firstHit: 'Your mind stays clear despite my fog!',
                            desperation: 'Clarity... it hurts... My mists... dissipating!',
                            streak: 'Your judgment remains sharp... this troubles me!',
                            mocking: 'Your judgment clouds perfectly! My work here is done!',
                            midBattleCorrect: 'Your mind stays clear at the halfway point!',
                            midBattleWrong: 'The fog thickens around your thoughts!'
                        }
                    },
                    story: {
                        intro: 'Poisonous mists swirl around you as you climb higher. The Intoxication Imp emerges from the haze, its form shifting and blurring as it tries to cloud your vision and judgment.',
                        victory: "Your clear thinking dispels the toxic mists. The chamber air clears, revealing stairs that spiral upward toward Princess Permit's prison."
                    },
                    artifact: {
                        key: 'crystal-clarity',
                        name: 'Crystal of Clarity',
                        description: 'A perfectly clear crystal that cuts through any deception or impairment.'
                    },
                    princessMessage: 'Knight! Your clear thinking gives me hope! I can feel my prison weakening!'
                },
                {
                    category: 'focus-and-attitude',
                    name: 'Tower of Distraction',
                    theme: 'Chaotic room with flashing lights, sounds, and constant distractions',
                    guideSections: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6'],
                    studyTips: [
                        'Know what Washington law says about holding electronic devices',
                        'Learn the behaviors that count as aggressive driving and road rage',
                        'Practice the OODA loop: observe, orient, decide, act'
                    ],
                    enemy: {
                        name: 'Focus Fiend',
                        title: 'Master of Scattered Attention',
                        portrait: '📱',
                        description: 'A chaotic demon that feeds on scattered attention and distracted minds, surrounding itself with endless interruptions.',
                        personality: {
                            confident: 'Look here! Listen there! Your focus scatters to the wind!',
                            damaged: 'Your concentration cuts through my chaos!',
                            defeated: 'True focus... conquers all distractions... Stay alert, brave Knight... the final test awaits...'
                        },
                        reactions: {
                            firstHit: 'Attention while I scatter your thoughts? Impossible!',
                            desperation: 'Sustained attention... defeating my chaos!',
                            streak: 'Unwavering concentration... my arch-nemesis!',
                            mocking: 'Distraction spreads! Your mind scatters beautifully!',
                            midBattleCorrect: 'Half the notifications ignored... how rude!',
                            midBattleWrong: 'Ooh, a buzzing phone! Look away, look away!'
                        }
                    },
                    story: {
                        intro: 'The room assaults your senses with flashing lights, blaring sounds, and constant motion. The Focus Fiend dances wildly among screens and notifications.',
                        victory: 'Your unwavering focus silences the chaos. The distractions fade away, leaving only a clear view to the spiral staircase that climbs on.'
                    },
                    artifact: {
                        key: 'ward-concentration',
                        name: 'Ward of Concentration',
                        description: 'A mystical charm that protects the mind from all distractions and maintains perfect focus.'
                    },
                    princessMessage: 'The Focus Fiend has fallen! Your calm, steady mind is the strongest weapon in the kingdom!'
                }
            ]
        },

        // ===== WING 4 - Guide Part 4: Roads =====
        {
            id: 'roads',
            guidePart: 4,
            name: 'The Labyrinth',
            subtitle: 'Roads',
            icon: '🧭',
            difficulty: 4,
            floors: [
                {
                    category: 'signs-and-signals',
                    name: 'Gates of Understanding',
                    theme: 'Ancient symbols and mystical road signs',
                    guideSections: ['4.10', '4.11', '4.12'],
                    studyTips: [
                        'Know every traffic light signal, including flashing red and flashing yellow',
                        'Learn the sign color meanings: red, white, orange, yellow, fluorescent yellow-green, green, blue, brown',
                        'Remember that a dark traffic signal is treated like a four-way stop'
                    ],
                    enemy: {
                        name: 'Sign Sentinel',
                        title: 'Guardian of Ancient Symbols',
                        portrait: '🚸',
                        description: 'An ancient creature that speaks only in symbols and road signs. Its riddles must be solved to pass.',
                        personality: {
                            confident: 'My ancient symbols confuse even the wisest travelers!',
                            damaged: 'Impossible! You read the language of the roads!',
                            defeated: 'You have proven worthy... the way forward opens to you, Knight.'
                        },
                        reactions: {
                            firstHit: 'You... you read my ancient runes! How?!',
                            desperation: 'My symbols... failing... You truly understand the roads!',
                            streak: 'Your sign mastery grows... concerning!',
                            mocking: 'My symbols confuse you as they should!',
                            midBattleCorrect: 'Half the ancient riddles solved... troubling!',
                            midBattleWrong: 'My symbols still perplex you, good!'
                        }
                    },
                    story: {
                        intro: "Beyond the lower wings, the massive gates to the Labyrinth loom before you. The Sign Sentinel emerges from the shadows, its form shifting between stop signs, yield signs, and ancient symbols.",
                        victory: "As the Sign Sentinel fades away, the gates swing open with a thunderous crack. Princess Permit's voice echoes faintly: 'Well done, brave knight! But greater challenges await...'"
                    },
                    artifact: {
                        key: 'rune-understanding',
                        name: 'Rune of Understanding',
                        description: 'A glowing stone tablet inscribed with every traffic sign known to the kingdom.'
                    },
                    princessMessage: 'Well done, brave one! I felt the tower shake as the Sign Sentinel fell!'
                },
                {
                    category: 'intersections-and-turns',
                    name: 'The Carousel of Crossroads',
                    theme: 'Spinning stone circles, branching paths, and shifting lanes',
                    guideSections: ['4.13', '4.14', '4.15'],
                    studyTips: [
                        'Know who goes first at a four-way stop',
                        'Learn the seven steps of driving a roundabout',
                        'Remember that every intersection is legally a crosswalk'
                    ],
                    enemy: {
                        name: 'Roundabout Revenant',
                        title: 'Spirit of the Endless Circle',
                        portrait: '🔄',
                        description: 'A ghost that circles forever, tempting travelers to stop inside the ring, forget to yield, or pick the wrong lane.',
                        personality: {
                            confident: 'Round and round you go! Nobody ever finds the right exit!',
                            damaged: 'You yielded to the left?! How... proper!',
                            defeated: 'Counterclockwise... lane held... exit taken... I am released...'
                        },
                        reactions: {
                            firstHit: 'You yield before entering? The circle is displeased!',
                            desperation: 'My ring... breaking! You know every exit!',
                            streak: 'Smooth entries, smooth exits... you spoil my carousel!',
                            mocking: 'Stopped in the circle? Stay a while, traveler!',
                            midBattleCorrect: 'Halfway around and still in your lane? Hmph!',
                            midBattleWrong: 'Wrong lane, wrong turn, round you go again!'
                        }
                    },
                    story: {
                        intro: 'A great stone ring rotates in the center of the chamber, with a dozen paths branching off in every direction. The Roundabout Revenant drifts around it, daring you to choose a lane.',
                        victory: 'The carousel grinds to a halt and every path reveals where it leads. The Revenant bows and lets you onward.'
                    },
                    artifact: {
                        key: 'compass-crossroads',
                        name: 'Compass of Crossroads',
                        description: 'A compass that always points to the correct lane and the correct exit.'
                    },
                    princessMessage: 'You have found your way through the crossroads! Your sense of direction gives me hope!'
                },
                {
                    category: 'lanes-zones-and-parking',
                    name: 'The Cramped Cavern',
                    theme: 'Maze of tight spaces, painted lines, and confusing parking layouts',
                    guideSections: ['4.16', '4.17', '4.18', '4.19', '4.20'],
                    studyTips: [
                        'Know what each lane marking color and line type means',
                        'Memorize the no-parking distances',
                        'Remember the school zone and emergency zone speed rules'
                    ],
                    enemy: {
                        name: 'Space Stealer',
                        title: 'Goblin of Tight Spaces',
                        portrait: '🅿️',
                        description: 'A sneaky goblin that steals parking spaces and warps the geometry of tight areas, making navigation impossible.',
                        personality: {
                            confident: "These spaces are too tight! You'll never find your way!",
                            damaged: 'Your precision navigation defeats my spatial tricks!',
                            defeated: 'Perfect parking... I cannot argue with such... precision... The spaces are yours...'
                        },
                        reactions: {
                            firstHit: 'You know proper parking procedure?!',
                            desperation: 'Proper parking... my nemesis... growing stronger!',
                            streak: 'Perfect parking knowledge... my greatest fear!',
                            mocking: 'Poor parking! The spaces belong to ME!',
                            midBattleCorrect: 'Halfway through and you have not clipped a wall!',
                            midBattleWrong: 'Too close to the hydrant! The spaces are mine!'
                        }
                    },
                    story: {
                        intro: 'You enter a bewildering maze of tight corridors and impossible parking configurations. The Space Stealer giggles as it rearranges the walls around you.',
                        victory: "Your mastery of lanes, zones, and parking unravels the goblin's maze. The cavern reorganizes into a perfectly ordered parking structure."
                    },
                    artifact: {
                        key: 'compass-precision',
                        name: 'Compass of Precision',
                        description: 'A mystical compass that always points to the perfect parking spot, no matter how tight the space.'
                    },
                    princessMessage: 'Your growing mastery reaches even here! Lord Violation grows worried!'
                },
                {
                    category: 'sharing-the-road',
                    name: 'The Sharing Grounds',
                    theme: 'Narrow bridges and contested pathways',
                    guideSections: ['4.0', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9'],
                    studyTips: [
                        'Know when you must stop for a school bus and when you need not',
                        'Remember the 3-foot passing rule for bicyclists and farm vehicles',
                        'Learn exactly how far from the rail you must stop at a crossing'
                    ],
                    enemy: {
                        name: 'Selfish Specter',
                        title: 'Ghost of Greed',
                        portrait: '🤝',
                        description: 'A greedy phantom that hoards road space and refuses to share, blocking the path for all others.',
                        personality: {
                            confident: 'This road is MINE! I will not share with anyone!',
                            damaged: 'No! You show courtesy where I show selfishness!',
                            defeated: 'Perhaps... sharing makes the journey... better for all... I understand now...'
                        },
                        reactions: {
                            firstHit: 'You dare show courtesy in MY domain?!',
                            desperation: 'Sharing... the concept... it weakens me!',
                            streak: 'So much courtesy... it makes me sick!',
                            mocking: 'Selfishness spreads! Take all the road space!',
                            midBattleCorrect: 'Sharing the road halfway through? Disgusting!',
                            midBattleWrong: 'Selfishness grows! Excellent!'
                        }
                    },
                    story: {
                        intro: 'The tower narrows to a series of bridges and pathways. The Selfish Specter blocks your way, its ghostly form sprawling across the entire path.',
                        victory: 'Your demonstration of sharing and courtesy causes the Selfish Specter to step aside gracefully. The path widens to accommodate all travelers.'
                    },
                    artifact: {
                        key: 'token-courtesy',
                        name: 'Token of Courtesy',
                        description: 'A golden medallion that reminds all travelers to share the road with respect and kindness.'
                    },
                    princessMessage: 'Your courtesy and sharing nature warms my heart! Keep climbing, noble one!'
                }
            ]
        },

        // ===== WING 5 - Guide Part 5: Risks =====
        {
            id: 'risks',
            guidePart: 5,
            name: 'The Storm Deck',
            subtitle: 'Risks',
            icon: '⛈️',
            difficulty: 5,
            floors: [
                {
                    category: 'speed-space-and-time',
                    name: 'The Speed Corridor',
                    theme: 'Long, winding corridors with speed-themed obstacles',
                    guideSections: ['5.1', '5.2', '5.3', '5.4'],
                    studyTips: [
                        'Remember that the speed limit is the maximum for ideal conditions only',
                        'Know the space cushion: at least twice your vehicle length',
                        'Learn how a zipper merge works and why it helps'
                    ],
                    enemy: {
                        name: 'Highway Hellhound',
                        title: 'Beast of Endless Roads',
                        portrait: '🏁',
                        description: 'A massive hound that races through endless corridors at dangerous speeds, challenging travelers to match its pace safely.',
                        personality: {
                            confident: 'Speed is everything! Can you keep up with me?',
                            damaged: 'Your controlled speed defeats my reckless racing!',
                            defeated: 'Controlled speed... is true mastery... Race well, Champion...'
                        },
                        reactions: {
                            firstHit: 'Safe speed knowledge... impressive, but futile!',
                            desperation: 'Your speed wisdom... too powerful!',
                            streak: 'Speed, space, and time all mastered... troubling!',
                            mocking: 'Faster! Faster! Who needs a safe following distance?',
                            midBattleCorrect: 'Halfway down the corridor, still under control?',
                            midBattleWrong: 'Speed thrills! Space is for the weak!'
                        }
                    },
                    story: {
                        intro: 'Long corridors stretch ahead like endless highways. The Highway Hellhound howls as it races past at tremendous speed, leaving trails of tire marks.',
                        victory: 'By demonstrating safe speed, space, and timing, you tame the Hellhound. It now runs alongside you as a faithful companion, maintaining perfect pace.'
                    },
                    artifact: {
                        key: 'map-swift-passage',
                        name: 'Map of Swift Passage',
                        description: 'An enchanted map that reveals the safest and most efficient routes for high-speed travel.'
                    },
                    princessMessage: 'The speed and space knowledge you have shown echoes through these walls! I am proud of you!'
                },
                {
                    category: 'conditions-and-hazards',
                    name: 'The Drowned Causeway',
                    theme: 'Rain-lashed causeway of slick stones, black ice, and sharp curves',
                    guideSections: ['5.0', '5.5', '5.6'],
                    studyTips: [
                        'Know how to recover from a skid and from hydroplaning',
                        'Remember you should be able to stop within your headlight beams at night',
                        'Learn the three kinds of vision: central, fringe, and peripheral'
                    ],
                    enemy: {
                        name: 'Hydroplane Horror',
                        title: 'Tide Beast of Slick Roads',
                        portrait: '🌧️',
                        description: 'A slithering creature that lives in puddles and black ice, waiting for a driver to go too fast into a wet curve.',
                        personality: {
                            confident: 'Slip and slide! Your tires will never find the road again!',
                            damaged: 'You kept your wheel steady?! The water was supposed to win!',
                            defeated: 'Steady hands... gentle brakes... the road is yours again...'
                        },
                        reactions: {
                            firstHit: 'You slowed for the wet road? How disappointing!',
                            desperation: 'Steady wheel... foot off the gas... my waters recede!',
                            streak: 'Not one skid in all those answers? Impossible!',
                            mocking: 'Slam the brakes! Jerk the wheel! Glide, glide, glide!',
                            midBattleCorrect: 'Halfway across and no slip yet? Hmph!',
                            midBattleWrong: 'Black ice! Nobody ever sees it in time!'
                        }
                    },
                    story: {
                        intro: 'Rain hammers a narrow causeway where puddles hide beneath each stone and a thin sheet of ice clings to the curves. The Hydroplane Horror ripples beneath the surface, waiting.',
                        victory: 'The storm parts and the causeway dries beneath your feet. The Horror sinks away, and the road ahead is firm and clear.'
                    },
                    artifact: {
                        key: 'amulet-traction',
                        name: 'Amulet of Traction',
                        description: 'A charm that grips the road in any weather, rain or ice, as long as its bearer drives to match the conditions.'
                    },
                    princessMessage: 'The storm cannot shake you! Safe and steady, you rise through the tower!'
                },
                {
                    category: 'emergencies-and-collisions',
                    name: 'Chamber of Hazards',
                    theme: 'Obstacle course filled with hazards, breakdowns, and warning signs',
                    guideSections: ['5.7', '5.8', '5.9', '5.10'],
                    studyTips: [
                        'Know what to do when a tire blows, the engine stalls, or the accelerator sticks',
                        'Remember the crash steps: call 911 if anyone is hurt, report within 4 days',
                        'Learn the correct steps when an officer pulls you over'
                    ],
                    enemy: {
                        name: 'Danger Drake',
                        title: 'Beast of Recklessness',
                        portrait: '⚠️',
                        description: 'A fearsome dragon that thrives on dangerous situations and reckless behavior, breathing hazards instead of fire.',
                        personality: {
                            confident: 'Danger is my element! Safety is for cowards!',
                            damaged: 'Your caution shields you from my hazards!',
                            defeated: 'Safety... conquers all dangers... You are truly prepared, Knight...'
                        },
                        reactions: {
                            firstHit: 'Safety first? How revolting!',
                            desperation: 'Safety measures... they are... effective against me!',
                            streak: 'Safety streak! How disgustingly responsible!',
                            mocking: 'Recklessness rises! Danger becomes you!',
                            midBattleCorrect: 'Safety persists through half the battle!',
                            midBattleWrong: 'Danger spreads beautifully!'
                        }
                    },
                    story: {
                        intro: 'The final chamber is filled with stalled vehicles, flickering flares, and dangerous traps. The Danger Drake roars from atop a pile of wreckage, challenging you to prove your emergency knowledge.',
                        victory: 'With the Danger Drake tamed by your safety wisdom, the hazards dissolve and the chamber becomes a safe passage lined with protective barriers.'
                    },
                    artifact: {
                        key: 'shield-safety',
                        name: 'Shield of Safety',
                        description: 'An enchanted shield that protects against all road hazards through the power of preparation and caution.'
                    },
                    princessMessage: 'The Danger Drake has fallen! Only Lord Violation himself stands between us now!'
                }
            ]
        }
    ]
};

// ===== Derived data (do not hand-edit) =====
// Floor ids are assigned bottom-up from array order. Floors are mutated in place
// so `part.floors[i]` and `curriculum.floors[n]` are the very same objects.
curriculum.floors = curriculum.parts.flatMap(part => part.floors);
curriculum.floors.forEach((floor, index) => {
    floor.id = index + 1;
});
curriculum.parts.forEach(part => {
    part.floors.forEach(floor => {
        floor.difficulty = part.difficulty;
        // Non-enumerable so a floor never serializes (and never cycles) through its part
        Object.defineProperty(floor, 'part', { value: part, enumerable: false });
    });
});

curriculum.totalFloors = curriculum.floors.length;
curriculum.bossFloorId = curriculum.totalFloors + 1;
curriculum.floorById = function (id) {
    return curriculum.floors[id - 1];
};

// Badges the player can see coming. `earned` reads saved progress and nothing else,
// so the list can be checked without the game engine.
curriculum.achievements = [
    ...curriculum.parts.map(part => ({
        id: `wing-${part.id}`,
        icon: part.icon,
        name: `${part.name} Cleared`,
        description: `Conquer every floor of the ${part.subtitle} wing.`,
        earned(progress) {
            return part.floors.every(floor => progress.floorsCompleted.includes(floor.id));
        }
    })),
    {
        id: 'perfect-floor',
        icon: '⭐',
        name: 'Flawless Victory',
        description: 'Clear a floor without missing a question.',
        earned(progress) {
            return (progress.stats.perfectFloors || 0) >= 1;
        }
    },
    {
        id: 'all-artifacts',
        icon: '💎',
        name: 'Vault Complete',
        description: 'Collect the artifact from every floor.',
        earned(progress) {
            return progress.artifactsCollected.length >= curriculum.totalFloors;
        }
    },
    {
        id: 'high-accuracy',
        icon: '🎯',
        name: 'Master of the Road',
        description: 'Answer at least 20 questions with 90% or better accuracy.',
        earned(progress) {
            const total = progress.stats.totalQuestions || 0;
            if (total < 20) return false;
            return progress.stats.correctAnswers / total >= 0.9;
        }
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = curriculum;
} else if (typeof window !== 'undefined') {
    window.curriculum = curriculum;
}

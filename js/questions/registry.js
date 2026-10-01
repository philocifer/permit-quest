// Question bank registry
//
// The question bank is split into one file per part of the Washington Driver Guide
// (js/questions/01-licenses.js ... 05-risks.js). Each file calls registerQuestions()
// with a map of category slug -> question array. Category slugs must match the
// `category` field of a floor in js/curriculum.js.
//
// Question shape (validated by AdventureGame.validateQuestionStructure):
//   { question: string, answers: string[], correct: number (0-based), explanation: string }
//
// Load order: this file must load before the part files.

const questionsData = {};

function registerQuestions(categoryMap) {
    Object.entries(categoryMap).forEach(([category, questions]) => {
        if (questionsData[category]) {
            console.error(`Duplicate question category registered: ${category}`);
            return;
        }
        questionsData[category] = questions;
    });
}

if (typeof window !== 'undefined') {
    window.questionsData = questionsData;
    window.registerQuestions = registerQuestions;
}

let intermediateWords = [
    "ambiguous",
    "benevolent",
    "coherent",
    "conventional",
    "diligent",
    "eloquent",
    "feasible",
    "inevitable",
    "meticulous",
    "profound",
    "reluctant",
    "subtle",
    "versatile",
    "vivid",
    "skeptical"
]

function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * intermediateWords.length);
    let randomWord = intermediateWords[randomIndex];
    return randomWord;
}

const randomWord = getRandomWord();



/* ------------- STARTS HERE ------------------ */

const correctAnswers = ['predictable', 'ineluctable'];
const wrongAnswers = ['evitable', 'avoidable', 'skeptical', 'subtle'];


// COMBINING SELECTED SYNONYMS AND ANTONYMS THEN RUMBLE ARRANGEMENT FUNCTION
function rumbleSynonymsAntonyms(correct, wrong) {
    // combining synonyms and antonyms together
    const optionWords = [...correct, ...wrong];

    // shuffling synonyms and antonyms
    const shuffleOptions = [...optionWords].sort(() => Math.random() - 0.5);

    return shuffleOptions;
}


// call


console.log(randomWord);
console.log(rumbleSynonymsAntonyms(correctAnswers, wrongAnswers));
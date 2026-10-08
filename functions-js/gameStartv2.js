console.log("JavaScript file loaded!");

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

// RANDOM WORD FUNCTION
function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * intermediateWords.length);
    let randomWord = intermediateWords[randomIndex];
    return randomWord;
}

/* -------- SYNONYMS FUNCTIONS HERE ------- */

// SYNONYMS OF RANDOM WORD FUNCTION
async function getSynonyms(word) {
    const response = await fetch(
        `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}` // use of api
    );

    const data = await response.json();

    // returning only the words
    const synonyms = data.map(item => item.word);
    return synonyms;
}

// VERIFYING OF SYNONYMS COUNT FUNCTION 
 //   - this function dictates if a new word will be selected and give the corresponding synonyms of the new word
 //   - result of this is the synonyms
 //   - point of selection, not yet the function for selecting the correct words
function getSynonymsWithCount(word, count) {
    const synonyms = getSynonyms(word);

    // if SYNONYMS LESS THAN NEEDED number
    if (synonyms.length < count) {
        let newRandomWord = getRandomWord();
        console.log("New random word:", newRandomWord);

        // run synonyms function again to get the synonyms of the new random word
        getSynonyms(newRandomWord).then(newSynonyms => {
            console.log("Synonyms for", newRandomWord, "are:", newSynonyms);
            if (newSynonyms.length < count) {
                getSynonymsWithCount(newRandomWord, count);
            } else {
                synonyms = newSynonyms;
                console.log("Final synonyms for newWord:", newRandomWord, "are:", synonyms);
            }
        });

        return synonyms;
    } else {
        return synonyms;
    }
}

// SELECTING CERTAIN NUMBER OF CORRECT ANSWERS FUNCTION
async function getRandomSynonyms(synonyms, count) {
    const dupSynonyms = [...new Set(synonyms)]; // copying the synonyms array to a new array to avoid touching the main array
    const selectedSynonyms = [];
    
    while (selectedSynonyms.length < count) {
        // radomizer number
        const randomIndex = Math.floor(Math.random() * dupSynonyms.length);
        // selecting word from random index
        const selectedSynonym = dupSynonyms[randomIndex];

        if (dupSynonyms.length < count) {

        }

        if (!selectedSynonyms.includes(selectedSynonym)) {
            selectedSynonyms.push(selectedSynonym);
        }
    }

    return selectedSynonyms;
}

/* --------- END OF SYNONYMS FUNCTIONS HERE ---------- */


/* --------- ANTONYMS FUNCTIONS HERE ---------- */

// ANTONYMS OF RANDOM WORD FUNCTION
async function getAntonyms(word) {
    const response = await fetch(
        `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}` // use of api
    );

    const data = await response.json();

    // returning only the words
    const antonyms = data.map(item => item.word);
    return antonyms;
}

// ANTONYM FILLER
function getAntonymFillers(count) {
    const selectedAntonyms = [];
    while (selectedAntonyms.length < count) {
        const randomIndex = Math.floor(Math.random() * intermediateWords.length);
        const randomAntonym = intermediateWords[randomIndex];
        if (!selectedAntonyms.includes(randomAntonym)) {
            selectedAntonyms.push(randomAntonym)
        }
    }
    return selectedAntonyms;
}

// FILLING THE ANTONYMS ARRAY WITH 4 WORDS FUNCTION
async function getEnoughAntonyms(word, count) {
    const antonymsSelection = await getAntonyms(word);
    const antonymsArray = [...antonymsSelection];

    if (antonymsArray.length < count) {
        const missing = count - antonymsArray.length;

        const fillerAntonym = getAntonymFillers(missing);
        const finalAntonyms = [...antonymsArray, ...fillerAntonym];

        return finalAntonyms;
    }
    return antonymsArray;
}

/* --------- END OF ANTONYMS FUNCTIONS HERE ---------- */


/* --------- SHUFFLE FUNCTION HERE ---------- */

// COMBINING SELECTED SYNONYMS AND ANTONYMS THEN RUMBLE ARRANGEMENT FUNCTION
function rumbleSynonymsAntonyms(correct, wrong) {
    // combining synonyms and antonyms together
    const optionWords = [...correct, ...wrong];

    // shuffling synonyms and antonyms
    const shuffleOptions = [...optionWords].sort(() => Math.random() - 0.5);

    return shuffleOptions;
}

/* --------- END OF SHUFFLE FUNCTION HERE ---------- */



/*  CALLING FUNCTIONS HERE  */

// displaying the picked word here
const questionWord = document.querySelector("#question-word");

async function startGame() {
    const randomWord = getRandomWord();
    console.log("Random word:", randomWord);
    questionWord.textContent = `"${randomWord.toUpperCase()}"`;

    // showing selected synonyms
    const listOfSynonyms = await getSynonymsWithCount(randomWord, 2);
    const rightAsnwers = await getRandomSynonyms(listOfSynonyms, 2);
    console.log(rightAsnwers); //for deletion

    // showing selected antonyms
    const wrongAnswers = await getEnoughAntonyms(randomWord, 4);
    console.log(wrongAnswers); // for deletion

    //randomizer
    console.log(rumbleSynonymsAntonyms(rightAsnwers, wrongAnswers));
}

const pickWordButton = document.querySelector("#pick-word");
pickWordButton.addEventListener("click", function() {
    startGame();
});

// container for html for creating container for choices
const wordOptions = document.querySelector("#word-options");
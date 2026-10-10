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
async function getSynonymsWithCount(word, count) {
    let synonyms = await getSynonyms(word);

    // if SYNONYMS LESS THAN NEEDED number
    if (synonyms.length < count) {
        const newRandomWord = getRandomWord();

        synonyms = await getSynonyms(newRandomWord);
        // console.log("New random word:", newRandomWord);

        // run synonyms function again to get the synonyms of the new random word
        getSynonyms(newRandomWord).then(newSynonyms => {
            // console.log("Synonyms for", newRandomWord, "are:", newSynonyms);
            if (newSynonyms.length < count) {
                getSynonymsWithCount(newRandomWord, count);
            } else {
                synonyms = newSynonyms;
                // console.log("Final synonyms for newWord:", newRandomWord, "are:", synonyms);
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
function getAntonymFillers(count, excludeWords = []) {
    const selectedAntonyms = [];

    const availableWords = intermediateWords.filter(
        word => !excludeWords.includes(word)
    );


    while (selectedAntonyms.length < count && selectedAntonyms.length < availableWords.length) {
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const randomAntonym = availableWords[randomIndex];
        if (!selectedAntonyms.includes(randomAntonym)) {
            selectedAntonyms.push(randomAntonym)
        }
    }
    return selectedAntonyms;
}

// FILLING THE ANTONYMS ARRAY WITH 4 WORDS FUNCTION
async function getEnoughAntonyms(word, count) {
    const antonymsSelection = await getAntonyms(word);

    // remove duplicates and exclude original word
    const antonymsArray = [...new Set(antonymsSelection)].filter(antonym => antonym.toLowerCase() !== word.toLowerCase()).slice(0, count);



    if (antonymsArray.length < count) {
        const missing = count - antonymsArray.length;

        const fillerAntonym = getAntonymFillers(missing, [word, ...antonymsArray]);
        return [...antonymsArray, ...fillerAntonym];

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


/* --------- CHECKER FUNCTION HERE ---------- */
function checkAnswer(selectedWords, correctAnswers) {
    const feedback = document.querySelector("#answer-feedback");

    // clear previous feedback
    feedback.innerHTML = "";

    // feedback
    selectedWords.forEach(word => {
        const result = document.createElement("p");
        result.classList.add("answer-result");
        if (correctAnswers.includes(word)){
            result.textContent = `${word} — Correct! ✓`;
            result.style.color = "green";
        } else {
            result.textContent = `${word} — Incorrect ✗`;
            result.style.color = "red";
        }

        feedback.appendChild(result);
    });

    // to show the player the correct answers
    const missedAnswers = correctAnswers.filter(
        word => !selectedWords.includes(word)
    );

    if (missedAnswers.length > 0) {
        const missedHeading = document.createElement("p");
        missedHeading.textContent = "Correct answer you missed:";
        feedback.appendChild(missedHeading);

        missedAnswers.forEach(word => {
            const missedWord = document.createElement("p");
            missedWord.textContent = `${word} — Missed answer`;
            missedWord.style.color = "blue";

            feedback.appendChild(missedWord);
        })
    }

}
/* --------- END OF CHECKER FUNCTION HERE ---------- */


/*  CALLING FUNCTIONS HERE  */

// displaying the picked word here
const questionWord = document.querySelector("#question-word");

// storage for player answer
let selectedWords = [];

// for sentence creation
let currentCorrectAnswers = [];

async function startGame() {
    const randomWord = getRandomWord();
    
    // hiding start of game button
    const pickWord = document.querySelector("#pick-word");
    pickWord.hidden = true;

    // showing question section
    const questionScreen = document.querySelector("#question-screen");
    questionScreen.hidden = false;

    questionWord.textContent = `"${randomWord.toUpperCase()}"`;

    // showing selected synonyms
    const listOfSynonyms = await getSynonymsWithCount(randomWord, 2);
    const rightAsnwers = await getRandomSynonyms(listOfSynonyms, 2);
    currentCorrectAnswers = rightAsnwers;


    // showing selected antonyms
    const wrongAnswers = await getEnoughAntonyms(randomWord, 4);

    //randomizer
    const choices = rumbleSynonymsAntonyms(rightAsnwers, wrongAnswers);

    // container for html for creating container for choices
    const wordOptions = document.querySelector("#word-options");
    wordOptions.innerHTML = "";

    // showing each choice in a button
    choices.forEach(choice => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice;

        //change button when selected
        button.addEventListener("click", function(){

            // limiting the selected word into 2
            if (selectedWords.includes(choice)) {
                selectedWords = selectedWords.filter(word => word !== choice);
                button.classList.remove("selected");
            } else if (selectedWords.length < 2) {
                selectedWords.push(choice);
                button.classList.add("selected");
            }
        }
    );

        wordOptions.appendChild(button);
    });

    //checker
    const submitButton = document.querySelector("#submit-answer");
    const continueButton = document.querySelector("#continue-button");

    continueButton.hidden = true;
    submitButton.disabled = false;

    submitButton.onclick = function() {
        checkAnswer(selectedWords, rightAsnwers);

        // disable all answers button after submission
        const answerButtons = wordOptions.querySelectorAll("button");

        answerButtons.forEach(button => {
            button.hidden = true;
        });

        // hide instruction
        const instruction = document.querySelector("#instruction");
        instruction.hidden = true;

        // disable submit
        submitButton.hidden = true;

        // enable continue
        continueButton.hidden = false;
    };

}

// button for starting the game
const pickWordButton = document.querySelector("#pick-word");
pickWordButton.addEventListener("click", function() {
    startGame();
});

// button for sentence creation
const continueButton = document.querySelector("#continue-button");

continueButton.addEventListener("click", function() {
    document.querySelector("#question-screen").hidden = true;
    document.querySelector("#sentence-screen").hidden = false;

    const wordOne = currentCorrectAnswers[0];
    const wordTwo = currentCorrectAnswers[1];

    document.querySelector("#sentence-instruction").textContent = `Create a sentence for ${wordOne} and ${wordTwo} in their respective boxed below.`;

    // Update the first sentence box
    document.querySelector("#sentence-label-one").textContent =
        `Sentence 1 — ${wordOne}`;

    document.querySelector("#sentence-one").placeholder =
        `Write a sentence using ${wordOne}...`;

    // Update the second sentence box
    document.querySelector("#sentence-label-two").textContent =
        `Sentence 2 — ${wordTwo}`;

    document.querySelector("#sentence-two").placeholder =
        `Write a sentence using ${wordTwo}...`;

    // hiding continue button for sentence creation
    continueButton.hidden = true;

    // hiding feedback
    document.querySelector("#answer-feedback").hidden = true;

    // showing continue for sentence checking part
    document.querySelector("#continue-sentence-button").hidden = false;


});
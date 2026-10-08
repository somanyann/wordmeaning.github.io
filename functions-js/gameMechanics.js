console.log("JavaScript file loaded!");

// list of intermediate words
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


// SYNONYMS OF RANDOM WORD FUNCTION
async function getSynonyms(word) {
    const response = await fetch(
        `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}` // use of api
    );

    const data = await response.json();

    // returning only the words
    synonyms = data.map(item => item.word);
    return synonyms;
}


// ANTONYMS OF RANDOM WORD FUNCTION
async function getAntonyms(word) {
    const response = await fetch(
        `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}` // use of api
    );

    const data = await response.json();

    // returning only the words
    antonyms = data.map(item => item.word);
    return antonyms;
}


/* VERIFYING OF SYNONYMS COUNT FUNCTION 
    - this function dictates if a new word will be selected and give the corresponding synonyms of the new word
    - result of this is the synonyms
    - point of selection, not yet the function for selecting the correct words
*/
function getSynonymsWithCount(word, count) {
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
        /*
        const finalWord = getSynonyms(word).then(finalSynonyms => {
            console.log("Final synonyms for", word, "are:", finalSynonyms);
            return finalSynonyms;
        });
        */

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


// ANTONYM FILLER
function getAntonymFillers(word, count) {
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
    const antonymsArray = await antonyms;

    if (antonymsArray.length < count) {
        const missing = count - antonymsArray.length;

        const fillerAntonym = getAntonymFillers(intermediateWords, missing);
        const finalAntonyms = [...antonymsArray, ...fillerAntonym];

        console.log("Final antonyms:", finalAntonyms);

        return finalAntonyms
    }
    return antonymsArray;
}


// COMBINING SELECTED SYNONYMS AND ANTONYMS THEN RUMBLE ARRANGEMENT FUNCTION
function rumbleSynonymsAntonyms(correctAnswers, wrongAnswers) {
    correctAnswers = correctSynonyms;
    wrongAnswers = finalAntonyms;

    // combining synonyms and antonyms together
    const optionWords = [...correctAnswers, ...wrongAnswers];

    // shuffling synonyms and antonyms
    const shuffleOptions = [...optionWords].sort(() => Math.random() - 0.5);


    /*
    for (let word = 0; word < shuffleOptions.length; word++) {
        console.log(shuffleOptions[word]);
    }
    */

    return shuffleOptions;
}


// calling all the choices and creating a button for each word
const choices = rumbleSynonymsAntonyms(finalSynonyms, finalAntonyms);

// GET THE ANSWER (WORDS) FUNCTION
const selectedWords = [];

choices.forEach(choice => {
    
    //creating of button for each choice
    const button = document.createElement("button");
    button.textContent = choice;

    // code to check if the answer is correct
    button.dataset.word = choice;
    // LIMITING THE USER TO CHOOSE 2 WORDS
    button.addEventListener("click", function() {
    if (!selectedWords.includes(choice) && selectedWords.length < 2) {
        selectedWords.push(choice);
        button.classList.add("selected");
    }
});

    wordOptions.appendChild(button);
});


// VERIIFY IF THE SELECTED WORDS ARE CORRECT FUNCTION --incorrect undefined daw yung words variable
function checker() {
    for (let word of selectedWords) {
        if (correctSynonyms.includes(word)) {
            console.log("Correct:", word);
        } else {
            console.log("Incorrect:", word);
        }
    }
}




/*           START OF THE GAME        */

async function startGame() {
    const randomWord = getRandomWord();
    console.log("Random word:", randomWord);
}

const pickWordButton = document.querySelector("#pick-word");
pickWordButton.addEventListener("click", function() {
    startGame();
});

// container for html for creating container for choices
const wordOptions = document.querySelector("#word-options");

const submitButton = document.querySelector("#submit-answer");
submitButton.addEventListener("click", function() {
    checker();
});
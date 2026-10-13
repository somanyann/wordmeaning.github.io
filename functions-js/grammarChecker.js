
/* ------ CHECK WHETHER THE CORRECT SYNONYM IS USED ------ */

function checkWordUsage(sentence, expectedWord) {
    // Convert the sentence into lowercase words.
    const words = sentence.toLowerCase().match(/\b[\w'-]+\b/g) || [];

    // Convert the expected synonym into lowercase.
    const targetWord = expectedWord.toLowerCase();

    // Check whether the expected word appears in the sentence.
    const wordIsUsed = words.includes(targetWord);

    return {
        expectedWord: expectedWord,
        wordIsUsed: wordIsUsed
    };
}



/* ------ THIS FUNCTION CHECK PLAYER SENTENCES GRAMMAR --------- */

async function checkGrammar(sentence) {
    const formData = new URLSearchParams();

    formData.append("text", sentence);
    formData.append("language", "en-US");

    const response = await fetch(
        "https://api.languagetool.org/v2/check",
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error("Grammar check request failed.");
    }

    const data = await response.json();

    return data.matches;
}


/* ------ CHECK SYNONYM MEANING IN CONTEXT WITH GEMINI ------ */

async function checkMeaningInContext(targetWord, assignedSynonym, sentence) {
    const response = await fetch(
        "https://onching-word-usage.maryanngutierrez1998.workers.dev/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                targetWord: targetWord,
                assignedSynonym: assignedSynonym,
                sentence: sentence
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "The vocabulary evaluator is unavailable."
        );
    }

    return data.feedback;
}



/* --- CALLING FUNCTION --- */


/* ------ CHECK STUDENT SENTENCES ------ */

const checkSentencesButton = document.getElementById(
    "check-sentences-button"
);

const sentenceFeedback = document.getElementById(
    "sentence-feedback"
);

checkSentencesButton.addEventListener("click", async function () {
    const sentenceOne = document.getElementById("sentence-one").value.trim();
    const sentenceTwo = document.getElementById("sentence-two").value.trim();

    sentenceFeedback.replaceChildren();

    // Check that the student completed both sentences.
    /* FIRST OPTION
    if (!sentenceOne || !sentenceTwo) {
        
        sentenceFeedback.textContent =
            "Please complete both sentences first.";
        return;
        
    }
    */

    // SECOND OPTION
    const sentenceWarning = document.querySelector("#sentence-warning");
    const closeWarningButton = document.querySelector("#close-sentence-warning");

    closeWarningButton.addEventListener("click", () => {
        sentenceWarning.hidden = true;
    });

    if (!sentenceOne.trim() || !sentenceTwo.trim()) {
        sentenceWarning.hidden = false;
        sentenceWarning.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        return;
    }

    sentenceWarning.hidden = true;


    // Check that the game has the words needed for evaluation.
    if (
        !currentTargetWord ||
        !currentCorrectAnswers[0] ||
        !currentCorrectAnswers[1]
    ) {
        sentenceFeedback.textContent =
            "The vocabulary question is missing information. Please start a new question.";
        return;
    }

    checkSentencesButton.disabled = true;
    checkSentencesButton.textContent = "Checking...";

    try {
        // Run grammar and vocabulary checks for both sentences.
        const [
            grammarOne,
            grammarTwo,
            meaningOne,
            meaningTwo
        ] = await Promise.all([
            checkGrammar(sentenceOne),
            checkGrammar(sentenceTwo),

            checkMeaningInContext(
                currentTargetWord,
                currentCorrectAnswers[0],
                sentenceOne
            ),

            checkMeaningInContext(
                currentTargetWord,
                currentCorrectAnswers[1],
                sentenceTwo
            )
        ]);

        const grammarResults = [grammarOne, grammarTwo];
        const meaningResults = [meaningOne, meaningTwo];

        // Display the feedback for each sentence.
        grammarResults.forEach((issues, index) => {
            const heading = document.createElement("h5");
            heading.textContent = `Sentence ${index + 1}`;
            sentenceFeedback.appendChild(heading);

            const grammarHeading = document.createElement("h6");
            grammarHeading.textContent = "Grammar Feedback";
            sentenceFeedback.appendChild(grammarHeading);

            if (issues.length === 0) {
                const message = document.createElement("p");
                message.textContent = "No grammar issues detected.";
                sentenceFeedback.appendChild(message);
            } else {
                issues.forEach(issue => {
                    const message = document.createElement("p");
                    message.className = "text-danger";
                    message.textContent = issue.message;
                    sentenceFeedback.appendChild(message);

                    if (issue.replacements.length > 0) {
                        const suggestion = document.createElement("p");
                        suggestion.className = "text-success";

                        suggestion.textContent =
                            "Suggestion: " +
                            issue.replacements
                                .slice(0, 3)
                                .map(item => item.value)
                                .join(", ");

                        sentenceFeedback.appendChild(suggestion);
                    }
                });
            }

            // Display Gemini's evaluation separately.
            const meaningHeading = document.createElement("h6");
            meaningHeading.textContent = "Vocabulary Usage Feedback";
            sentenceFeedback.appendChild(meaningHeading);

            const meaningMessage = document.createElement("p");

            // Remove simple Markdown bold markers from Gemini's response.
            meaningMessage.textContent = meaningResults[index]
                .replace(/\*\*/g, "");

            sentenceFeedback.appendChild(meaningMessage);
        });

    } catch (error) {
        console.error("Sentence evaluation error:", error);

        sentenceFeedback.textContent =
            error.message ||
            "Sorry, the sentence checker is unavailable. Please try again.";
    } finally {
        checkSentencesButton.hidden = true;
        checkSentencesButton.textContent = "Check My Grammar";
        document.querySelector("#check-sentences-instruction").hidden = true;
    }
});
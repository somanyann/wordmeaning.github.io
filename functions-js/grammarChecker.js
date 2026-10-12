
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


/* --- CALLING FUNCTION --- */

const checkSentencesButton = document.getElementById(
    "check-sentences-button"
);

const sentenceFeedback = document.getElementById(
    "sentence-feedback"
);

checkSentencesButton.addEventListener("click", async function () {
    const sentenceOne = document.getElementById("sentence-one").value.trim();
    const sentenceTwo = document.getElementById("sentence-two").value.trim();

    const wordUsageResults = [
    checkWordUsage(sentenceOne, currentCorrectAnswers[0]),
    checkWordUsage(sentenceTwo, currentCorrectAnswers[1])
    ];

    sentenceFeedback.replaceChildren();

    if (!sentenceOne || !sentenceTwo) {
        sentenceFeedback.textContent = "Please complete both sentences first.";
        return;
    }

    checkSentencesButton.disabled = true;
    checkSentencesButton.textContent = "Checking...";

    try {
        const results = await Promise.all([
            checkGrammar(sentenceOne),
            checkGrammar(sentenceTwo)
        ]);

        results.forEach((issues, index) => {
            const heading = document.createElement("h5");
            heading.textContent = `Sentence ${index + 1}`;

            sentenceFeedback.appendChild(heading);

            if (issues.length === 0) {
                const message = document.createElement("p");
                message.textContent = "No grammar issues detected.";
                sentenceFeedback.appendChild(message);
                return;
            }

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

        const usageHeading = document.createElement("h4");
        usageHeading.textContent = "Word Usage Feedback";
        sentenceFeedback.appendChild(usageHeading);

        wordUsageResults.forEach((result, index) => {
            const message = document.createElement("p");

            if (result.wordIsUsed) {
                message.className = "text-success";
                message.textContent =
                    `Sentence ${index + 1}: Your sentence contains the expected synonym "${result.expectedWord}".`;
            } else {
                message.className = "text-danger";
                message.textContent =
                    `Sentence ${index + 1}: Please use the word "${result.expectedWord}" in your sentence.`;
            }

            sentenceFeedback.appendChild(message);
        });

        });

    } catch (error) {
        console.error(error);
        sentenceFeedback.textContent =
            "Sorry, the grammar checker is unavailable. Please try again.";
    } finally {
        checkSentencesButton.disabled = false;
        checkSentencesButton.textContent = "Check My Grammar";
    }
});

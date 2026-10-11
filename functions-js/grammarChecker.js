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

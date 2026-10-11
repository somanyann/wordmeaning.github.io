
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

    console.log("Grammar issues:", data.matches);

    return data.matches;
}

// Test sentence
checkGrammar("She go to school yesterday.")
    .then(matches => {
        console.log("Number of issues:", matches.length);
    })
    .catch(error => {
        console.error("Error:", error);
    });

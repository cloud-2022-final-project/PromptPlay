/**
 * Sends a prompt to ChatGPT and returns the generated response.
 * @param prompt The prompt to send to ChatGPT.
 */
const send = async (prompt: string) => {
    // TODO: Implement this function.
    return 'This is a mock generated prompt.';
};

export const ChatGPT = {
    randomPrompt: () => {
        const choices = [
            'funny 8-word image',
            'cool 8-word image',
            'creative 8-word image',
            'creepy 8-word image',
        ];
        const selected = choices[Math.floor(Math.random() * choices.length)];
        return send(selected);
    },
    hint: (truePrompt: string) =>
        send(
            `"${truePrompt}" This sentence is meant for other people to guess. Give a long difficult hint. Don't directly mention the nouns in the sentence and use other alternatives of verbs. Emojis as the entire hint at the end.`
        ),
};

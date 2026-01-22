import { useState, useEffect } from "react";

export const useTypewriter = (
    phrases: string[],
    typingSpeed = 50,
    deletingSpeed = 30,
    pauseDuration = 2000
) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        const currentPhrase = phrases[phraseIndex % phrases.length];

        const handleTyping = () => {
            setDisplayedText((prev) => {
                if (isDeleting) {
                    return currentPhrase.substring(0, prev.length - 1);
                } else {
                    return currentPhrase.substring(0, prev.length + 1);
                }
            });
        };

        let timer: NodeJS.Timeout;

        if (!isDeleting && displayedText === currentPhrase) {
            // Finished typing the phrase, wait before deleting
            timer = setTimeout(() => setIsDeleting(true), pauseDuration);
        } else if (isDeleting && displayedText === "") {
            // Finished deleting, switch to next phrase
            setIsDeleting(false);
            setPhraseIndex((prev) => prev + 1);
            timer = setTimeout(handleTyping, 500); // slight pause before new typing
        } else {
            // Typing or deleting
            const speed = isDeleting ? deletingSpeed : typingSpeed;
            timer = setTimeout(handleTyping, speed);
        }

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

    return displayedText;
};

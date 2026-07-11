import confetti from "canvas-confetti";

/**
 * Big celebration for completing a bucket list goal — a mix of heart and
 * sparkle emoji confetti in the app's candy/periwinkle/sunbeam palette.
 */
export function fireGoalCompleteConfetti() {
  const heart = confetti.shapeFromText({ text: "💗", scalar: 2 });
  const sparkle = confetti.shapeFromText({ text: "✨", scalar: 1.8 });

  confetti({
    particleCount: 40,
    spread: 70,
    origin: { y: 0.65 },
    shapes: [heart, sparkle],
    scalar: 1,
    gravity: 0.7,
    ticks: 200,
  });

  confetti({
    particleCount: 20,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    shapes: [heart],
  });

  confetti({
    particleCount: 20,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    shapes: [heart],
  });
}

/** Smaller pop for a pet level-up. */
export function firePetLevelUpConfetti() {
  const sparkle = confetti.shapeFromText({ text: "⭐️", scalar: 1.6 });
  confetti({
    particleCount: 30,
    spread: 100,
    origin: { y: 0.4 },
    shapes: [sparkle],
    gravity: 0.5,
    ticks: 150,
  });
}

export default function Title() {
  const $title = document.createElement("div");
  $title.classList.add("title");
  let letters = "PONG PONG PING PONG".split("");

  letters.forEach((letter, i) => {
    const $letter = document.createElement("span");
    $letter.classList.add("letter");
    if ((i >= 4 && i <= 8) || (i >= 15 && i <= 19)) {
      $letter.classList.add("white");
    }
    $letter.textContent = letter;
    $letter.style.animationDelay = `${i / 10}s`;
    $title.appendChild($letter);
  });

  return $title;
}

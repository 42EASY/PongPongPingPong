import confetti from "https://cdn.skypack.dev/canvas-confetti";

export default function EndConfetti() {
  const $app = document.querySelector(".App");

  let lastCallTime = performance.now(); // 마지막 호출 시간
  const callInterval = 200; // 호출 간격

  const doItNow = (evt, hard) => {
    const currentTime = performance.now();
    if (currentTime - lastCallTime < callInterval) return;
    lastCallTime = currentTime;
    const direction = Math.sign(lastX - evt.clientX);
    lastX = evt.clientX;
    const particleCount = hard ? r(122, 300) : r(40, 50);
    confetti({
      particleCount,
      angle: r(90, 90 + direction * 30),
      spread: r(60, 80),
      origin: {
        x: evt.clientX / window.innerWidth,
        y: evt.clientY / window.innerHeight,
      },
    });
  };
  console.log(confetti);
  const doIt = (evt) => {
    doItNow(evt, false);
  };

  const doItHard = (evt) => {
    doItNow(evt, true);
  };

  let lastX = 0;
  $app.addEventListener("mousemove", doIt);
  $app.addEventListener("click", doItHard);

  function r(mi, ma) {
    return parseInt(Math.random() * (ma - mi) + mi);
  }

  setTimeout(function () {
    $app.removeEventListener("mousemove", doIt);
    $app.removeEventListener("click", doItHard);
  }, 5000);
}

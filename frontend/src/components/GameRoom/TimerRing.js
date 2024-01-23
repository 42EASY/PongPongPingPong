export default function TimerRing(second) {
  const $timerRingWrapper = document.createElement("div");
  $timerRingWrapper.classList.add("timerWrapper");

  const $timerRing = document.createElement("div");
  $timerRing.classList.add("timerRing");

  const $timerCnt = document.createElement("div");
  $timerCnt.classList.add("timerCnt");
  $timerCnt.innerHTML = second;

  $timerRingWrapper.appendChild($timerRing);
  $timerRingWrapper.appendChild($timerCnt);

  let time = setInterval(() => {
    $timerCnt.innerHTML = --second;
    console.log(second);
    if (second <= 0) clearInterval(time);
  }, 1000);

  return $timerRingWrapper;
}

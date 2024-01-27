export default function TimerRing() {
  const $timerRingWrapper = document.createElement("div");
  $timerRingWrapper.classList.add("timerWrapper");

  const $timerRing = document.createElement("div");
  $timerRing.classList.add("timerRing");

  const $timerCnt = document.createElement("div");
  $timerCnt.classList.add("timerCnt");

  $timerRingWrapper.appendChild($timerRing);
  $timerRingWrapper.appendChild($timerCnt);

  return $timerRingWrapper;
}

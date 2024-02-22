export const startCount = (container, sec) => {
  let intervalId;
  if (intervalId) clearInterval(intervalId);
  const $timerCnt = container.querySelector(".timerCnt");
  $timerCnt.innerHTML = sec;
  intervalId = setInterval(() => {
    sec--;
    $timerCnt.innerHTML = sec;
    if (sec === 0) {
      clearInterval(intervalId);
      return true;
    }
  }, 1000);
};

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

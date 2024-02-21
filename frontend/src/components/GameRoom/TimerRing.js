let intervalId;

export const startCount = async () => {
  let sec = 60;
  if (intervalId) clearInterval(intervalId);
  const $timerCnt = document.getElementsByClassName("timerCnt");
  setInterval(() => {
    if (sec === 0) {
      clearInterval(intervalId);
      return;
    }
    sec--;
    $timerCnt.innerHTML = sec.toString();
    console.log(sec);
  }, 1000);
};

export default function TimerRing() {
  const $timerRingWrapper = document.createElement("div");
  $timerRingWrapper.classList.add("timerWrapper");

  const $timerRing = document.createElement("div");
  $timerRing.classList.add("timerRing");

  const $timerCnt = document.createElement("div");
  $timerCnt.classList.add("timerCnt");
  $timerCnt.innerHTML = "60";
  $timerRingWrapper.appendChild($timerRing);
  $timerRingWrapper.appendChild($timerCnt);

  return $timerRingWrapper;
}

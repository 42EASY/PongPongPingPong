export default function PercentBar({ win, lose }) {
  const $BarWrapper = document.createElement("div");
  const $winBar = document.createElement("div");
  const $loseBar = document.createElement("div");
  $winBar.className = "percentageBar";
  $loseBar.className = "percentageBar";
  $BarWrapper.id = "percentageBarWrapper";
  $winBar.id = "percentageBarWin";
  $loseBar.id = "percentageBarLose";
  $BarWrapper.appendChild($winBar);
  $BarWrapper.appendChild($loseBar);

  $winBar.style.width = win + "%";
  $loseBar.style.width = lose + "%";
  $winBar.innerHTML = win.toString() + "%";
  $loseBar.innerHTML = lose.toString() + "%";

  return $BarWrapper;
}

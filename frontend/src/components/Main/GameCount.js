export default function GameCount({ total, win, lose }) {
  const $GameCountWrapper = document.createElement("div");
  const $GameCountTotal = document.createElement("div");
  const $GameCountWin = document.createElement("div");
  const $GameCountLose = document.createElement("div");

  $GameCountWrapper.id = "gameCountWrapper";
  $GameCountWrapper.appendChild($GameCountTotal);
  $GameCountWrapper.appendChild($GameCountWin);
  $GameCountWrapper.appendChild($GameCountLose);
  $GameCountTotal.innerHTML = total + " 경기";
  $GameCountWin.innerHTML = win + " 승리";
  $GameCountLose.innerHTML = lose + " 패배";

  return $GameCountWrapper;
}

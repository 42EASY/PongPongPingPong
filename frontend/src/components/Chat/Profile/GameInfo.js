import GameCount from "../../Main/GameCount.js";
import PercentBar from "../../GameRoom/PercentBar.js";

export default function GameInfo() {
  const $GameInfoWrapper = document.createElement("div");
  $GameInfoWrapper.classList.add("GameInfoWrapper");

  const $GameInfoTitle = document.createElement("div");
  $GameInfoTitle.classList.add("contactInfoTitle");
  $GameInfoTitle.innerHTML = "전적 정보";

  const $gameCount = GameCount({ total: 42, win: 42, lose: 42 });
  const $percentBar = PercentBar({ win: 25, lose: 75 });

  $GameInfoWrapper.appendChild($GameInfoTitle);
  $GameInfoWrapper.appendChild($gameCount);
  $GameInfoWrapper.appendChild($percentBar);

  return $GameInfoWrapper;
}

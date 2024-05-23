import GameCount from "../../Main/GameCount.js";
import PercentBar from "../../GameRoom/PercentBar.js";

export default function GameInfo(user) {
  const $GameInfoWrapper = document.createElement("div");
  $GameInfoWrapper.classList.add("GameInfoWrapper");

  const $GameInfoTitle = document.createElement("div");
  $GameInfoTitle.classList.add("contactInfoTitle");
  $GameInfoTitle.innerHTML = "전적 정보";

  const $gameCount = GameCount({
    total: user.game_count,
    win: user.win_count,
    lose: user.lose_count,
  });
  const $percentBar = PercentBar({
    win: user.win_count,
    lose: user.lose_count,
  });

  $GameInfoWrapper.appendChild($GameInfoTitle);
  $GameInfoWrapper.appendChild($gameCount);
  $GameInfoWrapper.appendChild($percentBar);

  return $GameInfoWrapper;
}

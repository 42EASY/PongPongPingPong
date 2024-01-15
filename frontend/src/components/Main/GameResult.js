export default function GameResult(data) {
  const $ResultWrapper = document.createElement("div");
  const $ResultMark = document.createElement("div");

  const $ResultInfoBox = document.createElement("div");
  const $ResultInfoOption = document.createElement("div");
  const $ResultInfoDate = document.createElement("div");
  const $ResultInfoDivLine = document.createElement("div");
  const $ResultInfoResult = document.createElement("div");
  const $ResultInfoPlaytime = document.createElement("div");

  const $ResultPlayerBox = document.createElement("div");
  const $ResultPlayer1Name = document.createElement("div");
  const $ResultPlayer1ImageBox = document.createElement("div");
  const $ResultPlayer1Image = document.createElement("img");
  const $ResultPlayerScore = document.createElement("div");
  const $ResultPlayer2ImageBox = document.createElement("div");
  const $ResultPlayer2Image = document.createElement("img");
  const $ResultPlayer2Name = document.createElement("div");

  $ResultWrapper.appendChild($ResultMark);
  $ResultWrapper.appendChild($ResultInfoBox);
  $ResultWrapper.appendChild($ResultPlayerBox);

  $ResultInfoBox.appendChild($ResultInfoOption);
  $ResultInfoBox.appendChild($ResultInfoDate);
  $ResultInfoBox.appendChild($ResultInfoDivLine);
  $ResultInfoBox.appendChild($ResultInfoResult);
  $ResultInfoBox.appendChild($ResultInfoPlaytime);

  $ResultPlayerBox.appendChild($ResultPlayer1Name);
  $ResultPlayerBox.appendChild($ResultPlayer1ImageBox);
  $ResultPlayer1ImageBox.appendChild($ResultPlayer1Image);
  $ResultPlayerBox.appendChild($ResultPlayerScore);
  $ResultPlayerBox.appendChild($ResultPlayer2ImageBox);
  $ResultPlayer2ImageBox.appendChild($ResultPlayer2Image);
  $ResultPlayerBox.appendChild($ResultPlayer2Name);

  $ResultWrapper.classList.add("resultWrapper");
  $ResultMark.classList.add("resultMark");
  $ResultInfoBox.classList.add("resultInfoBox");
  $ResultPlayerBox.classList.add("resultPlayerBox");

  $ResultInfoOption.classList.add("resultInfoBold");
  $ResultInfoOption.innerHTML = data.option;
  const date = data.game_date.split("-");
  $ResultInfoDate.innerHTML = `${date[0][2]}${date[0][3]}.${date[1]}.${date[2]}`;
  $ResultInfoDivLine.classList.add("divLine");
  if (data.result == "WIN") {
    $ResultInfoResult.innerHTML = "승리";
  } else {
    $ResultWrapper.classList.add("resultWrapperLose");
    $ResultMark.classList.add("resultMarkLose");
    $ResultInfoResult.innerHTML = "패배";
  }
  $ResultInfoResult.classList.add("resultInfoBold");
  const time = data.playtime.split("-");
  $ResultInfoPlaytime.innerHTML = `${time[0]}:${time[1]}'`;

  $ResultPlayer1Name.classList.add("resultPlayerName");
  $ResultPlayer1Name.classList.add("resultPlayer1Name");
  $ResultPlayer1Name.innerHTML = data.player_one.nickname;
  $ResultPlayer1ImageBox.classList.add("resultPlayerImageBox");
  $ResultPlayer1Image.classList.add("resultPlayerImage");
  $ResultPlayer1Image.setAttribute("src", data.player_one.image_url);
  $ResultPlayer1Image.setAttribute("alt", "player_one_image");
  $ResultPlayerScore.classList.add("resultPlayerScore");
  const score = `${data.player_one.score} - ${data.player_two.score}`;
  $ResultPlayerScore.innerHTML = score;
  $ResultPlayer2Name.classList.add("resultPlayerName");
  $ResultPlayer2Name.innerHTML = data.player_two.nickname;
  $ResultPlayer2ImageBox.classList.add("resultPlayerImageBox");
  $ResultPlayer2Image.classList.add("resultPlayerImage");
  $ResultPlayer2Image.setAttribute("src", data.player_two.image_url);
  $ResultPlayer2Image.setAttribute("alt", "player_two_image");

  return $ResultWrapper;
}

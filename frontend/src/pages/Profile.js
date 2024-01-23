import Title from "../components/Chat/Profile/Title.js";
import Info from "../components/Chat/Profile/Info.js";
import GameInfo from "../components/Chat/Profile/GameInfo.js";

export default function Profile() {
  const $chatsWrapper = document.querySelector(".sidebarArea");
  $chatsWrapper.innerHTML = "";

  //타이틀
  const $title = Title();
  $chatsWrapper.appendChild($title);

  //프로필 정보
  const $info = Info();
  $chatsWrapper.appendChild($info);

  //전적 정보
  const $gameInfo = GameInfo();
  $chatsWrapper.appendChild($gameInfo);
}

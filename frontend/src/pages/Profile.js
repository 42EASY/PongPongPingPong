import Title from "../components/Chat/Profile/Title.js";
import Info from "../components/Chat/Profile/Info.js";
import GameInfo from "../components/Chat/Profile/GameInfo.js";
import { getUserInfo } from "../components/Main/UserApi.js";

export default async function Profile(user) {
  const $chatsWrapper = document.querySelector(".sidebarArea");
  $chatsWrapper.innerHTML = "";
  const userInfo = await getUserInfo(user.user_id);

  //타이틀
  const $title = Title(user);
  $chatsWrapper.appendChild($title);

  //프로필 정보
  const $info = await Info(userInfo.result);
  $chatsWrapper.appendChild($info);

  //전적 정보
  const $gameInfo = GameInfo(userInfo.result);
  $chatsWrapper.appendChild($gameInfo);

  window.onload = function () {
    document.body.style.display = "block";
  };
}

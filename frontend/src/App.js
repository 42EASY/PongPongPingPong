import changeUrl from "./Router.js";
import { setNewAccessToken } from "./state/State.js";

//새로고침 시 로그인 연장 처리
window.onload = function () {
  if (
    window.location.pathname !== "/" &&
    window.location.pathname !== "/login/oauth2/code"
  ) {
    setNewAccessToken();
    console.log("Page is loaded");
  }
};

//todo: url 입력으로 넘어가지 않아야 하는 페이지 예외처리 필요
changeUrl(window.location.pathname);

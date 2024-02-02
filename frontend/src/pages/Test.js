export default function Test() {
  const $app = document.querySelector(".App");
  $app.innerHTML = "";

  const $test = document.createElement("div");

  const $test1 = document.createElement("h1");
  $test1.innerHTML = "각자 페이지로 이동합시다";

  const $test2 = document.createElement("button");
  $test2.classList.add("moveToLoginPageBtn");
  $test2.innerHTML = "Go to Login";

  const $test3 = document.createElement("button");
  $test3.classList.add("moveToMainPageBtn");
  $test3.innerHTML = "Go to Main";

  const $test4 = document.createElement("button");
  $test4.classList.add("moveToGamePageBtn");
  $test4.innerHTML = "Go to Game";

  const $test5 = document.createElement("button");
  $test5.classList.add("moveToEndGamePageBtn");
  $test5.innerHTML = "Go to EndGame";

  const $test6 = document.createElement("button");
  $test6.classList.add("moveToGameRoomPageBtn");
  $test6.innerHTML = "Go to GameRoom";

  const $test7 = document.createElement("button");
  $test7.classList.add("modalBtn");
  $test7.innerHTML = "Modal";

  $test.appendChild($test1);
  $test.appendChild($test2);
  $test.appendChild($test3);
  $test.appendChild($test4);
  $test.appendChild($test5);
  $test.appendChild($test6);
  $test.appendChild($test7);
  $app.appendChild($test);
}

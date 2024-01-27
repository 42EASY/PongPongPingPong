export default function NoSearch() {
  const $noSearchWrapper = document.createElement("div");
  $noSearchWrapper.classList.add("noSearchWrapper");

  const $noSearchImage = document.createElement("img");
  $noSearchImage.classList.add("friendImage");
  $noSearchImage.setAttribute("src", "../../images/none_profile.png");
  $noSearchImage.setAttribute("alt", "not_found_friend");

  const $noSearchText = document.createElement("div");
  $noSearchText.classList.add("noSearchText");
  $noSearchText.innerHTML = "일치하는 항목 없음";

  $noSearchWrapper.appendChild($noSearchImage);
  $noSearchWrapper.appendChild($noSearchText);

  return $noSearchWrapper;
}

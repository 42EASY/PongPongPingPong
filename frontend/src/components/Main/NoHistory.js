export default function NoHistory() {
  const $NoHistoryWrapper = document.createElement("div");
  const $NoHistoryIcon = document.createElement("i");
  const $NoHistoryTxt = document.createElement("div");
  const $NoHistorySubTxt = document.createElement("div");

  $NoHistoryWrapper.appendChild($NoHistoryIcon);
  $NoHistoryWrapper.appendChild($NoHistoryTxt);
  $NoHistoryWrapper.appendChild($NoHistorySubTxt);

  $NoHistoryWrapper.classList.add("noHistoryWrapper");
  $NoHistoryIcon.classList.add("bi", "bi-rocket-takeoff", "noHistoryIcon");
  $NoHistoryTxt.innerHTML = "경기 전적이 없습니다";
  $NoHistorySubTxt.classList.add("noHistorySubTxt");
  $NoHistorySubTxt.innerHTML = "경기를 하면 전적이 표시됩니다.";

  return $NoHistoryWrapper;
}

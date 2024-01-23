export default function Search() {
  const $searchWrapper = document.createElement("div");
  $searchWrapper.classList.add("searchWrapper");

  const $search = document.createElement("div");
  $search.classList.add("search");

  const $searchIcon = document.createElement("i");
  $searchIcon.classList.add("bi", "bi-search");

  const $searchInput = document.createElement("input");
  $searchInput.classList.add("searchInput");
  $searchInput.type = "text";
  $searchInput.placeholder = "목록 검색";

  $search.appendChild($searchIcon);
  $search.appendChild($searchInput);
  $searchWrapper.appendChild($search);

  return $searchWrapper;
}

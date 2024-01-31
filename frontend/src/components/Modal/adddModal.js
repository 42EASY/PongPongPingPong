import addContentElement from "./addContent.js";

function addElement(content) {
  const $element = document.createElement(content.type);
  $element.className = content.class;
  if (content.id) $element.id = content.id;
  return $element;
}

export default function addModal(options) {
  console.log("in addModal");
  const $modalOverlay = addElement({
    type: "div",
    class: "modalOverlay close",
  });
  const $modalWrapper = addElement({ type: "div", class: "modalWrapper" });
  const $modalHeader = addElement({ type: "div", class: "modalHeader" });
  const $modalBody = addElement({ type: "div", class: "modalBody" });
  const $modalFooter = addElement({ type: "div", class: "modalFooter" });
  $modalOverlay.appendChild($modalWrapper);
  $modalWrapper.appendChild($modalHeader);
  $modalWrapper.appendChild($modalBody);
  $modalWrapper.appendChild($modalFooter);

  const $modalTitle = addElement({ type: "div", class: "modalTitle" });
  $modalTitle.innerHTML = options.title;
  $modalHeader.appendChild($modalTitle);

  if (options.showCloseButton) {
    $modalHeader.appendChild(
      addElement({
        type: "i",
        class: "close bi bi-x",
        id: "x",
      })
    );
  }
  if (options.bodyContent) {
    for (let i = 0; i < options.bodyContent.length; i++)
      $modalBody.appendChild(addContentElement(options.bodyContent[i]));
  }
  if (options.footerContent) {
    for (let i = 0; i < options.footerContent.length; i++)
      $modalFooter.appendChild(addContentElement(options.footerContent[i]));
  }

  return $modalOverlay;
}

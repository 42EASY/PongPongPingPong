import addContentElement from "./addContent.js";

function addElement(content) {
  const $element = document.createElement(content.type);
  $element.classList.add(content.class);
  return $element;
}

export default function Modal(options) {
  const $modalElement = addElement({ type: "div", class: "modal" }); // tabindex
  const $modalDialog = addElement({ type: "div", class: "modal-dialog" });
  const $modalContent = addElement({ type: "div", class: "modal-content" });
  const $modalHeader = addElement({ type: "h5", class: "modal-header" });
  const $modalBody = addElement({ type: "div", class: "modal-body" });
  const $modalFooter = addElement({ type: "div", class: "modal-footer" });
  $modalElement.appendChild($modalDialog);
  $modalDialog.appendChild($modalContent);
  $modalContent.appendChild($modalHeader);
  $modalContent.appendChild($modalBody);
  $modalContent.appendChild($modalFooter);
  $modalHeader.innerHTML = "header title";
  if (options.xBtn) {
    const $xButton = addElement({ type: "div", class: "btn-close" });
    $xButton.setAttribute("data-bs-dismiss", "modal");
    $xButton.setAttribute("aria-label", "Close");
  }
  if (options.bodyContent) {
    for (var i = 0; i < options.bodyContent.length; i++)
      $modalBody.appendChild(addContentElement(options.bodyContent[i]));
  }
  if (options.footerContent) {
    for (var i = 0; i < options.footerContent.length; i++)
      $modalFooter.appendChild(addContentElement(options.footerContent[i]));
  }

  return $modalElement;
}

/*
{
	title: '친구삭제',
	showCloseButton: true,
	bodyContent: [
		{ type: 'text', text: '이 사용자를 다시 친구 추가할 수 있습니다.'}
	],
	footerContent: [
		{ type: 'button', label: '취소', dismiss: true }, // secondary button임
		{ type: 'button', label: '친구끊기' } // primary button임
	],
}
*/

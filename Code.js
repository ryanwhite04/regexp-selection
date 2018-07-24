function onOpen() {
  DocumentApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('Custom Menu')
      .addItem('Select', 'selectTarget')
      .addItem('Select Markdown', 'selectMarkdown')
      .addToUi();
}

/**
 * Find all matches of target text in current document, and builds range.
 *
 * @param {String} target - (Optional) The text or regex to search for. 
 *                           See Body.findText() for details.
 */
function build(target) {
  var doc = DocumentApp.getActiveDocument();
  var range = doc.newRange();
  var body = doc.getBody();
  var element = body.findText(target);
  while (element) {
    var text = element.getElement().asText();
    range.addElement(text, element.getStartOffset(), element.getEndOffsetInclusive());
    element = body.findText(target, element);
  }
  return range.build();
}

function select(range) {
  range.getRangeElements().length && DocumentApp.getActiveDocument().setSelection(range);
}

function selectTarget(target) {

  if (arguments.length == 0) {
    var ui = DocumentApp.getUi();
    var result = ui.prompt('Text Highlighter', 'Enter text to highlight:', ui.ButtonSet.OK_CANCEL);
    if (result.getSelectedButton() !== ui.Button.OK) return;

    target = result.getResponseText();
  }
  return select(build(target));
}

function selectMarkdown() {
  
  function append(builder, range) {
    return builder.addRange(range);
  }
  
  return select([
    "\{[^\}]+\}", // Markdown Extra Attributes
    "\<[^\>]+\>", // HTML Elements
    "\(https?:\/\/[^)]+\)", // External Links
    "\W+",
  ].map(build).reduce(append, DocumentApp.getActiveDocument().newRange()));
}

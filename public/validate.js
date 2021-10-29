/* eslint-disable no-alert */
function validate() {
  // document.forms.newListForm.preventDefault();
  const input = document.forms.newListForm.newItem.value;
  if (input === '') {
    alert('Please input a Value');
    return false;
  }
  document.forms.newListForm.submit();
  return true;
}

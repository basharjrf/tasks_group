const textInput = document.getElementById('textInput');
const counter = document.getElementById('counter');
const submitBtn = document.getElementById('submitBtn');
textInput.addEventListener('input', () => {
    const textLength = textInput.value.length;
    counter.textContent = `${textLength}/280`;
    if (textLength > 280) {
        textInput.value = textInput.value.substring(0, 280);
        textInput.dispatchEvent(new Event('input'));
        counter.style.color = 'red';
        submitBtn.disabled = true;
        submitBtn.style.color = 'gray';

    } else {
        counter.style.color = 'black';
        submitBtn.disabled = false;
        submitBtn.style.color = 'white';
    }
});

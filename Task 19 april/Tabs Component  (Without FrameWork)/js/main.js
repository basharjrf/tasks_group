const tabButtonsContainer = document.querySelector(".tab-buttons");
const tabContent = document.querySelector(".tab-content");
const tabTitleInput = document.querySelector("#tabTitle");
const tabTextInput = document.querySelector("#tabText");
const addTabButton = document.querySelector("#addTabButton");

function getTabButtons() {
    return document.querySelectorAll(".tab-button");
}

function getTabPanels() {
    return document.querySelectorAll(".tab-panel");
}

function activateTab(index) {
    const tabButtons = getTabButtons();
    const tabPanels = getTabPanels();

    tabButtons.forEach((button) => button.classList.remove("active"));
    tabPanels.forEach((panel) => panel.classList.remove("active"));

    if (tabButtons[index] && tabPanels[index]) {
        tabButtons[index].classList.add("active");
        tabPanels[index].classList.add("active");
    }
}

function bindTabEvents() {
    const tabButtons = getTabButtons();

    tabButtons.forEach((button, index) => {
        button.onclick = () => activateTab(index);
    });
}

function createTab(title, content) {
    const button = document.createElement("button");
    button.className = "tab-button";
    button.type = "button";
    button.textContent = title;

    const panel = document.createElement("div");
    panel.className = "tab-panel";
    panel.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
    `;

    tabButtonsContainer.appendChild(button);
    tabContent.appendChild(panel);

    bindTabEvents();
    activateTab(getTabButtons().length - 1);
}

addTabButton.addEventListener("click", () => {
    const title = tabTitleInput.value.trim();
    const content = tabTextInput.value.trim();

    if (!title || !content) {
        return;
    }

    createTab(title, content);
    tabTitleInput.value = "";
    tabTextInput.value = "";
});

bindTabEvents();

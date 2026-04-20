const rating = document.getElementById("rating");
const stars = document.querySelectorAll(".star");
const ratingText = document.getElementById("rating-text");

let selectedRating = 0;

function getMessage(value) {
    if (value === 0) return "Choose a rating";
    if (value <= 2) return "Poor";
    if (value <= 4) return "Good";
    return "Excellent";
}

function getHalfStarValue(star, event) {
    const rect = star.getBoundingClientRect();
    const starNumber = Number(star.dataset.value);

    return event.clientX - rect.left < rect.width / 2 ? starNumber - 0.5 : starNumber;
}

function paintStars(value) {
    stars.forEach((star, index) => {
        const fill = star.querySelector(".star-fill");
        const starNumber = index + 1;
        let width = 0;

        if (value >= starNumber) {
            width = 100;
        } else if (value === starNumber - 0.5) {
            width = 50;
        }

        fill.style.width = `${width}%`;
    });
}

function showRating(value, isPreview = false) {
    paintStars(value);

    const label = isPreview ? "Preview" : "Selected";
    ratingText.textContent = `${label}: ${value} - ${getMessage(value)}`;
}

stars.forEach((star) => {
    star.addEventListener("mousemove", (event) => {
        showRating(getHalfStarValue(star, event), true);
    });

    star.addEventListener("click", (event) => {
        selectedRating = getHalfStarValue(star, event);
        showRating(selectedRating);
    });
});

rating.addEventListener("mouseleave", () => {
    showRating(selectedRating);
});

showRating(selectedRating);

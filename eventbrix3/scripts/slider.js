// File 3: scripts/slider.js

let slideIndex = 0;

function showSlides() {
  const slides = document.getElementsByClassName("slide");

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.opacity = 0;
  }

  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;

  slides[slideIndex - 1].style.opacity = 1;

  setTimeout(showSlides, 4000);
}

showSlides();
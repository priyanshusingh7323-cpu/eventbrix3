// Smooth UI Script – Premium Pop-In Animations (Zomato/WedMeGood Style)

// 1) PAGE FADE-IN
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.7s ease";
    document.body.style.opacity = "1";
  }, 50);
});

// 2) SMOOTH SCROLL
const html = document.documentElement;
html.style.scrollBehavior = "smooth";

// 3) REVEAL ON SCROLL (Pop-In Sections)
const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
  revealElements.forEach((el) => {
    const position = el.getBoundingClientRect().top;
    const screenHeight = window.innerHeight - 100;

    if (position < screenHeight) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// Auto-apply reveal class to major sections
document.querySelectorAll("section, .card, .box, .vendor-card").forEach(el => {
  el.classList.add("reveal");
});

// 4) CARD HOVER SMOOTH POP EFFECT
document.querySelectorAll(".card, .vendor-card").forEach((card) => {
  card.style.transition = "all 0.25s ease";
  card.addEventListener("mouseenter", () => {
    card.style.transform = "scale(1.03)";
    card.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
    card.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
  });
});

// 5) BUTTON CLICK WAVE EFFECT (Ripple)
document.addEventListener("click", function (e) {
  let target = e.target;
  if (!target.classList.contains("btn")) return;

  const circle = document.createElement("span");
  circle.classList.add("ripple");

  const size = Math.max(target.clientWidth, target.clientHeight);
  circle.style.width = circle.style.height = `${size}px`;

  const rect = target.getBoundingClientRect();
  circle.style.left = `${e.clientX - rect.left - size / 2}px`;
  circle.style.top = `${e.clientY - rect.top - size / 2}px`;

  target.appendChild(circle);

  setTimeout(() => circle.remove(), 600);
});

// 6) Inject Ripple CSS
const rippleStyle = document.createElement("style");
rippleStyle.innerHTML = `
.ripple {
  position: absolute;
  background: rgba(255, 30, 80, 0.4);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-effect 0.6s linear;
  pointer-events: none;
}
@keyframes ripple-effect {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.reveal {
  opacity: 0;
  transform: translateY(25px) scale(0.98);
  transition: all 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.reveal.active {
  opacity: 1;
  transform: translateY(0) scale(1);
}
`;
document.head.appendChild(rippleStyle);

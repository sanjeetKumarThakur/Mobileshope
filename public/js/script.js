let menu = document.querySelector('#menu-bar');
let navbar = document.querySelector('.navbar');

menu.addEventListener('click', () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('nav-toggle'); 
});

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('nav-toggle'); 
}

const loginBtn = document.querySelector('#login-btn');
const loginPopup = document.querySelector('#login-popup');
const closeLoginPopup = document.querySelector('#close-login-popup');

loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginPopup.classList.toggle('active');
});

closeLoginPopup.addEventListener('click', () => {
    loginPopup.classList.remove('active');
});

// Ripple effect for .home .btn
document.addEventListener("DOMContentLoaded", function () {
    const homeBtn = document.querySelector(".home .btn");
    if (homeBtn) {
        homeBtn.addEventListener("click", function (e) {
            const circle = document.createElement("span");
            circle.className = "ripple";
            const rect = homeBtn.getBoundingClientRect();
            circle.style.left = (e.clientX - rect.left) + "px";
            circle.style.top = (e.clientY - rect.top) + "px";
            homeBtn.appendChild(circle);
            setTimeout(() => circle.remove(), 600);
        });
    }
});
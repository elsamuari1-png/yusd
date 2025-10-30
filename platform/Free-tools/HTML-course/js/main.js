// 29 HTML episodes
const videos = [
  "cP6fqx0xyNk","PelK3vTH9qo","4oP48EO4qRA","bQzr8qyJkK8","hbo6esRsot4",
  "TL4TTfaCALM","SEeZmoJd0T0","eI7d0OOe0JM","G5RU4dXOXe8","elY_iZA0njM",
  "4sWjm589aks","70aEjP7XRUo","3LZZppP-jBU","UdhC4y6rcm4","ciUAw6C_psw",
  "dPHktEZ2CPI","vPOcMUbLAYY","hboKNXfesaw","hSxclve6Ueg","5ij69vZ1Cec",
  "4VR3TbwSz2M","Is9tpP6FhzM","5coKs1w07BY","5p4jgrF4NvI","-kZgypV9ahk",
  "orXEqf22fKo","aOk3NoYo1xk","R2qEvzvCQl0","4TPqJM3k9lA"
];

const player   = document.getElementById('video-player');
const numbers  = document.getElementById('numbers-bar');

let current = 0;

function load(i){
  current = i;
  player.src = `https://www.youtube.com/embed/${videos[i]}?autoplay=1&rel=0`;
  document.querySelectorAll('#numbers-bar button').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === i);
  });
}

// build numbers
videos.forEach((_, idx) => {
  const btn = document.createElement('button');
  btn.textContent = idx + 1;
  btn.addEventListener('click', () => load(idx));
  numbers.appendChild(btn);
});

load(0);   // start with episode 1
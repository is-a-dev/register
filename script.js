// document.body.style.zoom = '150%';

const tabs = document.querySelector('.tabs');

tabs.addEventListener('click', (e) => handleClick(e));

function handleClick(e) {
  const target = e.target;
  const tabNum = target.dataset.tab;
  const activeTab = document.querySelector('.tabs .active');
  const activeContent = document.querySelector('.content .visible');
  const currentContent = document.querySelector(
    `.content__section[data-tab='${tabNum}']`
  );

  if (!tabNum) {
    return;
  }

  activeTab.classList.remove('active');
  target.classList.add('active');
  activeContent.classList.remove('visible');
  currentContent.classList.add('visible');
}

// * Circle Cursor
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

window.addEventListener('mousemove', function (e) {
  const posX = e.clientX;
  const posY = e.clientY;

  cursorDot.style.left = `${posX}px`;
  cursorDot.style.top = `${posY}px`;

  // cursorOutline.style.left = `${posX}px`;
  // cursorOutline.style.top = `${posY}px`;

  cursorOutline.animate(
    { left: `${posX}px`, top: `${posY}px` },
    { duration: 400, fill: 'forwards' }
  );
});

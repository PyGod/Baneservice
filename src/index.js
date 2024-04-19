import './index.scss';

if (module.hot) {
  module.hot.accept();
}

const hamburgerMenu = document.querySelector('.burger-btn');
const menuList = document.querySelector('.menu__list');
const menu = document.querySelector('.menu');
const headerButton = document.querySelector('.menu__button');

hamburgerMenu.addEventListener('click', () => {
  hamburgerMenu.classList.toggle('burger-btn_active');
  menuList.classList.toggle('menu__list_active');
  menu.classList.toggle('menu_active');
  headerButton.classList.toggle('menu__button_active');
});

const vacanciesParagraph = document.querySelector('.vacancies__p');
const headParagraph = document.querySelector('.head__p');
const aboutTitle = document.querySelector('.about__title');
const footerTitle = document.querySelector('.footer__title');

function wrapText(elem, className) {
  const text = elem.textContent;
  const splitText = text.split(/\S[$;:]/);

  elem.textContent = '';

  for (let i = 0; i < splitText.length; i++) {
    elem.innerHTML += `<span class=${className}>${splitText[i]}</span>`;
  }
}

function wrapWords(isModify, elem, parentClass, childClass = null) {
  if (isModify) {
    let wordsArr = elem.childNodes;
    for (let i = 0; i < wordsArr.length; i++) {
      if (wordsArr[i].nodeType === 3 && wordsArr[i].data.includes('\n', 1)) {
        let strArr = wordsArr[i].data.trim().split(/\s+/);
        let nodesArr = strArr.map((str) => {
          return document.createTextNode(str);
        });
        wordsArr[i].textContent = '';
        nodesArr.forEach((node) => {
          const span = document.createElement('span');
          span.className = parentClass;
          const strong = document.querySelector(childClass);
          span.appendChild(node);
          strong.before(span);
          span.after(' ');
        });
      }
    }
  } else {
    let wordsArr = elem.textContent.split(/\s+/);
    for (let i = 0; i < wordsArr.length; i++) {
      if (wordsArr[i]) {
        wordsArr[i] = `<span class="${parentClass}">${wordsArr[i]}</span>`;
      }

      elem.innerHTML = wordsArr.join(' ');
    }
  }
}

wrapText(vacanciesParagraph, 'hidden');
wrapWords(false, headParagraph, 'head__p-text');
wrapWords(true, aboutTitle, 'about__title-text observed', '.about__strong');
wrapWords(true, footerTitle, 'footer__title-text observed', '.footer__strong');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
});

const hiddenElements = document.querySelectorAll('.hidden');

hiddenElements.forEach((el) => {
  observer.observe(el);
});

const observerFadeUpFull = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const observe = entry.target.querySelectorAll('.observed');

    if (entry.isIntersecting) {
      observe.forEach((el) => {
        el.classList.add('animate');
      });
    } else {
      observe.forEach((el) => {
        el.classList.remove('animate');
      });
    }
  });
});

const cards = document.querySelector('.cards');
const about = document.querySelector('.about');
const footer = document.querySelector('.footer');

[cards, about, footer].forEach((el) => {
  observerFadeUpFull.observe(el);
});

// intersection observer to detect when the page is scrolled
// the observed element is a div with the id "top" and is at the beginning of the element with the class "container"
const pageTopIO = new IntersectionObserver(
  (entries) => {
    const documentTopObserver = entries[0];

    const header = document.querySelector('header') as HTMLElement;

    // if the observed element is not in the viewport anymore then we add the "scrolled" class to the header
    // to get a slight box shadow effect on the header
    if (!documentTopObserver.isIntersecting) {
      return header.classList.add('scrolled');
    }

    // if the observed element is in the viewport then we remove the "scrolled" class from the header
    header.classList.remove('scrolled');
  },
  {
    threshold: 1,
  },
);

pageTopIO.observe(document.getElementById('top') as HTMLElement);

// intersection observer to make the cards in the services section appear when the user scrolls down
const cardsIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // if the observed element appears in the viewport then we add the "visible" class to the element
      // to make it appear and animate with a transition effect
      if (entry.isIntersecting) {
        return entry.target.classList.add('visible');
      }

      entry.target.classList.remove('visible');
    });
  },
  {
    // we only want to observe the cards that are in the viewport - 250px so the card will
    // be slightly visible before it starts to animate
    rootMargin: '-250px 0px',
  },
);

const cardElements = document.querySelectorAll('.card');
for (const cardElement of cardElements) {
  cardsIO.observe(cardElement);
}

addEventListener('orientationchange', () => {
  // if the device is rotated we want the cards to be visible again even if the user didn't scroll
  // landscape mode
  if (window.orientation === 90) {
    cardElements.forEach((cardElement) => {
      cardElement.classList.add('visible');
    });
    return;
  }

  // portrait mode
  cardElements.forEach((cardElement) => {
    cardElement.classList.remove('visible');
  });
});

const carousel = new Carousel(document.querySelector('#carousel') as HTMLElement, {
  duration: 5000,
  autoPlay: true,
});

type Direction = 'forward' | 'backward';

interface CarouselOptions {
  duration?: number;
  direction?: Direction;
  autoPlay?: boolean;
}

class Carousel {
  // the number of images in the carousel
  private imagesCount = 0;
  // the interval for changing the image is set in this property
  private changeInterval?: number;
  // status of the carousel
  private status: 'started' | 'stopped' = 'stopped';

  // property to store everything related to the touch events on the carousel
  private touch = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    moved: false,
  };

  constructor(private readonly element: HTMLElement, private readonly options: CarouselOptions) {
    this.loadImages();
    this.activateControls();

    this.options.direction = this.options.direction ?? 'forward';
    this.options.duration = this.options.duration ?? 5000;

    if (this.options.autoPlay) {
      this.start();
    }
  }

  /**
   *
   * Starts the carousel animation and sets the interval for changing the image in the carousel to the given duration.
   * If the duration is not given, the default duration is used.
   *
   */
  public start = () => {
    if (this.status === 'started') {
      return;
    }

    const intervalCallback =
      this.options.direction === 'forward' ? this.nextImage : this.previousImage;

    this.changeInterval = setInterval(intervalCallback, this.options.duration);
    this.status = 'started';
  };

  /**
   * Stops the carousel animation and clears the interval for changing the image in the carousel.
   * The carousel will not change the image anymore. The current image will stay the same.
   *
   * @example
   * carousel.stop();
   *
   *
   */
  public stop = () => {
    clearInterval(this.changeInterval);
    this.status = 'stopped';
  };

  /**
   *
   * Dynamically add images to the carousel element by trying to load them from /assets/img/carousel folder.
   * The name of the image should follow the pattern `carousel-{number}.jpg`
   *
   */
  private loadImages = () => {
    const carouselContentElement = this.element.querySelector('.carousel__content');

    const imgElement = new Image();
    const isFirstImage = this.imagesCount === 0;
    imgElement.className = `carousel__image ${isFirstImage ? 'active' : ''}`;
    imgElement.src = `assets/img/carousel/carousel-${this.imagesCount + 1}.jpg`;
    imgElement.dataset.index = this.imagesCount.toString();

    imgElement.addEventListener('touchstart', this.onTouchStart);
    imgElement.addEventListener('touchmove', this.onTouchMove);
    imgElement.addEventListener('touchend', this.onTouchEnd);
    imgElement.addEventListener('mouseenter', this.onMouseInteractionOnImage);
    imgElement.addEventListener('mouseleave', this.onMouseInteractionOnImage);

    // When the load event is triggered, we know that the image is loaded and we can add it to the carousel element
    // We increment the imagesCount variable to know which image to load next time
    // And we call the same function again to add the next image in a recursive way until all images are loaded or we get a 404 error

    imgElement.addEventListener('load', () => {
      carouselContentElement?.appendChild(imgElement);

      // creating the indicator dots for the carousel
      this.createIndicator(isFirstImage);

      this.imagesCount++;
      this.loadImages();
    });

    // if the error event is triggered we just clear the console to get rid of the error message
    imgElement.addEventListener('error', console.clear);
  };

  /**
   *
   * Reacts to the mouseenter and mouseleave events on the carousel images.
   * When the mouse enters the image, we stop the carousel animation
   * and when the mouse leaves the image, we start the carousel animation again.
   *
   * This is done to prevent the carousel from changing images
   * when the user is interacting with the carousel images.
   *
   * This will trigger only if the carousel is in autoplay mode.
   *
   * @param event The mouseenter or mouseleave event
   *
   * @param event
   *
   */
  private onMouseInteractionOnImage = (event: MouseEvent) => {
    if (!this.options.autoPlay) {
      return;
    }

    if (event.type === 'mouseenter') {
      this.stop();
      return;
    }

    this.start();
  };

  /**
   *
   * Reacts to the touchstart event on the carousel element.
   * It stores the start position of the touch event in the touch property.
   *
   * @param event The touchmove event on the carousel element.
   *
   */
  private onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    this.touch.startX = touch.clientX;
  };

  /**
   *
   * Reacts to the touchmove event on the carousel element.
   * It stores the end position of the touch event in the touch property and sets the moved property to true.
   * Also changes the direction of the slide based on the start and end position of the touch event.
   *
   * @param event The touchmove event on the carousel element.
   *
   */
  private onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    this.touch.endX = touch.clientX;
    this.touch.moved = true;

    this.options.direction = this.touch.startX > this.touch.endX ? 'forward' : 'backward';
  };

  /**
   *
   * Reacts to the touchend event on the carousel element.
   * It checks if the touch event was triggered and the position changed,
   * if so it changes the image in the carousel based on the direction of the slide.
   *
   */
  private onTouchEnd = () => {
    if (this.touch.moved) {
      this.touch.moved = false;

      if (this.options.direction === 'forward') {
        this.nextImage();
        return;
      }

      this.previousImage();
    }
  };

  /**
   *
   * Creates the indicator dots for the carousel.
   * It creates a new element with the class `carousel__indicator` and adds it to the carousel element.
   * It also adds an event listener to the element to change the image in the carousel when the indicator is clicked.
   *
   * @param isActive Indicates if the indicator should be active or not.
   *
   */
  private createIndicator = (isActive: boolean = false) => {
    const indicatorsContainer = document.querySelector('#carousel__indicators') as HTMLDivElement;

    const indicatorElement = document.createElement('div');
    indicatorElement.className = `carousel__indicator ${isActive ? 'active' : ''}`;
    indicatorElement.dataset.index = this.imagesCount.toString();
    indicatorElement.addEventListener('click', this.indicatorElementClickHandler);

    indicatorsContainer.appendChild(indicatorElement);
  };

  /**
   *
   * Reacts to the click event on the indicator element.
   * It changes the image in the carousel to the image with the given index.
   *
   * @param event The click event on the indicator element.
   *
   */
  private indicatorElementClickHandler = (event: Event) => {
    const indicatorElement = event.target as HTMLDivElement;
    const currentImage = this.getActiveImage();
    const currentImageIndex = parseInt(currentImage.dataset.index as string, 10);

    const newImageIndex = parseInt(indicatorElement.dataset.index as string, 10);

    // If the new image index is greater than the current image index, we set the direction to forward and backward otherwise to adapt the animation
    this.options.direction = newImageIndex > currentImageIndex ? 'forward' : 'backward';

    this.changeImage(currentImageIndex, newImageIndex);
  };

  /**
   * Resets the interval for changing the image in the carousel.
   */
  private resetInterval = () => {
    clearInterval(this.changeInterval);

    const intervalCallback =
      this.options.direction === 'forward' ? this.nextImage : this.previousImage;

    this.changeInterval = setInterval(intervalCallback, this.options.duration);
  };

  /**
   *
   * Gets the active image in the carousel.
   *
   * @returns {HTMLImageElement} The active image in the carousel.
   */
  private getActiveImage = () => {
    return this.element.querySelector('.carousel__image.active') as HTMLImageElement;
  };

  /**
   *
   * Changes the image in the carousel to the image with the given index.
   * If the index is greater than the number of images in the carousel, it changes the index to 0 to start from the beginning.
   * If the index is less than 0, it changes the index to the number of images in the carousel to start from the end.
   *
   * @param currentImageIndex The index of the current image in the carousel.
   * @param newImageIndex The index of the image to show next in the carousel.
   *
   */
  private changeImage = (currentImageIndex: number, newImageIndex: number) => {
    if (this.status === 'started') this.resetInterval();

    const indicatorsElements = this.element.querySelectorAll('.carousel__indicator');

    const carouselImages = this.element.querySelectorAll('.carousel__image');
    const currentImage = carouselImages[currentImageIndex] as HTMLDivElement;
    const newImage = carouselImages[newImageIndex] as HTMLDivElement;

    currentImage.className = 'carousel__image';
    newImage.className = 'carousel__image active';
    this.animateChange(currentImageIndex, newImageIndex);

    const currentIndicator = indicatorsElements[currentImageIndex];
    const newIndicator = indicatorsElements[newImageIndex];

    currentIndicator.classList.remove('active');
    newIndicator.classList.add('active');
  };

  /**
   *
   * Animates the change of the image in the carousel.
   * It makes the image with the given index visible and hides the other images with a slide transition.
   *
   * @param currentImageIndex The index of the current image in the carousel.
   * @param newImageIndex The index of the image to show next in the carousel.
   *
   */
  private animateChange = (currentImageIndex: number, newImageIndex: number) => {
    const carouselImages = this.element.querySelectorAll('.carousel__image');
    const currentImage = carouselImages[currentImageIndex] as HTMLDivElement;
    const newImage = carouselImages[newImageIndex] as HTMLDivElement;

    for (const carouselImage of carouselImages) {
      const image = carouselImage as HTMLDivElement;
      image.classList.remove('forwardIn', 'backwardIn', 'forwardOut', 'backwardOut');

      if (carouselImage === currentImage) {
        image.classList.add(`${this.options.direction}Out`);
        image.classList.remove('active');

        continue;
      }

      if (carouselImage === newImage) {
        image.classList.add(`${this.options.direction}In`);
        image.classList.add('active');
      }
    }
  };

  /**
   *
   * Adds the event listeners to the left and right arrow elements to react
   * to the click event to change the image in the carousel.
   *
   */
  private activateControls = () => {
    const leftArrowElement = this.element.querySelector('#carousel__nav .left') as HTMLDivElement;
    const rightArrowElement = this.element.querySelector('#carousel__nav .right') as HTMLDivElement;

    leftArrowElement.addEventListener('click', this.previousImage);
    rightArrowElement.addEventListener('click', this.nextImage);
  };

  /**
   *
   * Changes the image in the carousel to the next image and sets the direction to forward.
   *
   */
  private nextImage = () => {
    this.options.direction = 'forward';

    const currentImage = this.getActiveImage();
    const currentImageIndex = parseInt(currentImage.dataset.index as string, 10);

    const nextImage = currentImage.nextElementSibling as HTMLImageElement;

    if (nextImage) {
      // If the next image exists, we change the image to the next image
      const nextImageIndex = parseInt(nextImage.dataset.index as string, 10);

      this.changeImage(currentImageIndex, nextImageIndex);
      this.animateChange(currentImageIndex, nextImageIndex);
      return;
    }

    // If there is no next image, we change the index to 0 to start from the beginning
    this.changeImage(this.imagesCount - 1, 0);
    this.animateChange(this.imagesCount - 1, 0);
  };

  /**
   *
   * Changes the image in the carousel to the previous image and sets the direction to backward.
   *
   */
  private previousImage = () => {
    this.options.direction = 'backward';

    const currentImage = this.getActiveImage();
    const currentImageIndex = parseInt(currentImage.dataset.index as string, 10);

    const previousImage = currentImage.previousElementSibling as HTMLImageElement;

    if (previousImage) {
      // If the previous image exists, we change the image to the previous image
      const previousImageIndex = parseInt(previousImage.dataset.index as string, 10);

      this.changeImage(currentImageIndex, previousImageIndex);
      this.animateChange(currentImageIndex, previousImageIndex);
      return;
    }

    // If there is no previous image, we change the index to the last image to start from the end of the carousel.
    this.changeImage(currentImageIndex, this.imagesCount - 1);
    this.animateChange(currentImageIndex, this.imagesCount - 1);
  };
}

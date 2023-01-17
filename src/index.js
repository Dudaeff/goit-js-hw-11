import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getImages } from './js/fetch-images';
import { createGalleryItemsMarkup } from './js/create-gallery-items';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.js-gallery');
const loadMoreBtn = document.querySelector('.js-load-more');
const observerGuard = document.querySelector(".js-guard");
const infinityCheckBox = document.querySelector('.js-allow-infinity');
const checkBoxLabel = document.querySelector('.js-allow-infinity-label');
const intersectionObserverOptions = {
    root: null,
    rootMargin: '500px',
    threshold: 1.0,
};
let page = 1;
let pages = 1;
let previousSearchValue = '';
let isInfinityLoad = null;
const intersectionObserver = new IntersectionObserver(handleIntersection, intersectionObserverOptions);
hideCheckBox();

searchForm.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);
infinityCheckBox.addEventListener('change', setInfinityLoad);

function onFormSubmit(evt) {
    evt.preventDefault();
    const currentSearchRequest = evt.target.elements.searchQuery.value.trim();
    const isPreviusValue = previousSearchValue !== '' && previousSearchValue !== currentSearchRequest;
    
    if(isPreviusValue) {
        page = 1;
        gallery.innerHTML = '';
        // intersectionObserver.unobserve(observerGuard);
    } else if (!currentSearchRequest) {
        return Notify.failure('Enter your request, please.');
    };
    previousSearchValue = currentSearchRequest;
    renderGalleryItems(currentSearchRequest, page);
    showCheckBox();
    incrementPage();
};

function onLoadMore() { 
    loadMoreBtn.classList.replace('show', 'hide');
    renderGalleryItems(previousSearchValue, page);
    incrementPage();
};

function handleIntersection(entries, observer) {
     entries.forEach(entry => {
    if (entry.isIntersecting && previousSearchValue)  onLoadMore();
    if (pages < page) {
      observer.unobserve(observerGuard);
    }
  });
 };

async function renderGalleryItems(searchRequest, searchPage) {
    try {
        const response = await getImages(searchRequest, searchPage);
        const arrayOfImages = response.data.hits;
        const foundImagesQty = response.data.totalHits;
        pages = Math.round(response.data.total / foundImagesQty);

        if (!foundImagesQty) {
            return Notify.info('Sorry, there are no images matching your search query. Please try again.');
        };
        if (!arrayOfImages.length) {
            loadMoreBtn.classList.add('hide');
            hideCheckBox();
            return Notify.failure("We're sorry, but you've reached the end of search results.");
        };
        if (page - 1 === 1) {
            Notify.success(`Hooray! We found ${foundImagesQty} images.`)
        };
        loadMoreBtn.classList.replace('hide', 'show');
        createGalleryItemsMarkup(arrayOfImages, gallery);
    } catch (error) {
        Notify.failure(error.message);   
    };
};

function incrementPage() {
    return page += 1;
};

function hideCheckBox() {
    infinityCheckBox.hidden = true;
checkBoxLabel.hidden = true;
};

function showCheckBox() {
    infinityCheckBox.hidden = false;
checkBoxLabel.hidden = false;
};

function setInfinityLoad(event) {
  isInfinityLoad = event.currentTarget.checked;
  isInfinityLoad
    ? intersectionObserver.observe(observerGuard)
    : intersectionObserver.unobserve(observerGuard);
  if (pages > page && !isInfinityLoad) loadMoreBtn.classList.replace('hide', 'show');
};
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getImages } from './js/fetch-images';
import { createGalleryItemsMarkup } from './js/create-gallery-items';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let page = 1;

searchForm.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
loadMoreBtn.classList.add('hide');

async function onFormSubmit(evt) {
    evt.preventDefault();
    const searchRequest = evt.target.elements.searchQuery.value.trim();
    if (!searchRequest) {
        return Notify.failure('Enter your request, please.');
    };

    const response = await renderGalleryItems(searchRequest, page);
    console.log(response)
};

function onLoadMoreBtnClick(request) { 
    page += 1;
    loadMoreBtn.classList.replace('show', 'hide');
    renderGalleryItems(request, page);
};

async function renderGalleryItems(searchRequest, page) {
        try {
        const response = await getImages(searchRequest, page);
        const arrayOfImages = response.data.hits;

        if (!arrayOfImages.length) {
          return Notify.info('Sorry, there are no images matching your search query. Please try again.')
        } else {
            const galleryCards = createGalleryItemsMarkup(arrayOfImages);
            gallery.innerHTML = galleryCards;
            loadMoreBtn.classList.replace('hide', 'show');
        }
    } catch (error) {
        Notify.failure(error.message);   
    };
    return searchRequest;
};
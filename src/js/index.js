import axios from 'axios';
import Notiflix, { Block } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
const loader = document.querySelector('.loader');
const limit = 40;

let pageToFetch = 1;
let queryToFetch = '';

async function fetchItems(query, page) {
  try {
    const { data } = await axios('https://pixabay.com/api/', {
      params: {
        key: '36897796-80d0161cb86e865e3d79cd758',
        q: queryToFetch,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: pageToFetch,
      },
    });
    return data;
  } catch (error) {}
}

// fetchItems('car',1).then(res => createGalleryItem(res))

function createGalleryItem(arr) {
  const markup = arr.hits
    .map(
      item => `
     <a href="${item.largeImageURL}">
  <div class="photo-card">
  <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes </b> ${item.likes}
    </p>
    <p class="info-item">
      <b>Views </b> ${item.views}
    </p>
    <p class="info-item">
      <b>Comments </b> ${item.comments}
    </p>
    <p class="info-item">
      <b>Downloads </b> ${item.downloads}
    </p>
  </div>
</div>
</a>
  `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

async function getEvents(query, page) {
  const res = await fetchItems(query, page);

  if (!res.totalHits) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  
  if (res.totalHits <= pageToFetch * limit) {
    btnLoadMore.classList.add('invisible');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
      );
    } else {
      btnLoadMore.classList.remove('invisible');
    }
    
    createGalleryItem(res);

  const options = {
    captionDelay: 250,
    captionsData: 'alt',
  };
  const lightbox = new SimpleLightbox('.gallery a', options);

  if (pageToFetch === 1) {
    Notiflix.Notify.success(`"Hooray! We found ${res.totalHits} images."`);
  }
}

form.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
  queryToFetch = e.target.elements.searchQuery.value.trim();
  gallery.innerHTML = '';
  pageToFetch = 1;

  if (queryToFetch.trim() === '') {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

    return;
  }
  btnLoadMore.classList.add('invisible');
  getEvents(queryToFetch, pageToFetch);
  form.reset();
  // lightbox.refresh();
}

btnLoadMore.addEventListener('click', onBtnLoadMore);

function onBtnLoadMore() {
  pageToFetch += 1;
  getEvents(queryToFetch, pageToFetch);
  lightbox.refresh();
}

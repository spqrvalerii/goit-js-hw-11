import './css/styles.css';
import fetchImages from './js/fetchImages';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const collectionEndMessage = document.querySelector('.collection-end-message');

let simpleLightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

function renderImageList(images) {
  const markup = images.map(image => createMarkup(image)).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function createMarkup({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) {
  return `
  <div class='photo-card'>
    <a href='${largeImageURL}'>
      <img src='${webformatURL}' alt='${tags}' loading='lazy' />
    </a>
    <div class='info'>
      <p class='info-item'><b>Likes</b>${likes}</p>
      <p class='info-item'><b>Views</b>${views}</p>
      <p class='info-item'><b>Comments</b>${comments}</p>
      <p class='info-item'><b>Downloads</b>${downloads}</p>
    </div>
  </div>
  `;
};

let currentPage = 1;
let currentHits = 0;
let searchQuery = '';

searchForm.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.searchQuery.value;
  currentPage = 1;

  if (searchQuery === '') {
    return;
  }

  const response = await fetchImages(searchQuery, currentPage);
  currentHits = response.hits.length;

  if (response.totalHits > 40) {
    loadMoreBtn.classList.remove('is-hidden');
  } else {
    loadMoreBtn.classList.add('is-hidden');
  }

  try {
    if (response.totalHits > 0) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
      gallery.innerHTML = '';
      renderImageList(response.hits);
      simpleLightbox.refresh();
      collectionEndMessage.classList.add('is-hidden');

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * -100,
        behavior: 'smooth',
      });
    }

    if (response.totalHits === 0) {
      gallery.innerHTML = '';
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      loadMoreBtn.classList.add('is-hidden');
      collectionEndMessage.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
};

loadMoreBtn.addEventListener('click', onClick);

async function onClick() {
  currentPage += 1;
  const response = await fetchImages(searchQuery, currentPage);
  renderImageList(response.hits);
  simpleLightbox.refresh();
  currentHits += response.hits.length;

  if (currentHits >= response.totalHits) {
    loadMoreBtn.classList.add('is-hidden');
    collectionEndMessage.classList.remove('is-hidden');
  }
};
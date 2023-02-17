import './css/styles.css';
import { fetchCountries } from './js/fetchCountries';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

const input = document.getElementById('search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');
const DEBOUNCE_DELAY = 300;

input.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput() {
  const inputValue = input.value.trim();
  if (inputValue === '') {
    countryInfo.innerHTML = '';
    countryList.innerHTML = '';
    return;
  }

  fetchCountries(inputValue)
    .then(foundedCountries => {
      if (foundedCountries.length > 10) {
        Notiflix.Notify.info('Too many matches found. Please enter a more specific name.');
        countryInfo.innerHTML = '';
        countryList.innerHTML = '';
        return;
      }
      if (foundedCountries.length <= 10) {
        const markupList = foundedCountries.map(country => renderCountryList(country));
        countryInfo.innerHTML = '';
        countryList.innerHTML = markupList.join('');
      }
      if (foundedCountries.length === 1) {
        const markupInfo = foundedCountries.map(country => renderCountryInfo(country));
        countryInfo.innerHTML = markupInfo.join('');
        countryList.innerHTML = '';
      }
    })
    .catch(error => {
      Notiflix.Notify.failure('Oops, there is no country with that name');
      countryInfo.innerHTML = '';
      countryList.innerHTML = '';
      return error;
    })
};

function renderCountryList({ flags, name }) {
  return `
  <li class="country-list__item">
    <img src="${flags.svg}" alt="${name.official}" width="25" />
    <h2 class="country-list__name">${name.official}</h2>
  </li>
  `;
};

function renderCountryInfo({ flags, name, capital, population, languages }) {
  return `  
    <div class="country-info__wrapper">
      <img src="${flags.svg}" alt="Flag of ${name.official}" width="30" height="20">
      <h2 class="country-info__name">${name.official}</h2>
    </div>  
    <p><b>Capital:</b> ${capital}</p>
    <p><b>Population:</b> ${population}</p>
    <p><b>Languages:</b> ${Object.values(languages)} </p>  
    `;
};
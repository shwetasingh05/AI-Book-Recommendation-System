// ==========================================
// DOM Elements — Search Page
// ==========================================
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsGrid = document.getElementById('results-grid');
const loadingState = document.getElementById('loading');
const errorState = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const resultsHeader = document.getElementById('results-header');

// ==========================================
// DOM Elements — Book Details Modal
// ==========================================
const bookModal = document.getElementById('book-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalLoading = document.getElementById('modal-loading');
const modalError = document.getElementById('modal-error');
const modalErrorText = document.getElementById('modal-error-text');
const modalDetails = document.getElementById('modal-book-details');

const modalCover = document.getElementById('modal-cover');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalAuthors = document.getElementById('modal-authors');
const modalCategories = document.getElementById('modal-categories');
const modalPages = document.getElementById('modal-pages');
const modalPublished = document.getElementById('modal-published');
const modalRatingValue = document.getElementById('modal-rating-value');
const modalPublisher = document.getElementById('modal-publisher');
const modalDescription = document.getElementById('modal-description');
const modalPreviewLink = document.getElementById('modal-preview-link');
const modalInfoLink = document.getElementById('modal-info-link');

// ==========================================
// API Configuration
// ==========================================
const API_BASE_URL = 'http://127.0.0.1:5000/recommend?book=';
const BOOK_DETAILS_URL = 'http://127.0.0.1:5000/book_details?title=';

// ==========================================
// Search Form Handler (ML backend)
// ==========================================
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const query = searchInput.value.trim();
    if (!query) return;

    // Reset old UI states
    hideError();
    clearResults();
    resultsHeader.classList.add('hidden');

    // Begin Loading
    showLoading();

    try {
        const response = await fetch(API_BASE_URL + encodeURIComponent(query));

        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const recommendations = await response.json();

        // Stop loading spinner
        hideLoading();

        // Validate response is an array
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            showError(`No similar books found for "${query}". Try another title.`);
            return;
        }

        // Show header
        resultsHeader.classList.remove('hidden');

        // Render Books
        renderBooks(recommendations);

    } catch (error) {
        hideLoading();
        console.error('API Error:', error);
        if (error.message.includes('Failed to fetch')) {
            showError('Unable to connect to the recommendation engine. Is the Flask server (app.py) running on 127.0.0.1:5000?');
        } else {
            showError(error.message || 'An unexpected error occurred computing recommendations.');
        }
    }
});

// ==========================================
// Render Book Cards
// ==========================================
function renderBooks(bookTitles) {
    bookTitles.forEach((title, index) => {
        const author = generatePlaceholderAuthor(index);
        const rating = generatePlaceholderRating(index);
        const ratingCount = Math.floor(Math.random() * 5000) + 500;

        // Staggered animation
        setTimeout(() => {
            const card = createBookCard(title, author, rating, ratingCount);
            resultsGrid.appendChild(card);
        }, index * 80);
    });
}

/**
 * Creates the DOM element for a single book card.
 * Clicking the card opens the book-details modal in-page.
 */
function createBookCard(title, author, rating, count) {
    const article = document.createElement('article');
    article.className = 'book-card';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `View details for ${title}`);

    const encodedTitle = encodeURIComponent(title.length > 30 ? title.substring(0, 30) + '...' : title);
    const placeholderUrl = `https://placehold.co/400x600/e0e7ff/4f46e5?text=${encodedTitle}`;

    const starIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    `;

    article.innerHTML = `
        <div class="card-image-wrapper cover-loading">
            <img src="${placeholderUrl}" alt="Cover image for ${title}" loading="lazy" />
        </div>
        <div class="card-content">
            <h3 class="book-title" title="${title}">${title}</h3>
            <p class="book-author">By ${author}</p>
            <div class="book-meta">
                <div class="rating">
                    ${starIcon}
                    ${rating} <span class="rating-count">(${count})</span>
                </div>
                <span class="popularity-badge">98% Match</span>
            </div>
        </div>
    `;

    // Open modal on click
    article.addEventListener('click', () => openBookModal(title));
    article.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openBookModal(title);
        }
    });

    // Fetch real cover asynchronously — swaps in when ready
    const imgEl = article.querySelector('.card-image-wrapper img');
    const wrapperEl = article.querySelector('.card-image-wrapper');
    fetchCoverImage(title).then(coverUrl => {
        if (coverUrl) {
            const tempImg = new Image();
            tempImg.onload = () => {
                imgEl.src = coverUrl;
                imgEl.style.opacity = '0';
                imgEl.style.transition = 'opacity 0.4s ease';
                requestAnimationFrame(() => { imgEl.style.opacity = '1'; });
            };
            tempImg.src = coverUrl;
        }
        wrapperEl.classList.remove('cover-loading');
    });

    return article;
}

/**
 * Fetches a book cover thumbnail URL from the Google Books API.
 * Returns null if nothing is found.
 * @param {string} title
 * @returns {Promise<string|null>}
 */
async function fetchCoverImage(title) {
    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1&fields=items(volumeInfo/imageLinks)`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const links = data?.items?.[0]?.volumeInfo?.imageLinks;
        if (!links) return null;
        // Prefer larger images; fall back down the chain
        const raw = links.extraLarge || links.large || links.medium || links.small || links.thumbnail || links.smallThumbnail;
        if (!raw) return null;
        // Force HTTPS and remove zoom restriction for a better image
        return raw.replace('http://', 'https://').replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
    } catch {
        return null;
    }
}


// ==========================================
// Modal Logic
// ==========================================

/** Opens the modal and fetches book details for the given title */
async function openBookModal(title) {
    // Show modal, reset state
    bookModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    // Reset modal internals
    modalLoading.classList.remove('hidden');
    modalError.classList.add('hidden');
    modalDetails.classList.add('hidden');

    // Scroll modal to top
    bookModal.scrollTop = 0;

    // Fetch book details from Flask backend
    try {
        const response = await fetch(BOOK_DETAILS_URL + encodeURIComponent(title));

        if (!response.ok) {
            if (response.status === 404) throw new Error('Book not found in the dataset.');
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (Object.keys(data).length === 0 || data.error) {
            throw new Error(data.error || 'Book details not found.');
        }

        renderModalDetails(data);

    } catch (error) {
        console.error('Modal API Error:', error);
        modalLoading.classList.add('hidden');
        modalErrorText.textContent = error.message.includes('Failed to fetch')
            ? 'Unable to connect to the server. Is app.py running?'
            : error.message;
        modalError.classList.remove('hidden');
    }
}

/** Populates the modal with book data */
function renderModalDetails(data) {
    modalLoading.classList.add('hidden');

    modalTitle.textContent = data.title || 'Unknown Title';

    if (data.subtitle) {
        modalSubtitle.textContent = data.subtitle;
        modalSubtitle.style.display = 'block';
    } else {
        modalSubtitle.style.display = 'none';
    }

    modalAuthors.textContent = data.authors || 'Unknown';
    modalCategories.textContent = data.categories || 'No Category';
    modalPages.textContent = data.page_count ? `${data.page_count} Pages` : 'Unknown Pages';

    if (data.published_date) {
        const date = new Date(data.published_date);
        modalPublished.textContent = !isNaN(date.getTime()) ? date.getFullYear() : data.published_date;
    } else {
        modalPublished.textContent = 'Unknown Date';
    }

    modalRatingValue.textContent = data.average_rating ? data.average_rating.toFixed(2) : 'N/A';
    modalPublisher.textContent = data.publisher || 'Unknown Publisher';
    modalDescription.textContent = data.description || 'No description available.';

    // Cover image
    if (data.thumbnail) {
        modalCover.src = data.thumbnail;
    } else {
        modalCover.src = `https://placehold.co/400x600/e0e7ff/4f46e5?text=${encodeURIComponent(data.title || 'No Image')}`;
    }
    modalCover.alt = `Cover of ${data.title}`;

    // Preview → Wikipedia
    const wikiTitle = (data.title || '').trim().replace(/ /g, '_');
    modalPreviewLink.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
    modalPreviewLink.classList.remove('hidden');

    // More Info → Publisher link
    if (data.info_link) {
        modalInfoLink.href = data.info_link;
        modalInfoLink.classList.remove('hidden');
    } else {
        modalInfoLink.classList.add('hidden');
    }

    modalDetails.classList.remove('hidden');
}

/** Closes the modal and restores background scrolling */
function closeModal() {
    bookModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Close via "Back to Search" button
modalCloseBtn.addEventListener('click', closeModal);

// Close via Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bookModal.classList.contains('hidden')) {
        closeModal();
    }
});

// ==========================================
// Search UI State Utilities
// ==========================================
function showLoading() { loadingState.classList.remove('hidden'); }
function hideLoading() { loadingState.classList.add('hidden'); }
function showError(message) {
    errorText.textContent = message;
    errorState.classList.remove('hidden');
}
function hideError() { errorState.classList.add('hidden'); }
function clearResults() { resultsGrid.innerHTML = ''; }

// ==========================================
// Placeholder Generators
// ==========================================
function generatePlaceholderAuthor(index) {
    const authorsPool = [
        "Bestselling Author",
        "Acclaimed Writer",
        "Award-Winning Novelist",
        "Famous Creator",
        "Notable Historian"
    ];
    return authorsPool[index % authorsPool.length];
}

function generatePlaceholderRating(seed) {
    const base = 4.0;
    const additional = (seed * 0.17 % 0.9);
    return (base + additional).toFixed(1);
}

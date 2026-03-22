document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const loadingState = document.getElementById('loading');
    const errorState = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const detailsContainer = document.getElementById('book-details-container');

    const bTitle = document.getElementById('b-title');
    const bSubtitle = document.getElementById('b-subtitle');
    const bAuthors = document.getElementById('b-authors');
    const bCategories = document.getElementById('b-categories');
    const bPages = document.getElementById('b-pages');
    const bPublished = document.getElementById('b-published');
    const bRating = document.getElementById('b-rating-value');
    const bPublisher = document.getElementById('b-publisher');
    const bDescription = document.getElementById('b-description');
    const bCover = document.getElementById('book-cover');

    const previewLink = document.getElementById('preview-link');
    const infoLink = document.getElementById('info-link');

    // Get Title from URL Search Params
    const urlParams = new URLSearchParams(window.location.search);
    const titleQuery = urlParams.get('title');

    if (!titleQuery) {
        showError("No book title was provided.");
        return;
    }

    const API_URL = `http://127.0.0.1:5000/book_details?title=${encodeURIComponent(titleQuery)}`;

    fetchBookDetails();

    async function fetchBookDetails() {
        showLoading();
        hideError();
        detailsContainer.classList.add('hidden');

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Book not found in the original dataset.");
                }
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Check if object is empty
            if (Object.keys(data).length === 0 || data.error) {
                throw new Error(data.error || "Book details not found.");
            }

            renderBookDetails(data);

        } catch (error) {
            console.error('API Error:', error);
            if (error.message.includes('Failed to fetch')) {
                showError('Unable to connect to the server. Is app.py running?');
            } else {
                showError(error.message);
            }
        } finally {
            hideLoading();
        }
    }

    function renderBookDetails(data) {
        // Populate fields
        bTitle.textContent = data.title || "Unknown Title";

        if (data.subtitle) {
            bSubtitle.textContent = data.subtitle;
            bSubtitle.style.display = 'block';
        } else {
            bSubtitle.style.display = 'none';
        }

        bAuthors.textContent = data.authors ? data.authors : "Unknown";
        bCategories.textContent = data.categories ? data.categories : "No Category";
        bPages.textContent = data.page_count ? `${data.page_count} Pages` : "Unknown Pages";

        if (data.published_date) {
            const date = new Date(data.published_date);
            bPublished.textContent = !isNaN(date.getTime()) ? date.getFullYear() : data.published_date;
        } else {
            bPublished.textContent = "Unknown Date";
        }

        bRating.textContent = data.average_rating ? data.average_rating.toFixed(2) : "N/A";
        bPublisher.textContent = data.publisher ? data.publisher : "Unknown Publisher";

        bDescription.textContent = data.description ? data.description : "No description available.";

        // Handle Image
        if (data.thumbnail) {
            bCover.src = data.thumbnail;
        } else {
            bCover.src = `https://placehold.co/400x600/e0e7ff/4f46e5?text=${encodeURIComponent(data.title || 'No Image')}`;
        }
        bCover.alt = `Cover of ${data.title}`;

        // Preview Book → Wikipedia page for the book
        const wikiTitle = (data.title || '').trim().replace(/ /g, '_');
        const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
        previewLink.href = wikipediaUrl;
        previewLink.textContent = 'View on Wikipedia';
        previewLink.classList.remove('hidden');

        // More Info → Google Play Books
        if (data.info_link) {
            infoLink.href = data.info_link;
            infoLink.classList.remove('hidden');
        } else {
            infoLink.classList.add('hidden');
        }

        detailsContainer.classList.remove('hidden');
    }

    // UI Helpers
    function showLoading() {
        loadingState.classList.remove('hidden');
    }

    function hideLoading() {
        loadingState.classList.add('hidden');
    }

    function showError(message) {
        errorText.textContent = message;
        errorState.classList.remove('hidden');
    }

    function hideError() {
        errorState.classList.add('hidden');
    }
});

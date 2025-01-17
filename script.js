document.addEventListener('DOMContentLoaded', function() {
    const itemForm = document.getElementById('item-form');
    const formTitle = document.getElementById('form-title');
    const itemsContainer = document.getElementById('items-container');
    const searchInput = document.getElementById('search-input');
    const filterType = document.getElementById('filter-type');
    const loadMoreButton = document.getElementById('load-more');
    const noItemsMessage = document.getElementById('no-items-message');

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        if (itemForm) {
            itemForm.insertBefore(messageDiv, itemForm.firstChild);
        } else {
            document.body.insertBefore(messageDiv, document.body.firstChild);
        }
        setTimeout(() => messageDiv.remove(), 5000);
    }

    // Set form title based on URL parameter
    if (itemForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const itemType = urlParams.get('type');
        if (itemType === 'lost') {
            formTitle.textContent = 'Report a Lost Item';
        } else if (itemType === 'found') {
            formTitle.textContent = 'Report a Found Item';
        }

        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(itemForm);
            const itemData = Object.fromEntries(formData.entries());
            itemData.type = itemType || 'unknown';
            itemData.id = Date.now(); // Use timestamp as a temporary ID
            
            // Handle image upload
            const imageFile = formData.get('item-image');
            if (imageFile.size > 0) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    itemData.image = event.target.result;
                    saveItemData(itemData);
                };
                reader.readAsDataURL(imageFile);
            } else {
                saveItemData(itemData);
            }
        });
    }

    function saveItemData(itemData) {
        // Store item in localStorage (temporary solution)
        let items = JSON.parse(localStorage.getItem('items')) || [];
        items.push(itemData);
        localStorage.setItem('items', JSON.stringify(items));

        showMessage('Item reported successfully!', 'success');
        itemForm.reset();
    }

    let allItems = [];
    let displayedItems = 0;
    const itemsPerPage = 12;

    function loadItems() {
        allItems = JSON.parse(localStorage.getItem('items')) || [];
        displayItems();
    }

    function displayItems() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filterValue = filterType ? filterType.value : 'all';

        const filteredItems = allItems.filter(item => {
            const matchesSearch = item['item-name'].toLowerCase().includes(searchTerm) ||
                                  item['item-description'].toLowerCase().includes(searchTerm);
            const matchesFilter = filterValue === 'all' || item.type === filterValue;
            return matchesSearch && matchesFilter;
        });

        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            displayedItems = 0;

            if (filteredItems.length === 0) {
                noItemsMessage.classList.remove('hidden');
            } else {
                noItemsMessage.classList.add('hidden');
                showMoreItems(filteredItems);
            }
        }
    }

    function showMoreItems(items) {
        const itemsToShow = items.slice(displayedItems, displayedItems + itemsPerPage);
        itemsToShow.forEach(createItemCard);
        displayedItems += itemsToShow.length;

        if (loadMoreButton) {
            if (displayedItems >= items.length) {
                loadMoreButton.classList.add('hidden');
            } else {
                loadMoreButton.classList.remove('hidden');
            }
        }
    }

    function createItemCard(item) {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        let imageHtml = item.image ? `<img src="${item.image}" alt="${item['item-name']}">` : '';
        itemCard.innerHTML = `
            <h2>${item.type === 'lost' ? 'Lost' : 'Found'}: ${item['item-name']}</h2>
            ${imageHtml}
            <p><strong>Description:</strong> ${item['item-description']}</p>
            <p><strong>Location:</strong> ${item['item-location']}</p>
            <p><strong>Date:</strong> ${item['item-date']}</p>
            <p><strong>Contact:</strong> ${item['contact-name']} (${item['contact-email']})</p>
            <button class="button" onclick="markAsResolved(${item.id})">Mark as Resolved</button>
        `;
        itemsContainer.appendChild(itemCard);
    }

    if (itemsContainer) {
        loadItems();
        if (searchInput) searchInput.addEventListener('input', displayItems);
        if (filterType) filterType.addEventListener('change', displayItems);
        if (loadMoreButton) loadMoreButton.addEventListener('click', () => showMoreItems(allItems));
    }
});

function markAsResolved(itemId) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        localStorage.setItem('items', JSON.stringify(items));
        showMessage('Item marked as resolved and removed from the list.', 'success');
        setTimeout(() => location.reload(), 2000);
    } else {
        showMessage('Error: Item not found.', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    document.body.insertBefore(messageDiv, document.body.firstChild);
    setTimeout(() => messageDiv.remove(), 5000);
}

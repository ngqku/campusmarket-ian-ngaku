let currentCategory = 'all';

function setCategory(categoryName, clickedElement) {
  currentCategory = categoryName;

  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => pill.classList.remove('active'));
  clickedElement.classList.add('active');

 
  filterProducts();
}

//Filtering product cards based on serch input
function filterProducts() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  const productCards = document.querySelectorAll('.product-card');
  let visibleCount = 0;

  for (let i = 0; i < productCards.length; i++) {
    const card = productCards[i];
    

    const title = card.querySelector('.product-title').textContent.toLowerCase();
    const description = card.querySelector('.product-description').textContent.toLowerCase();
    const cardCategory = card.getAttribute('data-category');

    const matchesSearch = title.includes(searchQuery) || description.includes(searchQuery);
    const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);

    if (matchesSearch && matchesCategory) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  }

  // Live update visible count indicator
  const countElement = document.getElementById('results-count-num');
  if (countElement) {
    countElement.textContent = visibleCount;
  }
}

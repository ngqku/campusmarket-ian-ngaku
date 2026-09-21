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

// Global Cart State Array
let cartItems = [];

/**
 * Triggered on "Add to cart" button click.
 * Increments quantity by 1 on every press, updates card price display,
 * and syncs with persistent cart drawer & header badge.
 */
function addToCart(productId) {
  const card = document.getElementById(`product-${productId}`);
  const qtyInput = document.getElementById(`qty-input-${productId}`);
  const totalDisplay = document.getElementById(`total-price-${productId}`);

  if (!card || !qtyInput || !totalDisplay) return;

  // 1. Increment current quantity by 1 (starts at 1 if currently 0 or empty)
  let currentQty = parseInt(qtyInput.value) || 0;
  let newQty = currentQty + 1;

  // 2. Update quantity value on the product card
  qtyInput.value = newQty;

  // 3. Extract unit price from card DOM
  const priceElement = card.querySelector('.product-price');
  const priceText = priceElement ? priceElement.textContent : "0";
  const unitPrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

  // 4. Update the live card total amount
  const cardTotal = unitPrice * newQty;
  totalDisplay.textContent = cardTotal.toLocaleString();

  // 5. Update or add item in cartItems state
  const title = card.querySelector('.product-title').textContent.trim();
  const existingItem = cartItems.find(item => item.id === productId);

  if (existingItem) {
    existingItem.qty = newQty;
  } else {
    cartItems.push({
      id: productId,
      title: title,
      price: unitPrice,
      qty: newQty
    });
  }

  // 6. Provide instant button label feedback
  const cartBtn = document.getElementById(`btn-addtocart-${productId}`);
  if (cartBtn) {
    cartBtn.textContent = `In Cart (${newQty}) +1`;
    setTimeout(() => {
      cartBtn.textContent = "Add to cart";
    }, 1000);
  }

  // 7. Update drawer list and global header totals
  renderCartDrawer();
}

/**
 * Keeps card total and cart state synchronized if user manually types into the input box
 */
function syncQtyInput(productId) {
  const card = document.getElementById(`product-${productId}`);
  const qtyInput = document.getElementById(`qty-input-${productId}`);
  const totalDisplay = document.getElementById(`total-price-${productId}`);

  if (!card || !qtyInput || !totalDisplay) return;

  let qty = parseInt(qtyInput.value);

  // Validate manual input
  if (isNaN(qty) || qty < 0) {
    qty = 0;
    qtyInput.value = 0;
  }

  const priceText = card.querySelector('.product-price').textContent;
  const unitPrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
  totalDisplay.textContent = (unitPrice * qty).toLocaleString();

  const existingIndex = cartItems.findIndex(item => item.id === productId);

  if (qty === 0) {
    if (existingIndex > -1) cartItems.splice(existingIndex, 1);
  } else {
    const title = card.querySelector('.product-title').textContent.trim();
    if (existingIndex > -1) {
      cartItems[existingIndex].qty = qty;
    } else {
      cartItems.push({ id: productId, title, price: unitPrice, qty });
    }
  }

  renderCartDrawer();
}

/**
 * Removes an item from the cart drawer and resets its card counters back to 0
 */
function removeFromCart(productId) {
  // Remove item from state
  cartItems = cartItems.filter(item => item.id !== productId);

  // Reset product card counters back to zero
  const qtyInput = document.getElementById(`qty-input-${productId}`);
  const totalDisplay = document.getElementById(`total-price-${productId}`);

  if (qtyInput) qtyInput.value = 0;
  if (totalDisplay) totalDisplay.textContent = "0.0";

  renderCartDrawer();
}

/**
 * Renders slide-out cart contents and updates global header counters
 */
function renderCartDrawer() {
  const container = document.getElementById('cart-items-list');
  let totalCost = 0;
  let totalItemCount = 0;

  if (cartItems.length === 0) {
    container.innerHTML = `<p class="empty-cart-msg">Your cart is currently empty.</p>`;
  } else {
    let listHtml = '';

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const itemSubtotal = item.price * item.qty;
      totalCost += itemSubtotal;
      totalItemCount += item.qty;

      listHtml += `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <h4>${item.title}</h4>
            <p>Qty: ${item.qty} × KES ${item.price.toLocaleString()} = <strong>KES ${itemSubtotal.toLocaleString()}</strong></p>
          </div>
          <button class="cart-item-remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      `;
    }

    container.innerHTML = listHtml;
  }

  // Update persistent header button counters
  document.getElementById('global-cart-count').textContent = totalItemCount;
  document.getElementById('global-cart-total').textContent = totalCost.toLocaleString();
  document.getElementById('drawer-cart-total').textContent = totalCost.toLocaleString();
}

/**
 * Toggles visibility of the cart drawer
 */
function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');

  if (drawer && overlay) {
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

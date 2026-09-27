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
  const searchInput = document.getElementById('search-input');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const productCards = document.querySelectorAll('.product-card');

  if (productCards.length === 0) return;

  // Step 1: Check if any product title matches the typed search query
  let titleMatchFound = false;

  if (searchQuery !== '') {
    for (let i = 0; i < productCards.length; i++) {
      const titleEl = productCards[i].querySelector('.product-title');
      const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
      if (titleText.includes(searchQuery)) {
        titleMatchFound = true;
        break; 
      }
    }
  }

  // Step 2: Loop through cards and apply display logic
  let visibleCount = 0;

  for (let i = 0; i < productCards.length; i++) {
    const card = productCards[i];
    const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
    const titleEl = card.querySelector('.product-title');
    const cardTitle = titleEl ? titleEl.textContent.toLowerCase() : '';

    // A. Match active category pill selection
    const matchesPillCategory = (currentCategory === 'all' || cardCategory === currentCategory.toLowerCase());

    // B. Match search input (Title match first, Category fallback second)
    let matchesSearch = true;

    if (searchQuery !== '') {
      if (titleMatchFound) {
        // Direct title match
        matchesSearch = cardTitle.includes(searchQuery);
      } else {
        // Fallback: No titles matched, check if search word matches category name
        matchesSearch = cardCategory.includes(searchQuery);
      }
    }

    // C. Apply display state
    if (matchesPillCategory && matchesSearch) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  }

  // Step 3: Toggle empty state message if 0 products match
  const noResultsMsg = document.getElementById('no-results-msg');
  if (noResultsMsg) {
    noResultsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
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
  const errorMsgEl = document.getElementById(`qty-error-${productId}`);

  if (!card || !qtyInput || !totalDisplay) return;

  // 1. Read product-specific max stock from data-stock attribute
  const maxStock = parseInt(card.getAttribute('data-stock')) || 1;
  let currentQty = parseInt(qtyInput.value) || 0;

  // 2. VALIDATION: Check against item's specific stock limit
  if (currentQty >= maxStock) {
    if (errorMsgEl) {
      errorMsgEl.textContent = `Sold Out`;
      errorMsgEl.style.display = 'block';
    }
    return; // Stop execution
  }

  // Clear error if validation passes
  if (errorMsgEl) {
    errorMsgEl.style.display = 'none';
    errorMsgEl.textContent = '';
  }

  // 3. Increment & calculate normally
  let newQty = currentQty + 1;
  qtyInput.value = newQty;

  const priceText = card.querySelector('.product-price').textContent;
  const unitPrice = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
  const cardTotal = unitPrice * newQty;

  totalDisplay.textContent = cardTotal.toLocaleString();

  // 4. Update cart state
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


/**
 * CampusMarket - Authentication & Form Validation (Week 3)
 */

document.addEventListener('DOMContentLoaded', function () {

  // 1. DOM Element Selection
  const regForm = document.getElementById('registration-form');
  const alertBox = document.getElementById('form-alert');

  // Input Fields
  const fullNameInput = document.getElementById('full-name');
  const campusIdInput = document.getElementById('campus-id');
  const phoneInput = document.getElementById('phone-number');
  const emailInput = document.getElementById('student-email');
  const fileInput = document.getElementById('student-id-card');
  const idPreviewImg = document.getElementById('id-card-preview');
  const passwordInput = document.getElementById('account-password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  // Interactive UI Buttons
  const togglePw1 = document.getElementById('toggle-pw-1');
  const togglePw2 = document.getElementById('toggle-pw-2');


  // 2. Interactive UI Element #1: Show/Hide Password Toggle
  if (togglePw1 && passwordInput) {
    togglePw1.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePw1.textContent = 'Hide';
      } else {
        passwordInput.type = 'password';
        togglePw1.textContent = 'Show';
      }
    });
  }

  if (togglePw2 && confirmPasswordInput) {
    togglePw2.addEventListener('click', function () {
      if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        togglePw2.textContent = 'Hide';
      } else {
        confirmPasswordInput.type = 'password';
        togglePw2.textContent = 'Show';
      }
    });
  }


  // 3. Interactive UI Element #2: Live Student ID Image Preview
  if (fileInput && idPreviewImg) {
    fileInput.addEventListener('change', function (event) {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          idPreviewImg.src = e.target.result;
          idPreviewImg.style.display = 'block';
        };
        reader.readAsDataURL(selectedFile);
      } else {
        idPreviewImg.src = '';
        idPreviewImg.style.display = 'none';
      }
    });
  }


  // ---------------------------------------------------------------------------
  // 4. Form Submission & Validation Handler
  // ---------------------------------------------------------------------------
  if (regForm) {
    regForm.addEventListener('submit', function (event) {
      
      // CRITICAL REQUIREMENT: Prevent form from reloading page on submit
      event.preventDefault();

      // Clear previous alert messages
      hideAlert();

     
      const fullName = fullNameInput.value.trim();
      const campusId = campusIdInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const hasUploadedFile = fileInput.files.length > 0;


      // CHECK 1: Ensuring no crucial fields are left empty
      if (!fullName || !campusId || !phone || !email || !password || !confirmPassword) {
        showAlert('Please fill in all required text fields before submitting.', 'error');
        return;
      }

      if (!hasUploadedFile) {
        showAlert('Please upload a clear image of your Student ID card for admin verification.', 'error');
        return;
      }

      //CHECK 2: Ensuring phone number is valid (10 digits, numeric only)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        showAlert('Please enter a valid 10-digit phone number (numbers only).', 'error');
        phoneInput.focus();
        return;
      }

    
      // CHECK 3: Validating standard email pattern (e.g. user@domain.com)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert('Please enter a valid campus email address (e.g., student@campus.edu).', 'error');
        emailInput.focus();
        return;
      }

      // CHECK 4: Enforcing a minimum length of 6 characters
      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        passwordInput.focus();
        return;
      }
    
      // CHECK 5: Password and Confirm Password fields must match exactly
      if (password !== confirmPassword) {
        showAlert('Passwords do not match. Please re-enter your password.', 'error');
        confirmPasswordInput.focus();
        return;
      }

    
      // SUCCESS STATE: After all 5 validations pass
      showAlert('Success! Your account registration and Student ID image have been submitted for admin verification.', 'success');

      // Reset form after successful validation
      regForm.reset();
      if (idPreviewImg) idPreviewImg.style.display = 'none';

    });
  }

  // Helper Functions: Feedback Messages
  
  function showAlert(message, type) {
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = 'alert-box'; // Reset classes

    if (type === 'error') {
      alertBox.classList.add('alert-error');
    } else if (type === 'success') {
      alertBox.classList.add('alert-success');
    }

    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.textContent = '';
    }
  }

});
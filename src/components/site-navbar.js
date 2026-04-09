class SiteNavbar extends HTMLElement {
  // Makes the footer nav-bar as a componet for easier implementation, in the future.
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar fixed-bottom">
        <div class="container-fluid"></div>
        <button class="btn nav-home-btn" style="background:none; border:none; padding:8px;" onclick="window.location.href='/main.html'">
          <img src="/images/home.png" alt="Home" width="38" height="38" />
        </button>

        <button
          class="btn nav-menu-btn"
          type="button"
          style="background:none; border:none; padding:8px;"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <img src="/images/menu.png" alt="Menu" width="48" height="48" />
        </button>
        <div
          class="offcanvas offcanvas-end"
          tabindex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          data-bs-backdrop="false"
        >
          <div class="offcanvas-header">
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li class="nav-item">
                <a class="nav-link" href="/Slide-Out-Menu/MyAccount.html"
                  ><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rounded float-start navImage" style="padding:3px;">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  My Account
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/myGroups.html"
                  ><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rounded float-start navImage" style="padding:3px;">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  My Groups
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/report.html"
                  ><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rounded float-start navImage" style="padding:3px;">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                  Report
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/Slide-Out-Menu/settings.html"
                  ><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rounded float-start navImage" style="padding:3px;">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Settings
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" id="LogOutUser"
                  ><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rounded float-start navImage" style="padding:3px;">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log Out
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `;

    // ── Custom backdrop (Bootstrap's breaks inside custom elements) ──
    // grabs the offcanvas(slide out menu) element from navbar.
    var offcanvasEl = this.querySelector("#offcanvasNavbar");
    var backdrop = document.createElement("div");

    backdrop.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1040;transition:opacity 0.3s ease;opacity:0;pointer-events:none;";
    //inserting the backdrop into page
    offcanvasEl.parentNode.insertBefore(backdrop, offcanvasEl);

    // Makes the backdrop visible and lets it receive click events
    function showBackdrop() {
      backdrop.style.opacity = "1";
      backdrop.style.pointerEvents = "auto";
    }

    // Hides the backdrop and cleans up any leftover Bootstrap styling/elements
    // that Bootstrap adds to the body when a menu opens
    function hideBackdrop() {
      backdrop.style.opacity = "0";
      backdrop.style.pointerEvents = "none";
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
      document.querySelectorAll(".offcanvas-backdrop").forEach(function (el) {
        el.remove();
      });
    }

    //closes the slide out , when clicked.
    backdrop.addEventListener("click", function () {
      var instance = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (instance) instance.hide();
    });

    // When the menu starts opening → show the dark backdrop + sync dark mode
    offcanvasEl.addEventListener("show.bs.offcanvas", function() {
      showBackdrop();
      // Safari fix: check localStorage directly when offcanvas opens
      try {
        if (localStorage.getItem('darkMode') === 'true') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      } catch (e) {}
    });
    offcanvasEl.addEventListener("hidden.bs.offcanvas", function() {
      hideBackdrop();
      // Safari fix: when closing sidebar, sync dark mode to main page
      try {
        if (localStorage.getItem('darkMode') === 'true') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      } catch (e) {}
    });
  }
}

customElements.define("site-navbar", SiteNavbar);

// ── Dark Mode sync ──

// Apply dark mode immediately when navbar loads
(function() {
  try {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  } catch (e) {}
})();

// Listen for dark mode changes from other pages
window.addEventListener('darkModeChanged', function(e) {
  try {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  } catch (e) {}
});

// Listen for storage changes (from other tabs/windows)
window.addEventListener('storage', function(e) {
  if (e.key === 'darkMode') {
    if (e.newValue === 'true') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
});

// ── ------Dark Mode (toggled from settings page)----- ──

// Toggles dark mode on or off when called
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");

  //saves the darkmode preferance to local Storage .
  localStorage.setItem("darkMode", isDark);

  const settingsToggle = document.getElementById("darkModeToggle");
  if (settingsToggle) {
    //visially updates the toggle button
    settingsToggle.classList.toggle("on", isDark);
  }
}

// Expose toggleDarkMode globally so the settings page button can call it
// (needed because this file is a module and functions aren't global by default)!!
window.__toggleDarkMode = toggleDarkMode;

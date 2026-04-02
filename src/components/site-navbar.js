class SiteNavbar extends HTMLElement {
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
                  ><img src="/images/MyAccount/account.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
                  My Account
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/myGroups.html"
                  ><img src="/images/buddy.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
                  My Groups
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#"
                  ><img src="/images/buddy.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
                  Report an issue
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/Slide-Out-Menu/settings.html"
                  ><img src="/images/Settings-Images/settings.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
                  Settings
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#"
                  ><img src="/images/buddy.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
                  Exit App
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" id="LogOutUser"
                  ><img src="/images/buddy.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
                  Log Out
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define("site-navbar", SiteNavbar);

// ── Dark Mode (toggled from settings page) ──

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark);

  // Sync settings page toggle if present
  const settingsToggle = document.getElementById('darkModeToggle');
  if (settingsToggle) {
    settingsToggle.classList.toggle('on', isDark);
  }
}

// Expose globally so onclick can reach it
window.__toggleDarkMode = toggleDarkMode;
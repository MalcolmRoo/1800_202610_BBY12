class i extends HTMLElement{connectedCallback(){this.innerHTML=`
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
    `;var a=this.querySelector("#offcanvasNavbar"),e=document.createElement("div");e.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1040;transition:opacity 0.3s ease;opacity:0;pointer-events:none;",a.parentNode.insertBefore(e,a);function o(){e.style.opacity="1",e.style.pointerEvents="auto"}function s(){e.style.opacity="0",e.style.pointerEvents="none",document.body.classList.remove("modal-open"),document.body.style.removeProperty("overflow"),document.body.style.removeProperty("padding-right"),document.querySelectorAll(".offcanvas-backdrop").forEach(function(t){t.remove()})}e.addEventListener("click",function(){var t=bootstrap.Offcanvas.getInstance(a);t&&t.hide()}),a.addEventListener("show.bs.offcanvas",o),a.addEventListener("hidden.bs.offcanvas",s)}}customElements.define("site-navbar",i);function l(){const n=document.body.classList.toggle("dark-mode");localStorage.setItem("darkMode",n);const a=document.getElementById("darkModeToggle");a&&a.classList.toggle("on",n)}window.__toggleDarkMode=l;

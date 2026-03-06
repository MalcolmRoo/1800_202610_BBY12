class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <nav class="navbar fixed-bottom" style="background-color: #7B5EA0">
      <div class="container-fluid"></div>
      <button class="btn" href="#">
        <img src="/images/home.png" alt="Bootstrap" width="30" height="30" />
      </button>
      <button
        class="btn"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasNavbar"
        aria-controls="offcanvasNavbar"
        aria-label="Toggle navigation"
      >
        <img src="/images/menu.png" alt="Bootstrap" width="30" height="30" />
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
              <a class="nav-link" href="#"
                ><img src="/images/buddy.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
               My Account
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#"
                ><img src="/images/buddy.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
               Report an issue
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/settings.html"
                ><img src="public/images/Settings-Images/settings.png" width="30" height="30" class="rounded float-start navImage" alt="..."/>
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
              <a class="nav-link" href="#"
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
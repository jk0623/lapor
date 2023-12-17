import Swal from 'sweetalert2/dist/sweetalert2.all.min';
import { createSidebarTemplate, createTotalReportTemplate } from '../../templates/template-creator';
import NyokLaporAPI from '../../../data/data-source';

const ReportPage = {

  async render() {
    return `
  <section>
    <div id="admin-container" class=" bg-gray-200 font-sans flex flex-col lg:flex-row lg:h-full">
        <div id="sidebar" class="sm:hidden lg:flex flex-col bg-white text-white p-4">
        </div>

        <div id="content" class="lg:w-3/4 w-full p-8">
            <!-- Navbar -->
            <div class="flex justify-between items-center flex-col lg:flex-row mb-8">
                <!-- Pindahkan kotak pencarian ke sini -->
                <input type="text" class="p-2 border rounded-md mr-4 lg:w-1/2 w-full" placeholder="Cari...">
                <div class="flex items-center">
                    <button id="logout-button"class="bg-white text-black font-bold p-2 rounded-md hover:bg-blue-900">Logout</button>
                </div>
            </div>

            <!-- Tampilan Dashboard -->
            <div id="totalLaporanView" class="bg-white p-8 rounded-md shadow-md w-full h-screen">
            </div>
        </div>
    </div>
</section>
    `;
  },

  async afterRender() {
    const loginInfoAdmin = localStorage.getItem('loginInfoAdmin');

    if (!loginInfoAdmin || loginInfoAdmin === 'undefined') {
      Swal.fire({
        icon: 'info',
        title: 'Anda belum login',
        text: 'Mohon login untuk mengakses halaman admin ini.',
        showCancelButton: true,
        confirmButtonText: 'Log In',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('loginInfoAdmin');
          window.location.replace(`${window.location.origin}/?#/loginadmin`);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          localStorage.removeItem('loginInfoAdmin');
          window.location.replace(`${window.location.origin}/?#/loginadmin`);
        }
      });

      return;
    }

    const parsedLoginInfoAdmin = JSON.parse(loginInfoAdmin);

    const isTokenValid = await NyokLaporAPI.isTokenValid(parsedLoginInfoAdmin.expiresIn);

    if (isTokenValid) {
      Swal.fire({
        icon: 'info',
        title: 'Token Kadaluwarsa',
        text: 'Token Anda telah kadaluwarsa. Mohon login kembali.',
        showCancelButton: true,
        confirmButtonText: 'Log In',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('loginInfoAdmin');
          window.location.replace(`${window.location.origin}/?#/loginadmin`);
          window.location.reload();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          localStorage.removeItem('loginInfoAdmin');
          window.location.replace(`${window.location.origin}/?#/loginadmin`);
          window.location.reload();
        }
      });

      return;
    }

    await NyokLaporAPI.updateActivityAndTokenInfo('Admin', 10);

    const TotalReport = await NyokLaporAPI.getAdminTotalReport();

    const ReportPageContainer = document.querySelector('#totalLaporanView');
    const SidebarContainer = document.querySelector('#sidebar');
    const ProfileAdmin = await NyokLaporAPI.getAdminProfile();
    SidebarContainer.innerHTML = createSidebarTemplate(ProfileAdmin);
    ReportPageContainer.innerHTML = createTotalReportTemplate(TotalReport);

    const isAuthenticated = localStorage.getItem('loginInfoAdmin') !== null;
    if (isAuthenticated) {
      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', this.handleLogout.bind(this));
      }
    }

    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close');

    function openModal(imageSrc) {
      modal.style.display = 'block';
      modalImage.src = imageSrc;
    }

    function closeModalFunction() {
      modal.style.display = 'none';
    }

    document.getElementById('userTableBody').addEventListener('click', (event) => {
      const { target } = event;

      if (target.tagName === 'IMG') {
        const imageSrc = target.src;
        openModal(imageSrc);
      }
    });

    closeModal.addEventListener('click', closeModalFunction);

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModalFunction();
      }
    });

    const navbarHidden = document.querySelector('nav');
    navbarHidden.classList.add('hidden');
    const footerHidden = document.querySelector('footer');
    footerHidden.classList.add('hidden');
    const dashboardButton = document.getElementById('dashboard-button');
    const accountButton = document.getElementById('account-button');
    const buttonAccount = document.querySelector('#sidebar button[data-view="akun"]');
    const buttonDashboard = document.querySelector('#sidebar button[data-view="dashboard"]');
    const buttonTotalLaporan = document.querySelector('#sidebar button[data-view="totalLaporan"]');
    buttonTotalLaporan.classList.add('active');
    dashboardButton.addEventListener('click', () => {
      buttonDashboard.classList.add('active');
      buttonAccount.classList.remove('active');
      buttonTotalLaporan.classList.remove('active');
    });
    accountButton.addEventListener('click', () => {
      buttonAccount.classList.add('active');
      buttonDashboard.classList.remove('active');
      buttonTotalLaporan.classList.remove('active');
    });
  },

  async handleLogout() {
    localStorage.removeItem('loginInfoAdmin');

    window.location.hash = '/home';
    window.location.reload();
  },
};

export default ReportPage;
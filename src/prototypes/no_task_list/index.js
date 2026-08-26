/***********************************************************************************
Imports question manager, summary generator, answer piping and previous link history
************************************************************************************/
import '@ons/prototype-kit/src/helpers/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('existing-surveys-table');
  const pagination = document.getElementById('spp-survey-pagination');

  if (table && pagination) {
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const itemsPerPage = 10;
    const totalPages = Math.ceil(rows.length / itemsPerPage);
    let currentPage = 1;

    function renderPage(page) {
      currentPage = page;

      // 1. Show/hide table rows (10 per page)
      rows.forEach((row, idx) => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        if (idx >= start && idx < end) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });

      // 2. Update pagination buttons
      const paginationItems = Array.from(pagination.querySelectorAll('.ons-pagination__item'));
      const prevBtn = paginationItems.find(el => el.classList.contains('ons-pagination__item--previous'));
      const nextBtn = paginationItems.find(el => el.classList.contains('ons-pagination__item--next'));
      const pageBtns = paginationItems.filter(el => 
        !el.classList.contains('ons-pagination__item--previous') && 
        !el.classList.contains('ons-pagination__item--next')
      );

      // Reset active styles
      pageBtns.forEach(item => {
        item.classList.remove('ons-pagination__item--current');
        const link = item.querySelector('a');
        if (link) {
          link.removeAttribute('aria-current');
        }
      });

      // Set active style for current page
      const currentItem = pageBtns[currentPage - 1];
      if (currentItem) {
        currentItem.classList.add('ons-pagination__item--current');
        const link = currentItem.querySelector('a');
        if (link) {
          link.setAttribute('aria-current', 'true');
        }
      }

      // Show/hide previous & next buttons
      if (prevBtn) {
        prevBtn.style.display = currentPage === 1 ? 'none' : '';
      }
      if (nextBtn) {
        nextBtn.style.display = currentPage === totalPages ? 'none' : '';
      }
    }

    // Initialize to Page 1
    renderPage(1);

    // Attach click listeners to all pagination links
    const paginationLinks = pagination.querySelectorAll('.ons-pagination__link');
    paginationLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = link.closest('.ons-pagination__item');
        if (!parent) return;

        if (parent.classList.contains('ons-pagination__item--previous')) {
          if (currentPage > 1) {
            renderPage(currentPage - 1);
          }
        } else if (parent.classList.contains('ons-pagination__item--next')) {
          if (currentPage < totalPages) {
            renderPage(currentPage + 1);
          }
        } else {
          const pageNum = parseInt(link.textContent.trim(), 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            renderPage(pageNum);
          }
        }
      });
    });
  }

  // Handle survey link selection and store details in sessionStorage
  const surveyLinks = document.querySelectorAll('.spp-survey-select-link');
  surveyLinks.forEach(link => {
    link.addEventListener('click', () => {
      const surveyId = link.getAttribute('data-survey-id');
      const surveyCode = link.getAttribute('data-survey-code');
      const surveyName = link.getAttribute('data-survey-name');

      const surveyObj = {
        id: surveyId,
        code: surveyCode,
        name: surveyName
      };

      sessionStorage.setItem('current-survey', JSON.stringify(surveyObj));
    });
  });

  // Handle dynamic H1 replacement on survey.html
  if (window.location.pathname.includes('survey.html')) {
    const surveyH1 = document.querySelector('h1');
    if (surveyH1) {
      const rawSurvey = sessionStorage.getItem('current-survey');
      if (rawSurvey) {
        try {
          const survey = JSON.parse(rawSurvey);
          if (survey && survey.name && survey.id && survey.code) {
            surveyH1.textContent = `${survey.name} (${survey.code} - ${survey.id})`;
          } else {
            surveyH1.textContent = 'Manage Survey';
          }
        } catch (err) {
          console.error("Error parsing current-survey on survey page:", err);
          surveyH1.textContent = 'Manage Survey';
        }
      } else {
        surveyH1.textContent = 'Manage Survey';
      }
    }
  }
});

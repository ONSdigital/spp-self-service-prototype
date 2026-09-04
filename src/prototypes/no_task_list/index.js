/***********************************************************************************
Imports question manager, summary generator, answer piping and previous link history
************************************************************************************/
import '@ons/prototype-kit/src/helpers/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const rootPath = window.location.pathname.substring(0, window.location.pathname.indexOf('/views/'));
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

  // 1. Dynamic H1 Header Replacement on formslist.html
  if (window.location.pathname.includes('formslist.html')) {
    const formslistH1 = document.querySelector('h1');
    if (formslistH1) {
      const rawSurvey = sessionStorage.getItem('current-survey');
      if (rawSurvey) {
        try {
          const survey = JSON.parse(rawSurvey);
          if (survey && survey.name && survey.id) {
            formslistH1.textContent = `${survey.name} - ${survey.id}`;
          } else {
            formslistH1.textContent = 'Forms list - No survey selected';
          }
        } catch (err) {
          console.error("Error parsing current-survey on formslist page:", err);
          formslistH1.textContent = 'Forms list - No survey selected';
        }
      } else {
        formslistH1.textContent = 'Forms list - No survey selected';
      }
    }
  }

  // --- Forms List Dynamic Cards Rendering ---
  const accordionArea = document.getElementById('spp-forms-accordion-area');
  if (accordionArea) {
    const rawForms = sessionStorage.getItem('uploaded-forms');
    let formsList = [];
    if (rawForms) {
      try {
        formsList = JSON.parse(rawForms);
      } catch (err) {
        console.error("Error parsing uploaded-forms in formslist:", err);
      }
    }
    
    if (formsList && formsList.length > 0) {
      let html = '<div class="ons-grid">';
      
      formsList.forEach((form, index) => {
        const title = form.form_title || 'Untitled Form';
        const filename = form.filename || '';
        const formId = form.form_id || '';
        const version = form.version || '0.0.1';
        
        html += `
          <div class="ons-grid__col ons-col-6@m">
            <div class="ons-card" style="border: 1px solid var(--ons-color-borders); border-radius: 4px; padding: 1.5rem; margin-bottom: 1.5rem; background: var(--ons-color-white); height: calc(100% - 1.5rem); box-sizing: border-box;">
              <div class="ons-card__body">
                <h2 class="ons-card__title ons-u-fs-m" id="card-title-${index}" style="margin: 0 0 1rem 0;">
                  <a href="${rootPath}/views/configuration/forms/manageform.html?formIndex=${index}" class="ons-card__link">${title}</a>
                </h2>
                <div class="ons-card__content">
                  <dl class="spp-description-list" style="margin: 0; padding: 0; list-style: none;">
                    <div class="spp-description-list__item" style="display: flex; align-items: baseline; width: 100%; margin-bottom: 0.5rem;">
                      <dt class="spp-description-list__term" style="font-weight: bold; min-width: 140px; flex-shrink: 0; margin-right: 1rem;">File name:</dt>
                      <dd class="spp-description-list__value" style="margin: 0;">${filename}</dd>
                    </div>
                    <div class="spp-description-list__item" style="display: flex; align-items: baseline; width: 100%; margin-bottom: 0.5rem;">
                      <dt class="spp-description-list__term" style="font-weight: bold; min-width: 140px; flex-shrink: 0; margin-right: 1rem;">Form ID:</dt>
                      <dd class="spp-description-list__value" style="margin: 0;">${formId}</dd>
                    </div>
                  </dl>
                  <p style="margin: 0.5rem 0 0 0;"><a href="${rootPath}/views/configuration/forms/formpreview.html?formIndex=${index}&formTitle=${encodeURIComponent(title)}">Preview form</a></p>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      
      // Inject the dynamic HTML!
      accordionArea.innerHTML = html;
    }
  }

  // --- Upload JSON Page Multi-form Persistence & In-place Editing ---
  const btnSaveForms = document.getElementById('btn-save-forms');
  
  // Parse edit parameter if present in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const editIndexParam = urlParams.get('edit');
  const isEditMode = editIndexParam !== null;
  const editIndex = isEditMode ? parseInt(editIndexParam, 10) : -1;
  
  // 1. Pre-populate the fields and show associated file if we are in Edit Mode
  if (isEditMode && editIndex >= 0) {
    const rawForms = sessionStorage.getItem('uploaded-forms');
    let formsList = [];
    if (rawForms) {
      try {
        formsList = JSON.parse(rawForms);
      } catch (err) {
        console.error("Error parsing uploaded-forms for pre-population:", err);
      }
    }
    
    const editingForm = formsList[editIndex];
    if (editingForm) {
      const titleInput = document.getElementById('form-title');
      
      if (titleInput) titleInput.value = editingForm.form_title || '';
      
      // Dynamically display the currently associated filename next to the file uploader
      const fileInput = document.getElementById('survey-form-upload');
      if (fileInput) {
        const uploaderWrapper = fileInput.closest('.ons-field');
        if (uploaderWrapper) {
          const infoPara = document.createElement('p');
          infoPara.className = 'ons-u-mt-xs';
          infoPara.style.fontWeight = 'bold';
          infoPara.innerHTML = `Associated file: <code style="background: var(--ons-color-grey-15); padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace;">${editingForm.filename}</code>`;
          uploaderWrapper.appendChild(infoPara);
        }
      }
    }
  }

  // 2. Handle button click (Save & continue)
  if (btnSaveForms) {
    btnSaveForms.addEventListener('click', async (e) => {
      e.preventDefault(); // Intercept browser's instant navigation
      
      const fileInput = document.getElementById('survey-form-upload');
      const titleInput = document.getElementById('form-title');
      
      const formTitle = titleInput ? titleInput.value.trim() : '';
      
      // Retrieve the existing array of forms from sessionStorage
      let formsList = [];
      const existingList = sessionStorage.getItem('uploaded-forms');
      if (existingList) {
        try {
          formsList = JSON.parse(existingList);
        } catch (err) {
          console.error("Error parsing uploaded-forms from sessionStorage:", err);
        }
      }
      
      let filename = '';
      let shouldSave = false;
      let formId = '';
      let version = '0.0.1';
      
      // Helper function to extract metadata from the uploaded file asynchronously
      const getUploadedFormMetadata = (file) => {
        return new Promise((resolve) => {
          if (!file) {
            resolve({ version: '0.0.1', formId: 'Unknown ID' });
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const json = JSON.parse(evt.target.result);
              const ver = (json && json.schema_version) ? String(json.schema_version) : '0.0.1';
              const fid = (json && json.form_type) ? String(json.form_type) : 'Unknown ID';
              resolve({ version: ver, formId: fid });
            } catch (err) {
              console.warn("Unable to parse metadata from JSON, falling back:", err);
              resolve({ version: '0.0.1', formId: 'Unknown ID' });
            }
          };
          reader.onerror = () => {
            resolve({ version: '0.0.1', formId: 'Unknown ID' });
          };
          reader.readAsText(file);
        });
      };
      
      if (isEditMode && editIndex >= 0 && formsList[editIndex]) {
        // Edit Mode: check if a new file is uploaded, otherwise fall back to the existing filename
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          filename = fileInput.files[0].name;
          const metadata = await getUploadedFormMetadata(fileInput.files[0]);
          version = metadata.version;
          formId = metadata.formId;
        } else {
          filename = formsList[editIndex].filename; // Fall back to existing file name
          version = formsList[editIndex].version;   // Keep existing version unchanged
          formId = formsList[editIndex].form_id;    // Keep existing Form ID unchanged
        }
        
        shouldSave = true; // Always save in edit mode
      } else {
        // Create Mode: we must select a file to save
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          filename = fileInput.files[0].name;
          shouldSave = true;
          
          const metadata = await getUploadedFormMetadata(fileInput.files[0]);
          version = metadata.version;
          formId = metadata.formId;
        }
      }
      
      if (shouldSave) {
        const formEntity = {
          filename: filename,
          form_title: formTitle,
          form_id: formId,
          version: version
        };
        
        if (isEditMode && editIndex >= 0) {
          // Update in-place
          formsList[editIndex] = formEntity;
        } else {
          // Create / Append new form
          formsList.push(formEntity);
        }
        
        // Save the updated array back to sessionStorage
        sessionStorage.setItem('uploaded-forms', JSON.stringify(formsList));
      }
      
      // Perform navigation programmatically once the async operations have finished
      window.location.href = btnSaveForms.getAttribute('href') || (rootPath + "/views/configuration/forms/formslist.html");
    });
  }

  // Handle manageform.html logic
  if (window.location.pathname.includes('manageform.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const formIndexParam = urlParams.get('formIndex');
    if (formIndexParam !== null) {
      const formIndex = parseInt(formIndexParam, 10);
      const rawForms = sessionStorage.getItem('uploaded-forms');
      if (rawForms) {
        try {
          const formsList = JSON.parse(rawForms);
          const form = formsList[formIndex];
          if (form) {
            // Populate the summary values using row IDs and ONS span classes
            const titleEl = document.querySelector('#form-title-row .ons-summary__text');
            const idEl = document.querySelector('#form-id-row .ons-summary__text');
            const versionEl = document.querySelector('#form-version-row .ons-summary__text');
            const fileEl = document.querySelector('#uploaded-file-row .ons-summary__text');

            if (titleEl) titleEl.textContent = form.form_title || 'Untitled Form';
            if (idEl) idEl.textContent = form.form_id || '';
            if (versionEl) versionEl.textContent = form.version || '0.0.1';
            if (fileEl) fileEl.textContent = form.filename || '';

            // Update change links
            const changeTitleBtn = document.querySelector('#form-title-row a.ons-summary__button') || document.querySelector('#form-title-row a');
            const changeFileBtn = document.querySelector('#uploaded-file-row a.ons-summary__button') || document.querySelector('#uploaded-file-row a');

            const editUrl = `${rootPath}/views/configuration/forms/uploadjson.html?edit=${formIndex}`;
            if (changeTitleBtn) changeTitleBtn.setAttribute('href', editUrl);
            if (changeFileBtn) changeFileBtn.setAttribute('href', editUrl);
          }
        } catch (err) {
          console.error("Error loading form details on manageform page:", err);
        }
      }
    }
  }

  // Handle version link selection and store details in sessionStorage
  const versionLinks = document.querySelectorAll('.spp-version-select-link');
  versionLinks.forEach(link => {
    link.addEventListener('click', () => {
      const versionName = link.getAttribute('data-version-name');
      sessionStorage.setItem('current-version-name', versionName || '');
    });
  });

  // Handle dynamic H1 replacement on formpreview.html
  if (window.location.pathname.includes('formpreview.html')) {
    const previewH1 = document.getElementById('form-preview-h1');
    if (previewH1) {
      const urlParams = new URLSearchParams(window.location.search);
      const formIndexParam = urlParams.get('formIndex');
      if (formIndexParam !== null) {
        const formIndex = parseInt(formIndexParam, 10);
        const rawForms = sessionStorage.getItem('uploaded-forms');
        if (rawForms) {
          try {
            const formsList = JSON.parse(rawForms);
            const form = formsList[formIndex];
            if (form) {
              const title = form.form_title || 'Untitled Form';
              const formId = form.form_id || 'Unknown ID';
              previewH1.textContent = `${title} - ${formId}`;
            } else {
              previewH1.textContent = 'Form preview';
            }
          } catch (err) {
            console.error("Error loading form details on formpreview page:", err);
            previewH1.textContent = 'Form preview';
          }
        } else {
          previewH1.textContent = 'Form preview';
        }
      } else {
        const formTitle = urlParams.get('formTitle');
        const formId = urlParams.get('formId');
        if (formTitle && formId) {
          previewH1.textContent = `${formTitle} - ${formId}`;
        } else {
          previewH1.textContent = 'Form preview';
        }
      }
    }
  }

  // Clear data footer link
  const clearDataLink = document.getElementById('clear-data-link') || Array.from(document.querySelectorAll('.ons-footer a')).find(el => el.textContent.trim() === 'Clear data');
  if (clearDataLink) {
    clearDataLink.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.clear();
      window.location.reload();
    });
  }
});

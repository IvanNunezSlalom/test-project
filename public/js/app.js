const API_URL = 'http://localhost:3000/api';

let currentProject = null;
let currentResource = null;
let editMode = false;

// DOM Elements
const projectsGrid = document.getElementById('projects-grid');
const addProjectBtn = document.getElementById('add-project-btn');
const projectModal = document.getElementById('project-modal');
const resourceModal = document.getElementById('resource-modal');
const projectForm = document.getElementById('project-form');
const resourceForm = document.getElementById('resource-form');
const modalTitle = document.getElementById('modal-title');
const resourceModalTitle = document.getElementById('resource-modal-title');
const resourceType = document.getElementById('resource-type');
const urlGroup = document.getElementById('url-group');
const pathGroup = document.getElementById('path-group');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  addProjectBtn.addEventListener('click', () => openProjectModal());

  projectModal.querySelectorAll('.close')[0].addEventListener('click', closeProjectModal);
  resourceModal.querySelectorAll('.close')[0].addEventListener('click', closeResourceModal);

  document.getElementById('cancel-btn').addEventListener('click', closeProjectModal);
  document.getElementById('cancel-resource-btn').addEventListener('click', closeResourceModal);

  projectForm.addEventListener('submit', handleProjectSubmit);
  resourceForm.addEventListener('submit', handleResourceSubmit);

  resourceType.addEventListener('change', (e) => {
    if (e.target.value === 'link') {
      urlGroup.style.display = 'block';
      pathGroup.style.display = 'none';
      document.getElementById('resource-url').required = true;
      document.getElementById('resource-path').required = false;
    } else {
      urlGroup.style.display = 'none';
      pathGroup.style.display = 'block';
      document.getElementById('resource-url').required = false;
      document.getElementById('resource-path').required = true;
    }
  });

  window.addEventListener('click', (e) => {
    if (e.target === projectModal) closeProjectModal();
    if (e.target === resourceModal) closeResourceModal();

    // Close dropdowns when clicking outside
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });
}

// API Calls
async function loadProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`);
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    console.error('Failed to load projects:', error);
    projectsGrid.innerHTML = '<div class="empty-state"><h2>Failed to load projects</h2></div>';
  }
}

async function createProject(projectData) {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  return response.json();
}

async function updateProject(id, projectData) {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  return response.json();
}

async function deleteProject(id) {
  await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
}

async function createResource(projectId, resourceData) {
  const response = await fetch(`${API_URL}/projects/${projectId}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData)
  });
  return response.json();
}

async function updateResource(projectId, resourceId, resourceData) {
  const response = await fetch(`${API_URL}/projects/${projectId}/resources/${resourceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData)
  });
  return response.json();
}

async function deleteResource(projectId, resourceId) {
  await fetch(`${API_URL}/projects/${projectId}/resources/${resourceId}`, { method: 'DELETE' });
}

// Render Functions
function renderProjects(projects) {
  if (projects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="empty-state">
        <h2>No projects yet</h2>
        <p>Click "New project" to get started</p>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = projects.map(project => `
    <div class="project-card">
      <div class="project-header">
        <div>
          <h2 class="project-title">${escapeHtml(project.name)}</h2>
          <div class="project-meta">Created: ${new Date(project.createdAt).toLocaleDateString()}</div>
        </div>
        <div class="project-actions dropdown">
          <button class="btn-icon" onclick="toggleDropdown(event, 'project-${project.id}')" aria-label="Actions">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </button>
          <div class="dropdown-menu" id="project-${project.id}">
            <button class="dropdown-item" onclick="editProject('${project.id}')">Edit</button>
            <button class="dropdown-item dropdown-item-danger" onclick="confirmDeleteProject('${project.id}')">Delete</button>
          </div>
        </div>
      </div>
      ${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ''}
      <div class="resources">
        <div class="resources-header">
          <h3>Resources (${project.resources.length})</h3>
          <button class="btn btn-small btn-primary" onclick="openResourceModal('${project.id}')">+ Add</button>
        </div>
        ${renderResources(project)}
      </div>
    </div>
  `).join('');
}

function renderResources(project) {
  if (project.resources.length === 0) {
    return '<p style="color: #999; font-size: 0.9rem;">No resources yet</p>';
  }

  return `
    <ul class="resource-list">
      ${project.resources.map(resource => `
        <li class="resource-item">
          <div class="resource-info">
            <span class="resource-type ${resource.type}">${resource.type}</span>
            <a class="resource-name" href="#" onclick="openResource('${resource.type}', '${resource.url || resource.path}'); return false;">
              ${escapeHtml(resource.name)}
            </a>
          </div>
          <div class="resource-actions dropdown">
            <button class="btn-icon" onclick="toggleDropdown(event, 'resource-${resource.id}')" aria-label="Actions">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
              </svg>
            </button>
            <div class="dropdown-menu" id="resource-${resource.id}">
              <button class="dropdown-item" onclick="editResource('${project.id}', '${resource.id}')">Edit</button>
              <button class="dropdown-item dropdown-item-danger" onclick="confirmDeleteResource('${project.id}', '${resource.id}')">Delete</button>
            </div>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

// Modal Functions
function openProjectModal(project = null) {
  editMode = !!project;
  currentProject = project;

  modalTitle.textContent = editMode ? 'Edit project' : 'Add new project';
  document.getElementById('project-name').value = project?.name || '';
  document.getElementById('project-description').value = project?.description || '';

  projectModal.classList.add('active');
}

function closeProjectModal() {
  projectModal.classList.remove('active');
  projectForm.reset();
  currentProject = null;
  editMode = false;
}

function openResourceModal(projectId, resource = null) {
  currentProject = projectId;
  currentResource = resource;
  editMode = !!resource;

  resourceModalTitle.textContent = editMode ? 'Edit resource' : 'Add resource';
  document.getElementById('resource-type').value = resource?.type || 'link';
  document.getElementById('resource-name').value = resource?.name || '';
  document.getElementById('resource-url').value = resource?.url || '';
  document.getElementById('resource-path').value = resource?.path || '';

  // Trigger change event to show/hide fields
  resourceType.dispatchEvent(new Event('change'));

  resourceModal.classList.add('active');
}

function closeResourceModal() {
  resourceModal.classList.remove('active');
  resourceForm.reset();
  currentProject = null;
  currentResource = null;
  editMode = false;
}

// Form Handlers
async function handleProjectSubmit(e) {
  e.preventDefault();

  const projectData = {
    name: document.getElementById('project-name').value,
    description: document.getElementById('project-description').value
  };

  try {
    if (editMode) {
      await updateProject(currentProject.id, projectData);
    } else {
      await createProject(projectData);
    }
    closeProjectModal();
    loadProjects();
  } catch (error) {
    console.error('Failed to save project:', error);
    alert('Failed to save project');
  }
}

async function handleResourceSubmit(e) {
  e.preventDefault();

  const type = document.getElementById('resource-type').value;
  const resourceData = {
    type,
    name: document.getElementById('resource-name').value,
    url: type === 'link' ? document.getElementById('resource-url').value : null,
    path: type !== 'link' ? document.getElementById('resource-path').value : null
  };

  try {
    if (editMode) {
      await updateResource(currentProject, currentResource.id, resourceData);
    } else {
      await createResource(currentProject, resourceData);
    }
    closeResourceModal();
    loadProjects();
  } catch (error) {
    console.error('Failed to save resource:', error);
    alert('Failed to save resource');
  }
}

// Action Functions
async function editProject(projectId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`);
    const project = await response.json();
    openProjectModal(project);
  } catch (error) {
    console.error('Failed to load project:', error);
  }
}

async function confirmDeleteProject(projectId) {
  if (confirm('Are you sure you want to delete this project and all its resources?')) {
    try {
      await deleteProject(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  }
}

async function editResource(projectId, resourceId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`);
    const project = await response.json();
    const resource = project.resources.find(r => r.id === resourceId);
    openResourceModal(projectId, resource);
  } catch (error) {
    console.error('Failed to load resource:', error);
  }
}

async function confirmDeleteResource(projectId, resourceId) {
  if (confirm('Are you sure you want to delete this resource?')) {
    try {
      await deleteResource(projectId, resourceId);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    }
  }
}

function openResource(type, location) {
  if (type === 'link') {
    window.open(location, '_blank');
  } else {
    alert(`File path: ${location}\n\nNote: Direct file opening from browser requires additional setup.`);
  }
}

// Dropdown Functions
function toggleDropdown(event, menuId) {
  event.stopPropagation();

  // Close all other dropdowns
  document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
    if (menu.id !== menuId) {
      menu.classList.remove('active');
    }
  });

  // Toggle the clicked dropdown
  const menu = document.getElementById(menuId);
  menu.classList.toggle('active');
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

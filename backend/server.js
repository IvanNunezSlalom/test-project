const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');

// Ensure data directory and file exist
async function initializeData() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ projects: [] }, null, 2));
  }
}

// Read projects from file
async function readProjects() {
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write projects to file
async function writeProjects(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const data = await readProjects();
    res.json(data.projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const data = await readProjects();
    const project = data.projects.find(p => p.id === req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read project' });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const data = await readProjects();
    const newProject = {
      id: Date.now().toString(),
      name: req.body.name,
      description: req.body.description || '',
      createdAt: new Date().toISOString(),
      resources: []
    };
    data.projects.push(newProject);
    await writeProjects(data);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const data = await readProjects();
    const index = data.projects.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      data.projects[index] = {
        ...data.projects[index],
        name: req.body.name,
        description: req.body.description,
        updatedAt: new Date().toISOString()
      };
      await writeProjects(data);
      res.json(data.projects[index]);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const data = await readProjects();
    data.projects = data.projects.filter(p => p.id !== req.params.id);
    await writeProjects(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Add resource to project
app.post('/api/projects/:id/resources', async (req, res) => {
  try {
    const data = await readProjects();
    const project = data.projects.find(p => p.id === req.params.id);
    if (project) {
      const newResource = {
        id: Date.now().toString(),
        type: req.body.type, // 'link', 'local-file', 'shared-file'
        name: req.body.name,
        url: req.body.url,
        path: req.body.path,
        createdAt: new Date().toISOString()
      };
      project.resources.push(newResource);
      await writeProjects(data);
      res.status(201).json(newResource);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add resource' });
  }
});

// Update resource
app.put('/api/projects/:projectId/resources/:resourceId', async (req, res) => {
  try {
    const data = await readProjects();
    const project = data.projects.find(p => p.id === req.params.projectId);
    if (project) {
      const resourceIndex = project.resources.findIndex(r => r.id === req.params.resourceId);
      if (resourceIndex !== -1) {
        project.resources[resourceIndex] = {
          ...project.resources[resourceIndex],
          type: req.body.type,
          name: req.body.name,
          url: req.body.url,
          path: req.body.path,
          updatedAt: new Date().toISOString()
        };
        await writeProjects(data);
        res.json(project.resources[resourceIndex]);
      } else {
        res.status(404).json({ error: 'Resource not found' });
      }
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete resource
app.delete('/api/projects/:projectId/resources/:resourceId', async (req, res) => {
  try {
    const data = await readProjects();
    const project = data.projects.find(p => p.id === req.params.projectId);
    if (project) {
      project.resources = project.resources.filter(r => r.id !== req.params.resourceId);
      await writeProjects(data);
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

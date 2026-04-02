const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('task routes', () => {
  let seededTasks;

  beforeEach(() => {
    taskService._reset();
    seededTasks = [
      taskService.create({
        title: 'Plan sprint',
        description: 'Prepare backlog',
        status: 'todo',
        priority: 'high',
      }),
      taskService.create({
        title: 'Build feature',
        description: 'Implement endpoint',
        status: 'in_progress',
        priority: 'medium',
      }),
      taskService.create({
        title: 'Ship release',
        description: 'Deploy to production',
        status: 'done',
        priority: 'low',
      }),
    ];
  });

  test('GET /tasks returns all tasks', async () => {
    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].title).toBe('Plan sprint');
  });

  test('GET /tasks filters by status', async () => {
    const response = await request(app).get('/tasks').query({ status: 'todo' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Plan sprint');
  });

  test('GET /tasks paginates results', async () => {
    const response = await request(app).get('/tasks').query({ page: 2, limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Build feature');
  });

  test('GET /tasks/stats returns counts and overdue total', async () => {
    taskService._reset();
    taskService.create({ title: 'Overdue', dueDate: '2020-01-01T00:00:00.000Z' });
    taskService.create({ title: 'Done overdue', status: 'done', dueDate: '2020-01-01T00:00:00.000Z' });
    taskService.create({ title: 'In progress', status: 'in_progress' });

    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      todo: 1,
      in_progress: 1,
      done: 1,
      overdue: 1,
    });
  });

  test('POST /tasks creates a task', async () => {
    const response = await request(app).post('/tasks').send({
      title: 'Write docs',
      description: 'Document the API',
      priority: 'high',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Write docs',
      description: 'Document the API',
      status: 'todo',
      priority: 'high',
      assignee: null,
    });
    expect(response.body.id).toEqual(expect.any(String));
  });

  test('POST /tasks rejects an empty title', async () => {
    const response = await request(app).post('/tasks').send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'title is required and must be a non-empty string' });
  });

  test('PUT /tasks/:id updates a task', async () => {
    const response = await request(app).put(`/tasks/${seededTasks[0].id}`).send({
      title: 'Plan sprint v2',
      status: 'in_progress',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seededTasks[0].id,
      title: 'Plan sprint v2',
      status: 'in_progress',
    });
  });

  test('PUT /tasks/:id returns 404 for missing task', async () => {
    const response = await request(app).put('/tasks/missing-id').send({ title: 'New title' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Task not found' });
  });

  test('DELETE /tasks/:id removes a task', async () => {
    const response = await request(app).delete(`/tasks/${seededTasks[0].id}`);

    expect(response.status).toBe(204);
    expect(taskService.findById(seededTasks[0].id)).toBeUndefined();
  });

  test('DELETE /tasks/:id returns 404 for missing task', async () => {
    const response = await request(app).delete('/tasks/missing-id');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Task not found' });
  });

  test('PATCH /tasks/:id/complete marks a task complete', async () => {
    const response = await request(app).patch(`/tasks/${seededTasks[1].id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seededTasks[1].id,
      status: 'done',
      priority: 'medium',
    });
    expect(response.body.completedAt).toEqual(expect.any(String));
  });

  test('PATCH /tasks/:id/complete keeps the existing priority', async () => {
    const response = await request(app).patch(`/tasks/${seededTasks[0].id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seededTasks[0].id,
      status: 'done',
      priority: 'high',
    });
  });

  test('PATCH /tasks/:id/assign stores the assignee', async () => {
    const response = await request(app).patch(`/tasks/${seededTasks[1].id}/assign`).send({
      assignee: 'Piyush',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seededTasks[1].id,
      assignee: 'Piyush',
    });
  });

  test('PATCH /tasks/:id/assign rejects an empty assignee', async () => {
    const response = await request(app).patch(`/tasks/${seededTasks[1].id}/assign`).send({
      assignee: '   ',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'assignee must be a non-empty string' });
  });

  test('PATCH /tasks/:id/assign returns 404 for missing task', async () => {
    const response = await request(app).patch('/tasks/missing-id/assign').send({
      assignee: 'Piyush',
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Task not found' });
  });
});
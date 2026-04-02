const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('create sets default fields and stores assignee', () => {
    const task = taskService.create({ title: 'Write tests' });

    expect(task).toMatchObject({
      title: 'Write tests',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assignee: null,
      completedAt: null,
    });
    expect(task.id).toEqual(expect.any(String));
    expect(task.createdAt).toEqual(expect.any(String));
  });

  test('getByStatus returns matching tasks', () => {
    const todoTask = taskService.create({ title: 'Todo task', status: 'todo' });
    taskService.create({ title: 'Done task', status: 'done' });

    expect(taskService.getByStatus('todo')).toEqual([todoTask]);
  });

  test('getPaginated uses 1-based page numbers', () => {
    const first = taskService.create({ title: 'First' });
    const second = taskService.create({ title: 'Second' });
    const third = taskService.create({ title: 'Third' });

    expect(taskService.getPaginated(1, 2)).toEqual([first, second]);
    expect(taskService.getPaginated(2, 2)).toEqual([third]);
  });

  test('getStats counts status totals and overdue tasks', () => {
    taskService.create({ title: 'Overdue', dueDate: '2020-01-01T00:00:00.000Z' });
    taskService.create({ title: 'Done overdue', status: 'done', dueDate: '2020-01-01T00:00:00.000Z' });
    taskService.create({ title: 'In progress' , status: 'in_progress' });

    expect(taskService.getStats()).toMatchObject({
      todo: 1,
      in_progress: 1,
      done: 1,
      overdue: 1,
    });
  });

  test('assignTask stores the assignee', () => {
    const task = taskService.create({ title: 'Assign me' });

    const updated = taskService.assignTask(task.id, 'Piyush');

    expect(updated).toMatchObject({
      id: task.id,
      assignee: 'Piyush',
    });
    expect(taskService.findById(task.id)).toMatchObject({ assignee: 'Piyush' });
  });

  test('assignTask returns null when the task does not exist', () => {
    expect(taskService.assignTask('missing-id', 'Piyush')).toBeNull();
  });

  test('completeTask preserves the task priority', () => {
    const task = taskService.create({ title: 'Finish this', priority: 'high' });

    const completed = taskService.completeTask(task.id);

    expect(completed).toMatchObject({
      id: task.id,
      status: 'done',
      priority: 'high',
    });
  });
});
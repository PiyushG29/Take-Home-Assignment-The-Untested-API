const { validateCreateTask, validateUpdateTask, validateAssignTask } = require('../src/utils/validators');

describe('validators', () => {
  test('validateCreateTask rejects a missing title', () => {
    expect(validateCreateTask({})).toBe('title is required and must be a non-empty string');
  });

  test('validateCreateTask rejects a non-string title', () => {
    expect(validateCreateTask({ title: 123 })).toBe('title is required and must be a non-empty string');
  });

  test('validateCreateTask rejects an invalid status', () => {
    expect(validateCreateTask({ title: 'Task', status: 'blocked' })).toBe('status must be one of: todo, in_progress, done');
  });

  test('validateCreateTask rejects an invalid priority', () => {
    expect(validateCreateTask({ title: 'Task', priority: 'urgent' })).toBe('priority must be one of: low, medium, high');
  });

  test('validateCreateTask rejects an invalid due date', () => {
    expect(validateCreateTask({ title: 'Task', dueDate: 'not-a-date' })).toBe('dueDate must be a valid ISO date string');
  });

  test('validateUpdateTask rejects an empty title', () => {
    expect(validateUpdateTask({ title: '   ' })).toBe('title must be a non-empty string');
  });

  test('validateUpdateTask rejects an invalid status', () => {
    expect(validateUpdateTask({ status: 'blocked' })).toBe('status must be one of: todo, in_progress, done');
  });

  test('validateUpdateTask rejects an invalid priority', () => {
    expect(validateUpdateTask({ priority: 'urgent' })).toBe('priority must be one of: low, medium, high');
  });

  test('validateUpdateTask rejects an invalid due date', () => {
    expect(validateUpdateTask({ dueDate: 'not-a-date' })).toBe('dueDate must be a valid ISO date string');
  });

  test('validateAssignTask rejects a missing assignee', () => {
    expect(validateAssignTask({})).toBe('assignee must be a non-empty string');
  });

  test('validateAssignTask rejects an empty assignee', () => {
    expect(validateAssignTask({ assignee: '   ' })).toBe('assignee must be a non-empty string');
  });

  test('validateAssignTask accepts a trimmed name string', () => {
    expect(validateAssignTask({ assignee: 'Piyush' })).toBeNull();
  });
});
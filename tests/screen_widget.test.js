import { ListScreen } from '../dist/shiny-drums/screen_widgets.js'

test('next sets correct selected index', () => {
  const menu = new ListScreen(3, ['a', 'b', 'c']);
  menu.next();
  expect(menu.selected).toBe(1);
});

test('selected cannot exceed first item', () => {
  const menu = new ListScreen(2, ['a', 'b', 'c']);
  menu.prev();
  expect(menu.selected).toBe(0);
});

test('selected cannot exceed last item', () => {
  const menu = new ListScreen(3, ['a', 'b', 'c']);
  menu.next();
  menu.next();
  menu.next();
  expect(menu.selected).toBe(2);
});

test('viewport scrolls down when item offscreen on bottom', () => {
  const menu = new ListScreen(2, ['a', 'b', 'c']);
  menu.next();
  menu.next();
  expect(menu.selected).toBe(2);
  expect(menu.viewportSelected).toBe(1);
  expect(menu.visibleItems).toEqual(['b', 'c']);
});

test('viewport scrolls up when item offscreen on top', () => {
  const menu = new ListScreen(2, ['a', 'b', 'c']);
  menu.next();
  menu.next();
  menu.prev();
  menu.prev();
  expect(menu.selected).toBe(0);
  expect(menu.viewportSelected).toBe(0);
  expect(menu.visibleItems).toEqual(['a', 'b']);
});
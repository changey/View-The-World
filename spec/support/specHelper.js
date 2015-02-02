jasmine.content = $('#jasmine-content');
jasmine.getJSONFixtures().fixturesPath = 'spec/jasmine/fixtures';

beforeEach(function () {
  jasmine.Ajax.installMock();
});

afterEach(function () {
  jasmine.Ajax.uninstallMock();
  jasmine.content.html("");
  window.localStorage.clear();
});
const generateRoutes = require("nextjs-swagger-auto");

test('generateRoutes', () => {
    let res = generateRoutes("./tests", {});
    expect(String(res)).toMatch(/file created/);
});
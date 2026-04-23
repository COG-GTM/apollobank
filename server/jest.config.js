module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	coveragePathIgnorePatterns: ['/node_modules/', '/entity/', 'index.ts', 'MyContext.ts'],
};

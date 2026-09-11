module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	testMatch: ["<rootDir>/src/**/*.test.ts"],
	collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/seed.ts"],
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
};

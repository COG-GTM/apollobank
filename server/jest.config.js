module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	testMatch: ["<rootDir>/src/**/*.test.ts"],
	collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/seed.ts"],
};

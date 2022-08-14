install:
	npm ci
lint:
	npx eslint .
publish:
	npm publish --dry-run
test:
	npm test
test-coverage:
	npm test-- --coverage --coverageProvider=v8

.PHONY: test

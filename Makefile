.PHONY: tsp prism frontend backend e2e docker-build docker-run

tsp:
	cd api-contract && npm ci && npm run compile

prism:
	cd frontend && npx prism mock ../api-contract/openapi.yaml --port 4010 --cors

backend:
	cd backend && npm ci && npm run dev

frontend:
	cd frontend && SCARF_ANALYTICS=false npm ci && npm run dev

e2e:
	cd e2e && npm ci && npx playwright install --with-deps chromium && npm test

docker-build:
	docker build -t call-booking .

docker-run:
	docker run --rm -e PORT=8080 -p 8080:8080 call-booking

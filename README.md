# Purmp

A framework for building HTTP-Accessed Data Structures

## Demo

### Boot Postgres

```sh
docker-compose up -d
```

### Start System

```sh
# using pnpm
pnpm i #https://pnpm.io/cli/install
pnpm run dev

# usin npm
npm i
npm run dev
```

### Make Healthcheck

```sh
# Without trace ID
curl localhost:5050/healthcheck
# With a trace ID
curl -H 'X-Trace-Id: some-trace-id' localhost:5050/healthcheck
```

You should see the Trace IDs and Span IDs set correctly in the log output of `run dev`

## Example Output

![Startup Example 1](https://imgur.com/tmjjt3B.png)
![Startup Example 2](https://imgur.com/iJW5YF6.png)
![Healthcheck Output Example 1](https://imgur.com/KqBjf7e.png)

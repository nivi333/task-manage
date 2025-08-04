# Performance & Load Testing Guide

## Load Testing Scenarios
- Use JMeter, k6, or Gatling to simulate 100, 500, 1000+ concurrent users
- Test endpoints: `/api/tasks`, `/api/projects`, `/api/webhooks`, `/api/files/upload`
- Measure throughput, error rate, and latency

## Scalability Testing
- Gradually increase load to find system limits
- Monitor CPU, memory, DB connections, and response times

## Database Performance
- Use pg_stat_statements (Postgres) or similar to profile slow queries
- Add indexes as needed for slow queries

## API Response Time Benchmarks
- Record average and 95th percentile response times for each endpoint
- Set SLOs (e.g., 95% of requests < 500ms)

## Stress Testing
- Spike test with sudden high load
- Test recovery after overload

## Performance Monitoring
- Enable Spring Boot Actuator endpoints
- Integrate with Prometheus/Grafana for real-time monitoring
- Set up alerts for latency, error rate, and resource exhaustion

# Task Management API — Code Examples

## Create Task

### JavaScript (fetch)
```javascript
fetch('http://localhost:8080/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <JWT_TOKEN>'
  },
  body: JSON.stringify({
    title: 'New Task',
    description: 'Demo task',
    priority: 'HIGH',
    status: 'OPEN'
  })
})
.then(res => res.json())
.then(console.log);
```

### Python (requests)
```python
import requests

headers = {
    'Authorization': 'Bearer <JWT_TOKEN>',
    'Content-Type': 'application/json'
}
data = {
    'title': 'New Task',
    'description': 'Demo task',
    'priority': 'HIGH',
    'status': 'OPEN'
}
response = requests.post('http://localhost:8080/api/tasks', json=data, headers=headers)
print(response.json())
```

### cURL
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{"title": "New Task", "description": "Demo task", "priority": "HIGH", "status": "OPEN"}'
```

---

## List Tasks (with Pagination)

### JavaScript (fetch)
```javascript
fetch('http://localhost:8080/api/tasks?page=0&size=10', {
  headers: {
    'Authorization': 'Bearer <JWT_TOKEN>'
  }
})
.then(res => res.json())
.then(console.log);
```

### Python (requests)
```python
response = requests.get('http://localhost:8080/api/tasks?page=0&size=10',
                       headers={'Authorization': 'Bearer <JWT_TOKEN>'})
print(response.json())
```

### cURL
```bash
curl -H 'Authorization: Bearer <JWT_TOKEN>' \
  'http://localhost:8080/api/tasks?page=0&size=10'
```

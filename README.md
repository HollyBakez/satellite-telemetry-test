# satellite-telemetry-test

Approach:

Assumptions Made:
 - For altitude and velocity I went with the assumption that the business logic would require float vs int because we may need precision for any follow-up actions, tracking for faults or to adhere to boundaries. Since the prompt doesn't specificy beyond number, to make sure the API is flexible for different use cases I decided to go with float.
 -

How to run backend API locally:

2 methods:

(Method 1) Running locally:
    Prerequisites:
        - Must have python3.15 installed
    1. cd /backend
    2. pip install -r requirements.txt
    3. uvicorn app.main:app --host 0.0.0.0 --port 8000
    4. API server is running and ready to go!
(Method 2) Running using Docker container:
    Prerequisites:
        - React
    1. cd /frontend
    2. npm install && npm start
    3. Open browser and go to http://localhost:<PORT>

How to test:

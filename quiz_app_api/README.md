# Quiz App

# Requirements
1. Python 3.9.10

# Setup
1. Make sure python 3.9.10 is installed in the system either as default python version or through pyenv.
2. Navigate to root folder (folder containing manage.py)

3. Run the following commands to get started
```
1. pipenv shell
2. pip install -r requirements.txt
3. python manage.py migrate
4. python manage.py runserver
5. Server is up now on http://127.0.0.1:8000/
```

### API

1. The task is implemented as a simple Django Rest Framework API.
2. The base url is ```http://127.0.0.1:8000/```
3. API testing tools such as POSTMAN can be used to test the endpoints.

### API ENDPOINTS
1. **Submit Quiz**: ```http://127.0.0.1:8000/submit_quiz/```
The endpoint accepts a POST request with the following request body and params as json.
```
{
    "question": [
        {
            "questionText": "What is the capital of France?",
            "answerText": "answer1"
        },
        {
            "questionText": "Who is CEO of Tesla?",
            "answerText": "answer2"
        },
        {
            "questionText": "The iPhone was created by which company?",
            "answerText": "answer3"
        },
        {
            "questionText": "How many Harry Potter books are there?",
            "answerText": "answer4"
        },
        {
            "questionText": "Is Milkyway the biggest galaxy in Universe?",
            "answerText": "answer5"
        }
    ],
    "evaluatedBy": "",
    "score": "0",
    "submittedBy": "Person2"
}
```

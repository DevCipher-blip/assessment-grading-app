# quiz_app_api

Django 5.2 REST API for Goalpost. It stores written answers in SQLite and gives reviewers the Django admin for scoring.
See the [root README](../README.md) for the full setup, API examples and design notes.

```sh
python3.13 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
export DJANGO_DEBUG=true
python manage.py migrate
python manage.py seed_demo            # optional: three fictional submissions
python manage.py createsuperuser      # reviewer login for /admin/
python manage.py runserver 127.0.0.1:8000
```

Tests and lint:

```sh
DJANGO_DEBUG=true python manage.py test --settings=quiz_app_api.test_settings
ruff check . && ruff format --check .
```

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DJANGO_SQLITE_PATH=/data/db.sqlite3

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN useradd --create-home --uid 10001 app \
    && mkdir -p /data \
    && chown app /data \
    && DJANGO_SECRET_KEY=collectstatic-only python manage.py collectstatic --noinput
USER app

EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn quiz_app_api.wsgi --bind 0.0.0.0:8000 --workers 2"]

# ============================================================
# Spector Strength Backend — Hugging Face Spaces Compatible
# Port 7860 is required by Hugging Face Spaces
# ============================================================

FROM python:3.11-slim

# Install system deps needed by psycopg2 and bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user (required by Hugging Face Spaces)
RUN useradd -m -u 1000 appuser

WORKDIR /code

# Install dependencies first (layer cache optimization)
COPY --chown=appuser:appuser ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy application code
COPY --chown=appuser:appuser . /code

# Switch to non-root user
USER appuser

# Expose Hugging Face Spaces default port
EXPOSE 7860

# Run with uvicorn on port 7860 (mandatory for HF Spaces)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

"""
Auth Client — HTTP client untuk berkomunikasi dengan Auth Service.
Dilengkapi dengan retry logic dan circuit breaker.
"""
import os
import asyncio
import logging
import httpx

from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")

# =====================
# RETRY CONFIG
# =====================
MAX_RETRIES = 3
BASE_DELAY = 0.5           # 0.5 detik delay awal
TIMEOUT_SECONDS = 5.0      # Timeout per request

# Error yang layak di-retry (transient errors)
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}

# Circuit breaker instance (global — shared di seluruh app)
auth_circuit = CircuitBreaker(
    name="auth-service",
    failure_threshold=5,
    cooldown_seconds=30,
)

async def fetch_user_name_from_auth(auth_header: str, correlation_id: str = None) -> str:
    """
    Panggil Auth Service untuk mendapatkan nama user.
    Dilengkapi dengan Circuit Breaker + Retry dengan Exponential Backoff.
    """
    # Circuit breaker check
    if not auth_circuit.can_execute():
        logger.warning("Auth Service circuit breaker OPEN. Fallback to empty string.")
        return ""

    headers = {"Authorization": auth_header}
    if correlation_id:
        headers["X-Correlation-ID"] = correlation_id

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{AUTH_SERVICE_URL}/auth/me",
                    headers=headers,
                    timeout=TIMEOUT_SECONDS,
                )

            if response.status_code == 200:
                auth_circuit.record_success()
                return response.json().get("name", "")

            # Non-retryable errors
            if response.status_code in {400, 401, 403, 404}:
                auth_circuit.record_success() # Service responsif, hanya input/token yang salah
                return ""

            # Retryable server errors
            if response.status_code in RETRYABLE_STATUS_CODES:
                logger.warning(
                    f"Auth service returned {response.status_code} "
                    f"(attempt {attempt}/{MAX_RETRIES})"
                )
            else:
                logger.warning(f"Unexpected auth response: {response.status_code}")

        except httpx.ConnectError as e:
            logger.warning(f"Cannot connect to Auth Service (attempt {attempt}/{MAX_RETRIES})")
        except httpx.TimeoutException as e:
            logger.warning(f"Auth Service timeout (attempt {attempt}/{MAX_RETRIES})")
        except Exception as e:
            logger.warning(f"Unexpected error when calling Auth Service (attempt {attempt}/{MAX_RETRIES}): {e}")

        # Exponential backoff (hanya jika akan retry)
        if attempt < MAX_RETRIES:
            delay = BASE_DELAY * (2 ** (attempt - 1))
            await asyncio.sleep(delay)

    # Semua retry gagal → record failure di circuit breaker
    auth_circuit.record_failure()
    logger.error(f"Auth Service unreachable after {MAX_RETRIES} attempts")
    return ""

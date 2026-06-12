"""
Simple In-Memory Metrics Collector.
Mengumpulkan metrics dasar: request count, error count, latency.
Termasuk alerting jika error rate > 10% dalam 1 menit.
"""
import time
import threading
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

class MetricsCollector:
    """Thread-safe metrics collector."""

    def __init__(self):
        self._lock = threading.Lock()
        self.start_time = time.time()

        # Counters
        self.request_count = 0
        self.error_count = 0          # 4xx + 5xx
        self.status_counts = defaultdict(int)  # per status code

        # Latency tracking (last 1000 requests)
        self.latencies = []
        self.max_latency_samples = 1000

        # Per-endpoint stats
        self.endpoint_stats = defaultdict(lambda: {
            "count": 0,
            "errors": 0,
            "total_latency_ms": 0,
        })
        
        # Tracking recent requests untuk alert error rate (1 menit)
        self.recent_requests = []

    def _clean_old_requests(self, current_time):
        cutoff = current_time - 60
        self.recent_requests = [req for req in self.recent_requests if req[0] > cutoff]

    def record_request(self, method: str, path: str, status_code: int, duration_ms: float, correlation_id: str = None):
        """Catat satu request dan trigger alert jika perlu."""
        current_time = time.time()
        is_error = status_code >= 400
        trigger_alert = False
        recent_error_rate = 0
        recent_count = 0
        
        with self._lock:
            self.request_count += 1
            self.status_counts[status_code] += 1

            if is_error:
                self.error_count += 1

            # Latency
            self.latencies.append(duration_ms)
            if len(self.latencies) > self.max_latency_samples:
                self.latencies.pop(0)

            # Per-endpoint
            key = f"{method} {path}"
            self.endpoint_stats[key]["count"] += 1
            self.endpoint_stats[key]["total_latency_ms"] += duration_ms
            if is_error:
                self.endpoint_stats[key]["errors"] += 1
                
            # Alert Logic
            self.recent_requests.append((current_time, is_error))
            self._clean_old_requests(current_time)
            
            recent_count = len(self.recent_requests)
            recent_errors = sum(1 for req in self.recent_requests if req[1])
            recent_error_rate = (recent_errors / recent_count) if recent_count > 0 else 0
            
            # Trigger alert jika error rate > 10% dan request count >= 10
            if recent_count >= 10 and recent_error_rate > 0.10:
                trigger_alert = True

        if trigger_alert:
            logger.critical(
                f"HIGH ERROR RATE DETECTED: {recent_error_rate*100:.1f}% errors in the last 1 minute.",
                extra={
                    "alert": True,
                    "error_rate": recent_error_rate,
                    "recent_requests": recent_count,
                    "correlation_id": correlation_id
                }
            )

    def get_metrics(self) -> dict:
        """Return snapshot metrics."""
        with self._lock:
            uptime = round(time.time() - self.start_time, 1)
            error_rate = (
                round(self.error_count / self.request_count * 100, 2)
                if self.request_count > 0 else 0
            )

            # Latency percentiles
            latency_stats = {}
            if self.latencies:
                sorted_lat = sorted(self.latencies)
                n = len(sorted_lat)
                latency_stats = {
                    "p50_ms": round(sorted_lat[int(n * 0.5)], 2),
                    "p95_ms": round(sorted_lat[int(n * 0.95)], 2),
                    "p99_ms": round(sorted_lat[min(int(n * 0.99), n - 1)], 2),
                    "avg_ms": round(sum(sorted_lat) / n, 2),
                }

            # Top endpoints
            endpoints = {}
            for key, stats in self.endpoint_stats.items():
                avg_lat = (
                    round(stats["total_latency_ms"] / stats["count"], 2)
                    if stats["count"] > 0 else 0
                )
                endpoints[key] = {
                    "count": stats["count"],
                    "errors": stats["errors"],
                    "avg_latency_ms": avg_lat,
                }

            return {
                "uptime_seconds": uptime,
                "total_requests": self.request_count,
                "total_errors": self.error_count,
                "error_rate_percent": error_rate,
                "status_codes": dict(self.status_counts),
                "latency": latency_stats,
                "endpoints": endpoints,
            }

    def reset(self):
        """Reset semua metrics."""
        with self._lock:
            self.request_count = 0
            self.error_count = 0
            self.status_counts.clear()
            self.latencies.clear()
            self.endpoint_stats.clear()
            self.recent_requests.clear()

# Singleton instance
metrics = MetricsCollector()

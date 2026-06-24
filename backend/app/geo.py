"""Geospatial helpers (mirrors the app's mapUtils)."""
import math
from typing import Iterable

EARTH_RADIUS_KM = 6371.0


def haversine_km(a: tuple[float, float], b: tuple[float, float]) -> float:
    """Great-circle distance in km between two (lat, lng) pairs."""
    lat1, lng1 = a
    lat2, lng2 = b
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    sin_lat = math.sin(d_lat / 2)
    sin_lng = math.sin(d_lng / 2)
    h = (
        sin_lat * sin_lat
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * sin_lng * sin_lng
    )
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(h))


def total_path_km(points: Iterable[tuple[float, float]]) -> float:
    pts = list(points)
    if len(pts) < 2:
        return 0.0
    return sum(haversine_km(pts[i - 1], pts[i]) for i in range(1, len(pts)))


def interpolate(
    frm: tuple[float, float],
    to: tuple[float, float],
    steps: int,
    jitter: float = 0.0003,
) -> list[tuple[float, float]]:
    """Intermediate GPS points between two stops, with a slight road-curve jitter."""
    points: list[tuple[float, float]] = []
    for i in range(1, steps + 1):
        t = i / (steps + 1)
        j_lat = math.sin(i * 127.1 + frm[0] * 1000) * 0.5 * jitter
        j_lng = math.sin(i * 311.7 + frm[1] * 1000) * 0.5 * jitter
        points.append(
            (
                frm[0] + (to[0] - frm[0]) * t + j_lat,
                frm[1] + (to[1] - frm[1]) * t + j_lng,
            )
        )
    return points


def build_trail(
    stops: list[tuple[float, float]], steps_per_segment: int = 8
) -> list[tuple[float, float]]:
    """A continuous GPS breadcrumb trail through an ordered list of stops."""
    if not stops:
        return []
    trail: list[tuple[float, float]] = [stops[0]]
    for i in range(1, len(stops)):
        trail.extend(interpolate(stops[i - 1], stops[i], steps_per_segment))
        trail.append(stops[i])
    return trail

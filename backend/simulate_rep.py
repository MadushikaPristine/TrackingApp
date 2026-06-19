"""Dev helper: simulate a rep's mobile app posting GPS pings every 3 seconds.

This stands in for the rep's separate mobile app so you can watch the manager
app's live trail move in real time.

    python simulate_rep.py rep1 --interval 3
"""
import argparse
import random
import time

import urllib.error
import urllib.request
import json

API_BASE = "http://localhost:8000"
MAX_DELTA = 0.0005


def get_current(rep_id: str) -> tuple[float, float]:
    with urllib.request.urlopen(f"{API_BASE}/reps/{rep_id}/location") as r:
        data = json.loads(r.read())
    pos = data.get("currentPosition")
    if pos:
        return pos["latitude"], pos["longitude"]
    return 6.9271, 79.8612


def post_ping(rep_id: str, lat: float, lng: float) -> None:
    body = json.dumps({"latitude": lat, "longitude": lng}).encode()
    req = urllib.request.Request(
        f"{API_BASE}/reps/{rep_id}/location",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    urllib.request.urlopen(req).read()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("rep_id", help="e.g. rep1")
    parser.add_argument("--interval", type=float, default=3.0)
    args = parser.parse_args()

    lat, lng = get_current(args.rep_id)
    print(f"Starting from {lat:.5f}, {lng:.5f}")
    try:
        while True:
            lat += (random.random() - 0.38) * MAX_DELTA
            lng += (random.random() - 0.28) * MAX_DELTA
            post_ping(args.rep_id, lat, lng)
            print(f"posted {lat:.5f}, {lng:.5f}")
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()

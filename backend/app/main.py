"""FastAPI application exposing reps, routes and live GPS location endpoints."""
import os
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .geo import total_path_km
from .models import LocationPing, Rep, Route, Shop
from .schemas import (
    GeoPoint,
    LocationOut,
    LocationPingIn,
    RepOut,
    RouteOut,
    ShopOut,
)
from .seed import seed

app = FastAPI(title="TrackingApp API", version="1.0.0")

# RN apps connect from the device/emulator, so allow cross-origin requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    if os.getenv("RESET_DB") == "1":
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    from .database import SessionLocal

    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


# ── Helpers ──────────────────────────────────────────────────────────────


def _latest_position(db: Session, rep_id: str) -> LocationPing | None:
    return db.scalars(
        select(LocationPing)
        .where(LocationPing.rep_id == rep_id)
        .order_by(LocationPing.recorded_at.desc())
        .limit(1)
    ).first()


def _rep_out(db: Session, rep: Rep) -> RepOut:
    route = db.scalars(select(Route).where(Route.rep_id == rep.id)).first()
    shops = route.shops if route else []
    total = len(shops)
    visited = sum(1 for s in shops if s.visit_status == "visited")

    latest = _latest_position(db, rep.id)
    if latest is not None:
        cur_lat, cur_lng = latest.latitude, latest.longitude
    elif shops:
        cur_lat, cur_lng = shops[0].lat, shops[0].lng
    else:
        cur_lat, cur_lng = 6.9271, 79.8612

    return RepOut(
        id=rep.id,
        name=rep.name,
        avatar=rep.avatar,
        phone=rep.phone,
        zone=rep.zone,
        current_lat=cur_lat,
        current_lng=cur_lng,
        total_shops=total,
        visited_shops=visited,
        is_active=rep.is_active,
    )


# ── Endpoints ────────────────────────────────────────────────────────────


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/reps", response_model=list[RepOut])
def list_reps(db: Session = Depends(get_db)) -> list[RepOut]:
    reps = db.scalars(select(Rep)).all()
    return [_rep_out(db, rep) for rep in reps]


@app.get("/reps/{rep_id}", response_model=RepOut)
def get_rep(rep_id: str, db: Session = Depends(get_db)) -> RepOut:
    rep = db.get(Rep, rep_id)
    if rep is None:
        raise HTTPException(status_code=404, detail="Representative not found")
    return _rep_out(db, rep)


@app.get("/reps/{rep_id}/route", response_model=RouteOut)
def get_route(rep_id: str, db: Session = Depends(get_db)) -> RouteOut:
    route = db.scalars(select(Route).where(Route.rep_id == rep_id)).first()
    if route is None:
        raise HTTPException(status_code=404, detail="Route not found for representative")

    shops = sorted(route.shops, key=lambda s: s.sequence)
    polyline = [GeoPoint(latitude=s.lat, longitude=s.lng) for s in shops]

    pings = db.scalars(
        select(LocationPing)
        .where(LocationPing.rep_id == rep_id)
        .order_by(LocationPing.recorded_at.asc())
    ).all()
    history = [GeoPoint(latitude=p.latitude, longitude=p.longitude) for p in pings]

    return RouteOut(
        id=route.id,
        rep_id=route.rep_id,
        date=route.date,
        shops=[ShopOut.model_validate(s) for s in shops],
        polyline_coords=polyline,
        location_history=history,
        start_time=route.start_time,
        estimated_end_time=route.estimated_end_time,
    )


def _location_out(db: Session, rep_id: str) -> LocationOut:
    pings = db.scalars(
        select(LocationPing)
        .where(LocationPing.rep_id == rep_id)
        .order_by(LocationPing.recorded_at.asc())
    ).all()

    history = [GeoPoint(latitude=p.latitude, longitude=p.longitude) for p in pings]
    distance = total_path_km([(p.latitude, p.longitude) for p in pings])
    current = history[-1] if history else None
    last_updated = pings[-1].recorded_at if pings else None

    return LocationOut(
        current_position=current,
        history=history,
        total_distance_km=distance,
        last_updated=last_updated,
    )


@app.get("/reps/{rep_id}/location", response_model=LocationOut)
def get_location(rep_id: str, db: Session = Depends(get_db)) -> LocationOut:
    if db.get(Rep, rep_id) is None:
        raise HTTPException(status_code=404, detail="Representative not found")
    return _location_out(db, rep_id)


@app.post("/reps/{rep_id}/location", response_model=LocationOut)
def post_location(
    rep_id: str, ping: LocationPingIn, db: Session = Depends(get_db)
) -> LocationOut:
    """Record a new GPS breadcrumb. Called by the rep's mobile app."""
    if db.get(Rep, rep_id) is None:
        raise HTTPException(status_code=404, detail="Representative not found")

    db.add(
        LocationPing(
            rep_id=rep_id,
            latitude=ping.latitude,
            longitude=ping.longitude,
            recorded_at=datetime.utcnow(),
        )
    )
    db.commit()
    return _location_out(db, rep_id)

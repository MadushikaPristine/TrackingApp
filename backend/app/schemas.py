"""Pydantic schemas. JSON is emitted in camelCase to match the RN app types."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class GeoPoint(CamelModel):
    latitude: float
    longitude: float


class ShopOut(CamelModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float
    visit_status: str
    visit_time: str | None = None
    order_amount: int | None = None
    notes: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    sequence: int


class RepOut(CamelModel):
    id: str
    name: str
    avatar: str
    phone: str
    zone: str
    current_lat: float
    current_lng: float
    total_shops: int
    visited_shops: int
    is_active: bool


class RouteOut(CamelModel):
    id: str
    rep_id: str
    date: str
    shops: list[ShopOut]
    polyline_coords: list[GeoPoint]
    location_history: list[GeoPoint]
    start_time: str
    estimated_end_time: str


class LocationPingIn(CamelModel):
    latitude: float
    longitude: float


class LocationOut(CamelModel):
    current_position: GeoPoint | None
    history: list[GeoPoint]
    total_distance_km: float
    last_updated: datetime | None

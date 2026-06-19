"""SQLAlchemy ORM models for reps, routes, shops and GPS location pings."""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Rep(Base):
    __tablename__ = "reps"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    avatar: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    zone: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    routes: Mapped[list["Route"]] = relationship(
        back_populates="rep", cascade="all, delete-orphan"
    )
    pings: Mapped[list["LocationPing"]] = relationship(
        back_populates="rep", cascade="all, delete-orphan"
    )


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    rep_id: Mapped[str] = mapped_column(ForeignKey("reps.id"), nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    start_time: Mapped[str] = mapped_column(String, nullable=False)
    estimated_end_time: Mapped[str] = mapped_column(String, nullable=False)

    rep: Mapped["Rep"] = relationship(back_populates="routes")
    shops: Mapped[list["Shop"]] = relationship(
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="Shop.sequence",
    )


class Shop(Base):
    __tablename__ = "shops"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    route_id: Mapped[str] = mapped_column(ForeignKey("routes.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    visit_status: Mapped[str] = mapped_column(String, nullable=False)
    visit_time: Mapped[str | None] = mapped_column(String, nullable=True)
    order_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String, nullable=True)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)

    route: Mapped["Route"] = relationship(back_populates="shops")


class LocationPing(Base):
    """A single GPS breadcrumb posted by the rep's mobile app."""

    __tablename__ = "location_pings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rep_id: Mapped[str] = mapped_column(ForeignKey("reps.id"), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    rep: Mapped["Rep"] = relationship(back_populates="pings")
